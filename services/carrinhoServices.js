import mysql from 'mysql2/promise';
import { deduzirPontos } from './pontosServices.js';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Processa um carrinho de compras.
 * Retorna { comprados: [{id, nome, custo}], erros: [{produto_id, msg}], saldo_restante }
 */
export async function processarCarrinho(aluno_id, produto_ids) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Verifica bloqueios uma única vez
        const [aluno] = await connection.execute(
            'SELECT pode_comprar FROM alunos WHERE id = ?',
            [aluno_id]
        );
        if (aluno.length === 0) throw new Error('ALUNO_NAO_ENCONTRADO');
        if (!aluno[0].pode_comprar) throw new Error('BLOQUEADO_PELO_RESPONSAVEL');

        const [ocorrencias] = await connection.execute(
            `SELECT COUNT(*) as total FROM avaliacoes av
             WHERE av.aluno_id = ? AND av.consentido = 0
             AND (av.pontos <= 10 OR av.valor IN ('bagunça','desmotivado','não entregou','conflituante','isolado','desinteressado','indiferente','atrasado'))`,
            [aluno_id]
        );
        if (ocorrencias[0].total > 0) throw new Error('OCORRENCIAS_PENDENTES');

        const idsUnicos = [...new Set(produto_ids)];
        const comprados = [];
        const erros = [];
        let saldoFinal = null;

        for (const produto_id of idsUnicos) {
            const [produtos] = await connection.execute(
                'SELECT id, nome, custo_pontos FROM produtos WHERE id = ?',
                [produto_id]
            );
            if (produtos.length === 0) {
                erros.push({ produto_id, msg: 'Produto não encontrado' });
                continue;
            }
            const p = produtos[0];
            try {
                // Usa a função existente de deduzir pontos (abre sua própria conexão)
                const novoSaldo = await deduzirPontos(aluno_id, p.custo_pontos);
                await connection.execute(
                    'INSERT INTO compras (aluno_id, produto_id, custo_pontos, autorizado_por) VALUES (?, ?, ?, ?)',
                    [aluno_id, produto_id, p.custo_pontos, null]
                );
                comprados.push({ id: p.id, nome: p.nome, custo: p.custo_pontos });
                saldoFinal = novoSaldo;
            } catch (e) {
                if (e.message === 'SALDO_INSUFICIENTE') {
                    erros.push({ produto_id, msg: `Saldo insuficiente para "${p.nome}"` });
                } else {
                    erros.push({ produto_id, msg: e.message });
                }
            }
        }

        return { comprados, erros, saldo_restante: saldoFinal };
    } finally {
        await connection.end();
    }
}
