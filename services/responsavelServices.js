import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

export async function puxarAlunosDoResponsavel(responsavelId) {
    if (!responsavelId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT 
                a.id,
                a.nome AS aluno_nome,
                a.password AS aluno_senha,
                t.serie,
                t.turma
            FROM alunos a
            JOIN turmas t ON a.turma_id = t.id
            WHERE a.responsavel_id = ?
            ORDER BY a.nome
        `, [responsavelId]);
        
        return rows;
    } finally {
        await connection.end();
    }
}
