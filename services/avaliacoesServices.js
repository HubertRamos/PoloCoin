import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

import { creditarPontos } from './pontosServices.js';

/**
 * Cria uma nova avaliação para um aluno.
 * Se os pontos forem positivos, credita automaticamente na conta do aluno.
 */
export async function criarAvaliacao(alunoId, professorId, categoria, valor, pontos = 0, observacao = '') {
    if (!alunoId || !professorId || !categoria || !valor) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const alunoIdNum = Number(alunoId);
    const professorIdNum = Number(professorId);
    const pontosNum = Number(pontos) || 0;

    if (!alunoIdNum || !professorIdNum) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            `INSERT INTO avaliacoes (aluno_id, professor_id, categoria, valor, pontos, observacao)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [alunoIdNum, professorIdNum, categoria, valor, pontosNum, observacao || null]
        );

        // Se pontos positivos, credita automaticamente na conta do aluno
        if (pontosNum > 0) {
            await creditarPontos(alunoIdNum, pontosNum);
        }

        return { id: result.insertId, aluno_id: alunoIdNum, professor_id: professorIdNum, categoria, valor, pontos: pontosNum, observacao: observacao || null };
    } finally {
        await connection.end();
    }
}

/**
 * Puxa todas as avaliações de um aluno, ordenadas por data (mais recente primeiro).
 */
export async function puxarAvaliacoesPorAluno(alunoId, professorId = null) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        let query = `
            SELECT id, professor_id, categoria, valor, pontos, observacao, DATE(criado_em) AS data, TIME(criado_em) AS hora
            FROM avaliacoes
            WHERE aluno_id = ?
        `;
        const params = [Number(alunoId)];

        if (professorId) {
            query += ` AND professor_id = ?`;
            params.push(Number(professorId));
        }

        query += ` ORDER BY criado_em DESC`;

        const [rows] = await connection.execute(query, params);
        return rows;
    } finally {
        await connection.end();
    }
}
