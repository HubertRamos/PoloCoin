import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

export async function puxarTurmasDoProfessor(professorId) {
    if (!professorId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT pt.professor_id, pt.turma_id, t.serie, t.turma
            FROM professor_turmas pt
            JOIN turmas t ON pt.turma_id = t.id
            WHERE pt.professor_id = ?
        `, [professorId]);

        return rows;
    } finally {
        await connection.end();
    }
}

export async function puxarTodasTurmas() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT id, serie, turma FROM turmas
        `);

        return rows;
    } finally {
        await connection.end();
    }
}

export async function vincularTurmaProfessor(professorId, turmaId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(
            'INSERT IGNORE INTO professor_turmas (professor_id, turma_id) VALUES (?, ?)',
            [professorId, turmaId]
        );

        return { success: true, message: 'Turma vinculada com sucesso!' };
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}

export async function desvincularTurmaProfessor(professorId, turmaId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            'DELETE FROM professor_turmas WHERE professor_id = ? AND turma_id = ?',
            [professorId, turmaId]
        );

        return { success: true, message: 'Turma desvinculada com sucesso!' };
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}
