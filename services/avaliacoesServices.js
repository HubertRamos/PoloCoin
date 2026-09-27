import { supabase } from '../config/supabase.js';
import { creditarPontos } from './pontosServices.js';

/**
 * Cria uma nova avaliação para um aluno.
 * Se os pontos forem positivos, credita automaticamente na conta do aluno.
 * 'consentido' é explicitamente inicializado como false (booleano).
 */
export async function criarAvaliacao(alunoId, professorId, categoria, valor, pontos = 0, observacao = '') {
    if (!alunoId || !professorId || !categoria || !valor) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const alunoIdNum = Number(alunoId);
    const professorIdNum = Number(professorId);
    const pontosNum = Number(pontos) || 0;

    if (!alunoIdNum || !professorIdNum) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const { data, error } = await supabase
        .from('avaliacoes')
        .insert([{
            aluno_id: alunoIdNum,
            professor_id: professorIdNum,
            categoria,
            valor,
            pontos: pontosNum,
            observacao: observacao || null,
            consentido: false
        }])
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    // Se pontos positivos, credita automaticamente na conta do aluno
    if (pontosNum > 0) {
        await creditarPontos(alunoIdNum, pontosNum);
    }

    return {
        id: data.id,
        aluno_id: alunoIdNum,
        professor_id: professorIdNum,
        categoria,
        valor,
        pontos: pontosNum,
        observacao: observacao || null
    };
}

/**
 * Puxa todas as avaliações de um aluno, ordenadas por data (mais recente primeiro).
 */
export async function puxarAvaliacoesPorAluno(alunoId, professorId = null) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    let query = supabase
        .from('avaliacoes')
        .select('id, professor_id, categoria, valor, pontos, observacao, criado_em')
        .eq('aluno_id', Number(alunoId));

    if (professorId) {
        query = query.eq('professor_id', Number(professorId));
    }

    const { data, error } = await query.order('criado_em', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(r => {
        const ts = r.criado_em ? new Date(r.criado_em) : null;
        return {
            id: r.id,
            professor_id: r.professor_id,
            categoria: r.categoria,
            valor: r.valor,
            pontos: r.pontos,
            observacao: r.observacao,
            data: ts ? ts.toISOString().slice(0, 10) : null,
            hora: ts ? ts.toISOString().slice(11, 19) : null
        };
    });
}

/**
 * Puxa os ids dos alunos de uma turma.
 */
export async function puxarIdsAlunosDaTurma(turmaId) {
    if (!turmaId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const { data, error } = await supabase
        .from('alunos')
        .select('id')
        .eq('turma_id', Number(turmaId));

    if (error) {
        throw new Error(error.message);
    }
    return (data || []).map(r => r.id);
}

/**
 * Puxa todas as avaliações de uma turma, com nome dos alunos e professores.
 * Usada pelo painel "Ocorrências da Turma" do professor.
 */
export async function puxarAvaliacoesPorTurma(turmaId) {
    if (!turmaId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const alunoIds = await puxarIdsAlunosDaTurma(turmaId);
    if (!alunoIds || alunoIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
            id,
            aluno_id,
            professor_id,
            categoria,
            valor,
            pontos,
            observacao,
            criado_em,
            alunos (
                nome
            ),
            professores (
                name
            )
        `)
        .in('aluno_id', alunoIds)
        .order('criado_em', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(a => {
        const ts = a.criado_em ? new Date(a.criado_em) : null;
        const aluno = Array.isArray(a.alunos) ? a.alunos[0] : a.alunos;
        const prof = Array.isArray(a.professores) ? a.professores[0] : a.professores;
        return {
            id: a.id,
            aluno_id: a.aluno_id,
            professor_id: a.professor_id,
            categoria: a.categoria,
            valor: a.valor,
            pontos: a.pontos,
            observacao: a.observacao,
            data: ts ? ts.toISOString().slice(0, 10) : null,
            hora: ts ? ts.toISOString().slice(11, 19) : null,
            aluno_nome: aluno?.nome ?? null,
            professor_nome: prof?.name ?? null
        };
    });
}
