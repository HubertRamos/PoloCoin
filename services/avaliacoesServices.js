import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Cria uma nova avaliação para um aluno.
 * @param {number} alunoId
 * @param {number} professorId — id do professor logado
 * @param {string} categoria — ex: "comportamento", "comprometimento", "social", "entrega", "observacao"
 * @param {string} valor — ex: "produtivo", "bagunça", "atrasado", ou texto livre
 * @param {string} [observacao] — texto adicional (usado principalmente na categoria observacao)
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
        return { id: result.insertId, aluno_id: alunoIdNum, professor_id: professorIdNum, categoria, valor, pontos: pontosNum, observacao: observacao || null };
    } finally {
        await connection.end();
    }
}

/**
 * Puxa todas as avaliações de um aluno, ordenadas por data (mais recente primeiro).
 */
export async function puxarAvaliacoesPorAluno(alunoId) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            `SELECT id, categoria, valor, pontos, observacao, DATE(criado_em) AS data, TIME(criado_em) AS hora
             FROM avaliacoes
             WHERE aluno_id = ?
             ORDER BY criado_em DESC`,
            [Number(alunoId)]
        );
        return rows;
    } finally {
        await connection.end();
    }
}
