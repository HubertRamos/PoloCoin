import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Mapeia cada tabela para o nome da coluna de identificação.
 * admins / professores usam 'name'; alunos / responsaveis usam 'nome'.
 */
const COLUNA_NOME = {
    admins: 'name',
    professores: 'name',
    alunos: 'nome',
    responsaveis: 'nome',
};

/**
 * Busca um usuário por nome e senha em uma tabela específica.
 * Retorna o registro (id, nome) ou null se não encontrar.
 * Nunca lança erro — falhas de DB são silenciadas e retornam null.
 */
async function buscarPorNomeESenha(tabela, name, password) {
    const coluna = COLUNA_NOME[tabela] || 'name';
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            `SELECT id, ${coluna} FROM ${tabela} WHERE ${coluna} = ? AND password = ?`,
            [name, password]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        // Falha de DB (conexão, tabela inexistente, coluna errada...)
        // Não propagamos — retornamos null para que a criação prossiga.
        return null;
    } finally {
        await connection.end();
    }
}

/**
 * Login unificado: verifica nas 4 tabelas (admins, professores, alunos, responsaveis)
 * na ordem e retorna o primeiro match com o tipo de usuário.
 * Retorna null se nenhum usuário for encontrado — nunca lança.
 */
export async function login(nome, senha, tipo) {
    if (!nome || !senha || !tipo) {
        return null;
    }

    const nomeLimpo = nome.trim();
    const senhaLimpa = senha.trim();

    // Só verifica a tabela correspondente ao tipo escolhido
    const mapa = {
        adm: 'admins',
        professor: 'professores',
        aluno: 'alunos',
        responsavel: 'responsaveis',
    };

    const tabela = mapa[tipo];
    if (!tabela) return null;

    const coluna = COLUNA_NOME[tabela] || 'name';

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            `SELECT id, ${coluna} FROM ${tabela} WHERE ${coluna} = ? AND password = ?`,
            [nomeLimpo, senhaLimpa]
        );
        if (rows.length > 0) {
            return { id: rows[0].id, name: rows[0][coluna], tipo };
        }
        return null;
    } catch (err) {
        return null;
    } finally {
        await connection.end();
    }
}
