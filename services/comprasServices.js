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
                c.produto_id,
                p.nome AS produto_nome,
                c.custo_pontos,
                c.autorizado_por,
                r.nome AS responsavel_nome,
                c.criado_em,
                c.entregue
            FROM compras c
            JOIN alunos a ON c.aluno_id = a.id
            JOIN produtos p ON c.produto_id = p.id
            LEFT JOIN responsaveis r ON c.autorizado_por = r.id
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
