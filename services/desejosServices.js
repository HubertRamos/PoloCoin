import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Adiciona um desejo à lista do aluno.
 */
export async function adicionarDesejo(alunoId, produtoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Verifica se já existe esse desejo
        const [existing] = await connection.execute(
            'SELECT id FROM desejos WHERE aluno_id = ? AND produto_id = ?',
            [alunoId, produtoId]
        );
        if (existing.length > 0) {
            throw new Error('DESEJO_EXISTENTE');
        }

        const [result] = await connection.execute(
            'INSERT INTO desejos (aluno_id, produto_id) VALUES (?, ?)',
            [alunoId, produtoId]
        );
        return result.insertId;
    } finally {
        await connection.end();
    }
}

/**
 * Remove e processa um desejo como compra (autorizado pelo pai).
 * Verifica se o aluno tem pontos suficientes, desconta e remove o desejo.
 */
export async function processarDesejoComoCompra(alunoId, produtoId, autorizadoPor = null) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Começa transação
        await connection.beginTransaction();

        // Busca o produto
        const [produtos] = await connection.execute(
            'SELECT id, nome, custo_pontos FROM produtos WHERE id = ?',
            [produtoId]
        );
        if (produtos.length === 0) {
            throw new Error('PRODUTO_NAO_ENCONTRADO');
        }
        const produto = produtos[0];

        // Busca o aluno
        const [aluno] = await connection.execute(
            'SELECT id, pontos, turma_id FROM alunos WHERE id = ?',
            [alunoId]
        );
        if (aluno.length === 0) {
            throw new Error('ALUNO_NAO_ENCONTRADO');
        }
        const alunoIdInt = Number(alunoId);
        const custo = Number(produto.custo_pontos);

        if (aluno[0].pontos < custo) {
            throw new Error('SALDO_INSUFICIENTE');
        }

        // Deduz pontos
        await connection.execute(
            'UPDATE alunos SET pontos = pontos - ? WHERE id = ?',
            [custo, alunoIdInt]
        );

        // Remove o desejo
        await connection.execute(
            'DELETE FROM desejos WHERE aluno_id = ? AND produto_id = ?',
            [alunoIdInt, produtoId]
        );

        await connection.commit();

        // Registra a compra na tabela de histórico
        await connection.execute(
            'INSERT INTO compras (aluno_id, produto_id, custo_pontos, autorizado_por) VALUES (?, ?, ?, ?)',
            [alunoIdInt, produtoId, custo, autorizadoPor]
        );

        const [novoAluno] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoIdInt]
        );

        return {
            produto: { nome: produto.nome, custo_pontos: custo },
            saldo_restante: Number(novoAluno[0].pontos),
            message: 'Pedido realizado com sucesso!'
        };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        await connection.end();
    }
}

/**
 * Busca os desejos de um aluno.
 */
export async function puxarDesejosDoAluno(alunoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT d.id, d.aluno_id, d.produto_id, d.criado_em,
                   p.nome AS produto_nome, p.custo_pontos
            FROM desejos d
            JOIN produtos p ON d.produto_id = p.id
            WHERE d.aluno_id = ?
            ORDER BY d.criado_em DESC
        `, [alunoId]);
        return rows;
    } finally {
        await connection.end();
    }
}
