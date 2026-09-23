import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Retorna o saldo atual de pontos de um aluno.
 */
export async function getSaldoPontos(alunoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoId]
        );
        return rows.length > 0 ? rows[0].pontos : 0;
    } finally {
        await connection.end();
    }
}

/**
 * Adiciona pontos à conta do aluno (ex: avaliação positiva).
 */
export async function creditarPontos(alunoId, quantidade) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(
            'UPDATE alunos SET pontos = pontos + ? WHERE id = ?',
            [quantidade, alunoId]
        );
        const [rows] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoId]
        );
        return rows.length > 0 ? rows[0].pontos : 0;
    } finally {
        await connection.end();
    }
}

/**
 * Remove pontos da conta do aluno (ex: compra).
 * Retorna o novo saldo.
 * Lança erro se saldo insuficiente.
 */
export async function deduzirPontos(alunoId, quantidade) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoId]
        );
        if (rows.length === 0) {
            throw new Error('ALUNO_NAO_ENCONTRADO');
        }
        const saldo = rows[0].pontos;
        if (saldo < quantidade) {
            throw new Error('SALDO_INSUFICIENTE');
        }

        await connection.execute(
            'UPDATE alunos SET pontos = pontos - ? WHERE id = ?',
            [quantidade, alunoId]
        );

        const [novo] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoId]
        );
        return novo.length > 0 ? novo[0].pontos : 0;
    } finally {
        await connection.end();
    }
}
