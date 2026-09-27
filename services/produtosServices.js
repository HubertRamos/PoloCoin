import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/** Busca todos os produtos com categoria. */
export async function puxarTodosProdutos() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT
                p.id,
                p.nome,
                p.custo_pontos,
                p.categoria_id,
                c.nome AS categoria_nome
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.id DESC
        `);
        return rows;
    } finally {
        await connection.end();
    }
}

/** Busca produtos com filtros (categoria e/ou busca por nome). */
export async function puxarProdutosFiltrados({ categoria = null, busca = null } = {}) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        let sql = `
            SELECT
                p.id,
                p.nome,
                p.custo_pontos,
                p.categoria_id,
                c.nome AS categoria_nome
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `;
        const conditions = [];
        const params = [];

        if (categoria) {
            conditions.push('c.nome = ?');
            params.push(categoria);
        }
        if (busca && busca.trim()) {
            conditions.push('p.nome LIKE ?');
            params.push(`%${busca.trim()}%`);
        }

        if (conditions.length) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY p.id DESC';

        const [rows] = await connection.execute(sql, params);
        return rows;
    } finally {
        await connection.end();
    }
}

/** Retorna lista de categorias para o filtro. */
export async function puxarCategoriasParaFiltro() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'SELECT id, nome FROM categorias ORDER BY nome'
        );
        return rows;
    } finally {
        await connection.end();
    }
}

/** Cria um novo produto. */
export async function criarProduto(nome, preco, categoria_id = null) {
    if (!nome || !preco) throw new Error('CAMPOS_VAZIOS');
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [result] = await connection.execute(
            'INSERT INTO produtos (nome, custo_pontos, categoria_id) VALUES (?, ?, ?)',
            [nome.trim(), parseInt(preco), categoria_id]
        );
        return { id: result.insertId, nome, custo_pontos: parseInt(preco), categoria_id };
    } finally {
        await connection.end();
    }
}

/** Busca todas as categorias. */
export async function puxarTodasCategorias() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute('SELECT id, nome FROM categorias ORDER BY nome');
        return rows;
    } finally {
        await connection.end();
    }
}

/** Cria categoria se não existir. */
export async function criarCategoriaSeNecesaria(nome) {
    if (!nome) return null;
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [existing] = await connection.execute(
            'SELECT id FROM categorias WHERE nome = ?',
            [nome.trim()]
        );
        if (existing.length > 0) return existing[0].id;
        const [result] = await connection.execute(
            'INSERT INTO categorias (nome) VALUES (?)',
            [nome.trim()]
        );
        return result.insertId;
    } finally {
        await connection.end();
    }
}

/** Garante que as categorias básicas existam. */
export async function garantirCategoriasBasicas() {
    const categorias = [
        'Alimentação', 'Beleza', 'Vestuário', 'Limpeza',
        'Eletrônicos', 'Brinquedos', 'Outros'
    ];
    const connection = await mysql.createConnection(dbConfig);
    try {
        for (const nome of categorias) {
            const [existing] = await connection.execute(
                'SELECT id FROM categorias WHERE nome = ?',
                [nome]
            );
            if (existing.length === 0) {
                await connection.execute('INSERT INTO categorias (nome) VALUES (?)', [nome]);
            }
        }
    } finally {
        await connection.end();
    }
}
