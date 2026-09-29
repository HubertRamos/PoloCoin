import { supabase } from '../config/supabase.js';
import { creditarPontos, debitarPontosOcorrencia } from './pontosServices.js';

let suporteColunaTipo = null;
async function checarSuporteTipo() {
    if (suporteColunaTipo !== null) return suporteColunaTipo;
    try {
        const { error } = await supabase.from('avaliacoes').select('tipo').limit(1);
        suporteColunaTipo = !error;
    } catch {
        suporteColunaTipo = false;
    }
    return suporteColunaTipo;
}

/**
 * Cria uma nova avaliação para um aluno.
 * Aplica a regra do tipo ('positiva' ou 'negativa') e normaliza o valor usando Math.abs.
 * Se for positiva: valor final positivo e soma PoloCoins ao saldo.
 * Se for negativa: valor final negativo e deduz PoloCoins do saldo.
 */
export async function criarAvaliacao(alunoId, professorId, categoria, valor, pontos = 0, observacao = '', tipo = 'positiva') {
    if (!alunoId || !professorId || !categoria || valor === undefined || valor === null || valor === '') {
        throw new Error('CAMPOS_VAZIOS');
    }

    const alunoIdNum = Number(alunoId);
    const professorIdNum = Number(professorId);

    if (!alunoIdNum || !professorIdNum) {
        throw new Error('CAMPOS_VAZIOS');
    }

    // Normaliza tipo
    const tipoNormalizado = (tipo && String(tipo).toLowerCase().trim() === 'negativa') ? 'negativa' : 'positiva';

    // Normaliza valor informado com Math.abs
    const pontosValor = Number(pontos !== undefined ? pontos : valor) || 0;
    const valorNormalizado = Math.abs(pontosValor);
    const valorFinal = tipoNormalizado === 'negativa' ? -valorNormalizado : valorNormalizado;

    const temTipo = await checarSuporteTipo();
    const insertPayload = {
        aluno_id: alunoIdNum,
        professor_id: professorIdNum,
        categoria,
        valor: String(valor),
        pontos: valorFinal,
        observacao: observacao || null,
        consentido: false
    };

    if (temTipo) {
        insertPayload.tipo = tipoNormalizado;
    }

    let { data, error } = await supabase
        .from('avaliacoes')
        .insert([insertPayload])
        .select('id')
        .single();

    if (error && error.message && error.message.includes("'tipo'")) {
        suporteColunaTipo = false;
        delete insertPayload.tipo;
        const retry = await supabase
            .from('avaliacoes')
            .insert([insertPayload])
            .select('id')
            .single();
        data = retry.data;
        error = retry.error;
    }

    if (error) {
        throw new Error(error.message);
    }

    // Atualiza saldo do aluno conforme o tipo
    if (tipoNormalizado === 'negativa') {
        if (valorNormalizado > 0) {
            await debitarPontosOcorrencia(alunoIdNum, valorNormalizado);
        }
    } else {
        if (valorNormalizado > 0) {
            await creditarPontos(alunoIdNum, valorNormalizado);
        }
    }

    return {
        id: data.id,
        aluno_id: alunoIdNum,
        professor_id: professorIdNum,
        categoria,
        valor: String(valor),
        pontos: valorFinal,
        tipo: tipoNormalizado,
        observacao: observacao || null
    };
}

/**
 * Puxa todas as avaliações de um aluno, ordenadas por data (mais recente primeiro).
 * Retorna o histórico completo do aluno com tipo e nome do professor responsável.
 */
export async function puxarAvaliacoesPorAluno(alunoId, professorId = null) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const temTipo = await checarSuporteTipo();
    const selectFields = temTipo ? `
        id,
        professor_id,
        categoria,
        valor,
        tipo,
        pontos,
        observacao,
        criado_em,
        professores (
            name
        )
    ` : `
        id,
        professor_id,
        categoria,
        valor,
        pontos,
        observacao,
        criado_em,
        professores (
            name
        )
    `;

    const { data, error } = await supabase
        .from('avaliacoes')
        .select(selectFields)
        .eq('aluno_id', Number(alunoId))
        .order('criado_em', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(r => {
        const ts = r.criado_em ? new Date(r.criado_em) : null;
        const prof = Array.isArray(r.professores) ? r.professores[0] : r.professores;
        const tipoFinal = r.tipo ? String(r.tipo).toLowerCase().trim() : (Number(r.pontos) < 0 ? 'negativa' : 'positiva');
        return {
            id: r.id,
            professor_id: r.professor_id,
            categoria: r.categoria,
            valor: r.valor,
            tipo: tipoFinal,
            pontos: r.pontos,
            observacao: r.observacao,
            data: ts ? ts.toISOString().slice(0, 10) : null,
            hora: ts ? ts.toISOString().slice(11, 19) : null,
            professor_nome: prof?.name ?? null
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

    const temTipo = await checarSuporteTipo();
    const selectFields = temTipo ? `
        id,
        aluno_id,
        professor_id,
        categoria,
        valor,
        tipo,
        pontos,
        observacao,
        criado_em,
        alunos (
            nome
        ),
        professores (
            name
        )
    ` : `
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
    `;

    const { data, error } = await supabase
        .from('avaliacoes')
        .select(selectFields)
        .in('aluno_id', alunoIds)
        .order('criado_em', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(a => {
        const ts = a.criado_em ? new Date(a.criado_em) : null;
        const aluno = Array.isArray(a.alunos) ? a.alunos[0] : a.alunos;
        const prof = Array.isArray(a.professores) ? a.professores[0] : a.professores;
        const tipoFinal = a.tipo ? String(a.tipo).toLowerCase().trim() : (Number(a.pontos) < 0 ? 'negativa' : 'positiva');
        return {
            id: a.id,
            aluno_id: a.aluno_id,
            professor_id: a.professor_id,
            categoria: a.categoria,
            valor: a.valor,
            tipo: tipoFinal,
            pontos: a.pontos,
            observacao: a.observacao,
            data: ts ? ts.toISOString().slice(0, 10) : null,
            hora: ts ? ts.toISOString().slice(11, 19) : null,
            aluno_nome: aluno?.nome ?? null,
            professor_nome: prof?.name ?? null
        };
    });
}
