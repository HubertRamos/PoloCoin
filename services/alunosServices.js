import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

export async function criarAlunoComResponsavel(turmaId, nomeAluno, senhaAluno, senhaResponsavel) {
    const alunoNomeLimpo = nomeAluno ? nomeAluno.trim() : '';
    const alunoSenhaLimpa = senhaAluno ? senhaAluno.trim() : '';
    const respSenhaLimpa = senhaResponsavel ? senhaResponsavel.trim() : '';

    if (!turmaId || !alunoNomeLimpo || !alunoSenhaLimpa || !respSenhaLimpa) {
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

        // 2. Cria o nome do responsável automaticamente
        const nomeResponsavelAutomatico = `Responsável de ${alunoNomeLimpo}`;

        // 3. Insere o responsável na tabela responsaveis
        const [respResult] = await connection.execute(
            'INSERT INTO responsaveis (nome, password) VALUES (?, ?)',
            [nomeResponsavelAutomatico, respSenhaLimpa]
        );
        const responsavelId = respResult.insertId;

        // 4. Insere o aluno vinculado à turma e ao responsável
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

