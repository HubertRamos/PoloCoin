import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Busca um professor pelo ID e retorna nome e senha atuais.
 * Retorna null se não encontrado.
 */
export async function buscarProfessorPorId(id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'SELECT id, name, password FROM professores WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error('Erro ao buscar professor:', err);
        return null;
    } finally {
        await connection.end();
    }
}

/**
 * Atualiza a senha de um professor pelo ID.
 * Retorna true se atualizado, false se não encontrado.
 */
export async function atualizarSenhaProfessor(id, novaSenha) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            'UPDATE professores SET password = ? WHERE id = ?',
            [novaSenha, id]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Erro ao atualizar senha:', err);
        return false;
    } finally {
        await connection.end();
    }
}
