import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Busca todas as compras registradas com detalhes do aluno, produto e responsável.
 */
export async function puxarTodasCompras() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT
                c.id,
                c.aluno_id,
                a.nome AS aluno_nome,
                a.turma_id,
                t.serie,
                t.turma,
                CONCAT(t.serie, t.turma) AS turma_nome,
                c.produto_id,
                p.nome AS produto_nome,
                p.categoria_id,
                cat.nome AS categoria_nome,
                c.custo_pontos,
                c.autorizado_por,
                r.nome AS responsavel_nome,
                c.criado_em,
                c.entregue
            FROM compras c
            JOIN alunos a ON c.aluno_id = a.id
            JOIN produtos p ON c.produto_id = p.id
            LEFT JOIN categorias cat ON p.categoria_id = cat.id
            LEFT JOIN responsaveis r ON c.autorizado_por = r.id
            LEFT JOIN turmas t ON a.turma_id = t.id
            ORDER BY c.criado_em DESC
        `);
        return rows;
    } finally {
        await connection.end();
    }
}

/**
 * Marca uma compra como entregue.
 */
export async function marcarEntrega(compraId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            'UPDATE compras SET entregue = 1 WHERE id = ?',
            [compraId]
        );
        return result.affectedRows > 0;
    } finally {
        await connection.end();
    }
}

/**
 * Busca o histórico de vendas dos últimos 7 dias.
 * Útil para painel de vendas e relatórios.
 */
export async function puxarHistoricoVendas() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT
                c.id,
                c.aluno_id,
                a.nome AS aluno_nome,
                c.produto_id,
                p.nome AS produto_nome,
                p.categoria_id,
                cat.nome AS categoria_nome,
                c.custo_pontos,
                c.autorizado_por,
                r.nome AS responsavel_nome,
                c.criado_em,
                c.entregue
            FROM compras c
            JOIN alunos a ON c.aluno_id = a.id
            JOIN produtos p ON c.produto_id = p.id
            LEFT JOIN categorias cat ON p.categoria_id = cat.id
            LEFT JOIN responsaveis r ON c.autorizado_por = r.id
            WHERE c.criado_em >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY c.criado_em DESC
        `);
        return rows;
    } finally {
        await connection.end();
    }
}

/**
 * Remove compras com mais de 7 dias registradas.
 * Retorna o número de registros removidos.
 * Útil para limpeza automática periódica do histórico.
 */
export async function limparHistoricoAntigo() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            'DELETE FROM compras WHERE criado_em < DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        return result.affectedRows;
    } finally {
        await connection.end();
    }
}
