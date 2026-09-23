import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Busca desejos pendentes de um aluno.
 */
export async function puxarDesejosDoAluno(alunoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT d.id, d.aluno_id, d.produto_id, d.criado_em,
                   p.nome AS produto_nome, p.custo_pontos
            FROM desejos d
            JOIN produtos p ON d.produto_id = p.id
            WHERE d.aluno_id = ?
            ORDER BY d.criado_em DESC
        `, [alunoId]);
        return rows;
    } finally {
        await connection.end();
    }
}

/**
 * Adiciona um desejo à lista do aluno.
 */
export async function adicionarDesejo(alunoId, produtoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Verifica se já existe esse desejo
        const [existing] = await connection.execute(
            'SELECT id FROM desejos WHERE aluno_id = ? AND produto_id = ?',
            [alunoId, produtoId]
        );
        if (existing.length > 0) {
            throw new Error('DESEJO_EXISTENTE');
        }

        const [result] = await connection.execute(
            'INSERT INTO desejos (aluno_id, produto_id) VALUES (?, ?)',
            [alunoId, produtoId]
        );
        return { id: result.insertId, aluno_id: alunoId, produto_id: produtoId };
    } finally {
        await connection.end();
    }
}

/**
 * Busca todos os filhos de um responsável com seus saldos.
 */
export async function getFilhosComSaldos(responsavelId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT a.id, a.nome, a.pontos, a.pode_comprar, a.turma_id,
                   t.serie, t.turma
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

/**
 * Busca os desejos de todos os filhos de um responsável.
 */
export async function getDesejosDosFilhos(responsavelId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [filhos] = await connection.execute(
            'SELECT id, nome FROM alunos WHERE responsavel_id = ?',
            [responsavelId]
        );

        const resultado = [];
        for (const filho of filhos) {
            const desejos = await puxarDesejosDoAluno(filho.id);
            resultado.push({
                aluno: filho,
                desejos: desejos
            });
        }
        return resultado;
    } finally {
        await connection.end();
    }
}

/**
 * Converte um desejo em compra real.
 * Verifica se o aluno tem saldo, desconta e remove o desejo.
 */
export async function comprarDesejo(alunoId, produtoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // Busca o produto
        const [produtos] = await connection.execute(
            'SELECT id, nome, custo_pontos FROM produtos WHERE id = ?',
            [produtoId]
        );
        if (produtos.length === 0) {
            throw new Error('PRODUTO_NAO_ENCONTRADO');
        }
        const produto = produtos[0];

        // Verifica e desconta pontos
        const [aluno] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoId]
        );
        if (aluno.length === 0) {
            throw new Error('ALUNO_NAO_ENCONTRADO');
        }
        if (aluno[0].pontos < produto.custo_pontos) {
            throw new Error('SALDO_INSUFICIENTE');
        }

        // Deduz pontos
        await connection.execute(
            'UPDATE alunos SET pontos = pontos - ? WHERE id = ?',
            [produto.custo_pontos, alunoId]
        );

        // Remove o desejo
        await connection.execute(
            'DELETE FROM desejos WHERE aluno_id = ? AND produto_id = ?',
            [alunoId, produtoId]
        );

        // Retorna novo saldo e dados da compra
        const [novoAluno] = await connection.execute(
            'SELECT pontos FROM alunos WHERE id = ?',
            [alunoId]
        );

        return {
            produto: { nome: produto.nome, custo_pontos: produto.custo_pontos },
            saldo_restante: novoAluno.length > 0 ? novoAluno[0].pontos : 0,
            message: 'Pedido realizado com sucesso!'
        };
    } finally {
        await connection.end();
    }
}
