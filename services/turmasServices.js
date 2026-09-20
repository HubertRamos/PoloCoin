import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

export async function criarTurma(serie, turma) {
    const serieLimpa = serie ? Number(serie) : null;
    const turmaLimpa = turma ? turma.trim().toUpperCase() : '';

    if (!serieLimpa || !turmaLimpa) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        // Verifica se a turma já existe no banco (mesma série e mesma turma, ex: 3 e 'A')
        const [existente] = await connection.execute(
            'SELECT id FROM turmas WHERE serie = ? AND turma = ?', 
            [serieLimpa, turmaLimpa]
        );

        if (existente.length > 0) {
            throw new Error('DUPLICADO');
        }

        // Insere se não existir
        const sql = 'INSERT INTO turmas (serie, turma) VALUES (?, ?)';
        await connection.execute(sql, [serieLimpa, turmaLimpa]);
    } finally {
        await connection.end();
    }
}

export async function puxarTurmas() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SELECT id, serie, turma FROM turmas ORDER BY serie, turma');
        return rows;
    } finally {
        await connection.end();
    }
}

