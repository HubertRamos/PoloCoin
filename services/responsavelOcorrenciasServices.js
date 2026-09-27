import { supabase } from '../config/supabase.js';

/**
 * Busca ocorrências negativas de todos os alunos de um responsável.
 * Considera negativo: pontos <= 10 ou valor em lista de valores negativos.
 * Usa booleano false para 'consentido'.
 */
export async function puxarOcorrenciasNegativasDoResponsavel(responsavelId) {
    if (!responsavelId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const valoresNegativos = [
        'bagunça', 'desmotivado', 'não entregou', 'conflituante',
        'isolado', 'desinteressado', 'indiferente', 'atrasado'
    ];

    // 1. Busca os alunos do responsável
    const { data: alunos, error: errAlunos } = await supabase
        .from('alunos')
        .select(`
            id,
            nome,
            turmas (
                serie,
                turma
            )
        `)
        .eq('responsavel_id', Number(responsavelId));

    if (errAlunos) {
        throw new Error(errAlunos.message);
    }
    if (!alunos || alunos.length === 0) return [];

    const alunoIds = alunos.map(a => a.id);
    const alunoMap = new Map(alunos.map(a => [a.id, a]));

    // 2. Busca avaliações não consentidas desses alunos
    const { data: avaliacoes, error: errAv } = await supabase
        .from('avaliacoes')
        .select('id, aluno_id, categoria, valor, pontos, observacao, criado_em, consentido')
        .in('aluno_id', alunoIds)
        .eq('consentido', false)
        .order('criado_em', { ascending: false });

    if (errAv) {
        throw new Error(errAv.message);
    }

    const rows = [];
    for (const av of (avaliacoes || [])) {
        const isNegativo = (av.pontos !== null && av.pontos <= 10) || valoresNegativos.includes(av.valor);
        if (!isNegativo) continue;

        const aluno = alunoMap.get(av.aluno_id);
        const turma = aluno?.turmas ? (Array.isArray(aluno.turmas) ? aluno.turmas[0] : aluno.turmas) : null;
        const ts = av.criado_em ? new Date(av.criado_em) : null;

        rows.push({
            aluno_id: av.aluno_id,
            aluno_nome: aluno?.nome ?? null,
            avaliacao_id: av.id,
            categoria: av.categoria,
            valor: av.valor,
            pontos: av.pontos,
            observacao: av.observacao,
            data: ts ? ts.toISOString().slice(0, 10) : null,
            hora: ts ? ts.toISOString().slice(11, 19) : null,
            serie: turma?.serie ?? null,
            turma: turma?.turma ?? null
        });
    }

    return rows;
}

/**
 * Marca uma avaliação como consentida pelo responsável (consentido: true).
 */
export async function marcarComoConsentida(avaliacaoId) {
    if (!avaliacaoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const { error } = await supabase
        .from('avaliacoes')
        .update({ consentido: true })
        .eq('id', Number(avaliacaoId));

    if (error) {
        throw new Error(error.message);
    }
}
