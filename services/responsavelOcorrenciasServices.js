import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

/**
 * Busca ocorrências negativas de todos os alunos de um responsável.
 * Considera negativo: pontos <= 10 ou valor em lista de valores negativos.
 */
export async function puxarOcorrenciasNegativasDoResponsavel(responsavelId) {
    if (!responsavelId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const valoresNegativos = [
        'bagunça', 'desmotivado', 'não entregou', 'conflituante',
        'isolado', 'desinteressado', 'indiferente', 'atrasado'
    ];

    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(`
            SELECT
                al.id AS aluno_id,
                al.nome AS aluno_nome,
                av.id AS avaliacao_id,
                av.categoria,
                av.valor,
                av.pontos,
                av.observacao,
                DATE(av.criado_em) AS data,
                TIME(av.criado_em) AS hora,
                t.serie,
                t.turma
            FROM alunos al
            JOIN responsaveis r ON al.responsavel_id = r.id
            JOIN avaliacoes av ON al.id = av.aluno_id
            JOIN turmas t ON al.turma_id = t.id
            WHERE r.id = ?
              AND av.consentido = 0
              AND (av.pontos <= 10 OR av.valor IN (${valoresNegativos.map(() => '?').join(',')}))
            ORDER BY av.criado_em DESC
        `, [responsavelId, ...valoresNegativos]);

        return rows;
    } finally {
        await connection.end();
    }
}

/**
 * Marca uma avaliação como consentida pelo responsável.
 */
export async function marcarComoConsentida(avaliacaoId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(
            'UPDATE avaliacoes SET consentido = 1 WHERE id = ?',
            [avaliacaoId]
        );
    } finally {
        await connection.end();
    }
}
