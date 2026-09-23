import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

export async function criarAlunoComResponsavel(turmaId, nomeAluno, nomeResponsavel, senhaAluno, senhaResponsavel) {
    const alunoNomeLimpo = nomeAluno ? nomeAluno.trim() : '';
    const respNomeLimpo = nomeResponsavel ? nomeResponsavel.trim() : '';
    const alunoSenhaLimpa = senhaAluno ? senhaAluno.trim() : '';
    const respSenhaLimpa = senhaResponsavel ? senhaResponsavel.trim() : '';

    if (!turmaId || !alunoNomeLimpo || !respNomeLimpo || !alunoSenhaLimpa || !respSenhaLimpa) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
        await connection.beginTransaction();

        // 1. Verifica se o aluno já existe nesta turma
        const [alunoExistente] = await connection.execute(
            'SELECT id FROM alunos WHERE turma_id = ? AND nome = ?', 
            [turmaId, alunoNomeLimpo]
        );

        if (alunoExistente.length > 0) {
            throw new Error('DUPLICADO');
        }

        // 2. Verifica se o responsável já existe (evita duplicação)
        const [respExistente] = await connection.execute(
            'SELECT id FROM responsaveis WHERE nome = ?',
            [respNomeLimpo]
        );

        let responsavelId;
        if (respExistente.length > 0) {
            // Reutiliza o ID do responsável existente
            responsavelId = respExistente[0].id;
        } else {
            // Cria novo responsável
            const [respResult] = await connection.execute(
                'INSERT INTO responsaveis (nome, password) VALUES (?, ?)',
                [respNomeLimpo, respSenhaLimpa]
            );
            responsavelId = respResult.insertId;
        }

        // 3. Insere o aluno vinculado à turma e ao responsável
        await connection.execute(
            'INSERT INTO alunos (turma_id, responsavel_id, nome, password) VALUES (?, ?, ?, ?)',
            [turmaId, responsavelId, alunoNomeLimpo, alunoSenhaLimpa]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

export async function puxarAlunosPorTurma(turmaId) {
    if (!turmaId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT 
                a.id, 
                a.nome AS aluno_nome, 
                r.nome AS responsavel_nome 
            FROM alunos a
            JOIN responsaveis r ON a.responsavel_id = r.id
            WHERE a.turma_id = ? 
            ORDER BY a.nome
        `, [turmaId]);

        return rows;
    } finally {
        await connection.end();
    }
}

/**
 * Busca avaliações (ocorrências) de um aluno específico.
 */
export async function puxarAvaliacoesDoAluno(alunoId) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT
                av.id AS avaliacao_id,
                av.categoria,
                av.valor,
                av.pontos,
                av.observacao,
                DATE(av.criado_em) AS data,
                TIME(av.criado_em) AS hora,
                t.serie,
                t.turma,
                al.nome AS aluno_nome
            FROM avaliacoes av
            JOIN alunos al ON av.aluno_id = al.id
            JOIN turmas t ON al.turma_id = t.id
            WHERE av.aluno_id = ?
            ORDER BY av.criado_em DESC
        `, [alunoId]);

        return rows;
    } finally {
        await connection.end();
    }
}

/**
 * Atualiza a senha de um aluno.
 */
export async function atualizarSenhaAluno(alunoId, senhaAtual, novaSenha) {
    if (!alunoId || !novaSenha) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        // Verifica senha atual se fornecida
        if (senhaAtual) {
            const [aluno] = await connection.execute(
                'SELECT password FROM alunos WHERE id = ?',
                [alunoId]
            );
            if (aluno.length === 0) {
                throw new Error('ALUNO_NAO_ENCONTRADO');
            }
            if (aluno[0].password !== senhaAtual) {
                throw new Error('SENHA_ATUAL_INVALIDA');
            }
        }

        // Atualiza a senha
        await connection.execute(
            'UPDATE alunos SET password = ? WHERE id = ?',
            [novaSenha.trim(), alunoId]
        );

        return { success: true };
    } finally {
        await connection.end();
    }
}

