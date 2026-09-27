import { supabase } from '../config/supabase.js';

export async function criarAlunoComResponsavel(turmaId, nomeAluno, nomeResponsavel, senhaAluno, senhaResponsavel) {
    const alunoNomeLimpo = nomeAluno ? nomeAluno.trim() : '';
    const respNomeLimpo = nomeResponsavel ? nomeResponsavel.trim() : '';
    const alunoSenhaLimpa = senhaAluno ? senhaAluno.trim() : '';
    const respSenhaLimpa = senhaResponsavel ? senhaResponsavel.trim() : '';

    if (!turmaId || !alunoNomeLimpo || !respNomeLimpo || !alunoSenhaLimpa || !respSenhaLimpa) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const turmaIdNum = Number(turmaId);

    // 1. Verifica se o aluno já existe nesta turma
    const { data: alunoExistente, error: errAlunoExist } = await supabase
        .from('alunos')
        .select('id')
        .eq('turma_id', turmaIdNum)
        .eq('nome', alunoNomeLimpo)
        .maybeSingle();

    if (errAlunoExist) {
        throw new Error(errAlunoExist.message);
    }

    if (alunoExistente) {
        throw new Error('DUPLICADO');
    }

    // 2. Verifica se o responsável já existe (evita duplicação)
    const { data: respExistente, error: errRespExist } = await supabase
        .from('responsaveis')
        .select('id')
        .eq('nome', respNomeLimpo)
        .maybeSingle();

    if (errRespExist) {
        throw new Error(errRespExist.message);
    }

    let responsavelId;
    if (respExistente) {
        responsavelId = respExistente.id;
    } else {
        const { data: novoResp, error: errNovoResp } = await supabase
            .from('responsaveis')
            .insert([{ nome: respNomeLimpo, password: respSenhaLimpa }])
            .select('id')
            .single();

        if (errNovoResp) {
            throw new Error(errNovoResp.message);
        }
        responsavelId = novoResp.id;
    }

    // 3. Insere o aluno vinculado à turma e ao responsável (pode_comprar padrão: true)
    const { error: errInsertAluno } = await supabase
        .from('alunos')
        .insert([{
            turma_id: turmaIdNum,
            responsavel_id: responsavelId,
            nome: alunoNomeLimpo,
            password: alunoSenhaLimpa,
            pode_comprar: true
        }]);

    if (errInsertAluno) {
        throw new Error(errInsertAluno.message);
    }
}

export async function puxarAlunosPorTurma(turmaId) {
    if (!turmaId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const { data, error } = await supabase
        .from('alunos')
        .select(`
            id,
            nome,
            responsaveis (
                nome
            )
        `)
        .eq('turma_id', Number(turmaId))
        .order('nome', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(a => {
        const resp = Array.isArray(a.responsaveis) ? a.responsaveis[0] : a.responsaveis;
        return {
            id: a.id,
            aluno_nome: a.nome,
            responsavel_nome: resp?.nome ?? null
        };
    });
}

/**
 * Busca avaliações (ocorrências) de um aluno específico.
 */
export async function puxarAvaliacoesDoAluno(alunoId) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
            id,
            categoria,
            valor,
            pontos,
            observacao,
            criado_em,
            alunos (
                nome,
                turmas (
                    serie,
                    turma
                )
            )
        `)
        .eq('aluno_id', Number(alunoId))
        .order('criado_em', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(av => {
        const aluno = Array.isArray(av.alunos) ? av.alunos[0] : av.alunos;
        const turma = aluno?.turmas ? (Array.isArray(aluno.turmas) ? aluno.turmas[0] : aluno.turmas) : null;
        const ts = av.criado_em ? new Date(av.criado_em) : null;

        return {
            avaliacao_id: av.id,
            categoria: av.categoria,
            valor: av.valor,
            pontos: av.pontos,
            observacao: av.observacao,
            data: ts ? ts.toISOString().slice(0, 10) : null,
            hora: ts ? ts.toISOString().slice(11, 19) : null,
            serie: turma?.serie ?? null,
            turma: turma?.turma ?? null,
            aluno_nome: aluno?.nome ?? null
        };
    });
}

/**
 * Atualiza a senha de um aluno.
 */
export async function atualizarSenhaAluno(alunoId, senhaAtual, novaSenha) {
    if (!alunoId || !novaSenha) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const alunoIdNum = Number(alunoId);

    // Verifica senha atual se fornecida
    if (senhaAtual) {
        const { data: aluno, error: errBusca } = await supabase
            .from('alunos')
            .select('password')
            .eq('id', alunoIdNum)
            .maybeSingle();

        if (errBusca) {
            throw new Error(errBusca.message);
        }
        if (!aluno) {
            throw new Error('ALUNO_NAO_ENCONTRADO');
        }
        if (aluno.password !== senhaAtual) {
            throw new Error('SENHA_ATUAL_INVALIDA');
        }
    }

    // Atualiza a senha
    const { error: errUpdate } = await supabase
        .from('alunos')
        .update({ password: novaSenha.trim() })
        .eq('id', alunoIdNum);

    if (errUpdate) {
        throw new Error(errUpdate.message);
    }

    return { success: true };
}
