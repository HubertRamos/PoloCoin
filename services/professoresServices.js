import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

export async function criarProfessor(name, password) {
    // Remove espaços excedentes do começo e do fim
    const nomeLimpo = name ? name.trim() : '';
    const senhaLimpa = password ? password.trim() : '';

    if (!nomeLimpo || !senhaLimpa) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        // Verifica se o professor já existe no banco
        const [existente] = await connection.execute(
            'SELECT id FROM professores WHERE name = ?', 
            [nomeLimpo]
        );

        if (existente.length > 0) {
            throw new Error('DUPLICADO');
        }

        // Insere se não existir
        const sql = 'INSERT INTO professores (name, password) VALUES (?, ?)';
        await connection.execute(sql, [nomeLimpo, senhaLimpa]);
    } finally {
        await connection.end();
    }
}



export async function puxarProfessores() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SELECT id, name FROM professores');
        return rows;
    } finally {
        await connection.end();
    }
}
