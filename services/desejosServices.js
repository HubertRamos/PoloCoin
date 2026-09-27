import { supabase } from '../config/supabase.js';

/**
 * Adiciona um desejo à lista do aluno.
 */
export async function adicionarDesejo(alunoId, produtoId) {
    if (!alunoId || !produtoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const aId = Number(alunoId);
    const pId = Number(produtoId);

    // Verifica se já existe esse desejo
    const { data: existing, error: errExist } = await supabase
        .from('desejos')
        .select('id')
        .eq('aluno_id', aId)
        .eq('produto_id', pId)
        .maybeSingle();

    if (errExist) {
        throw new Error(errExist.message);
    }
    if (existing) {
        throw new Error('DESEJO_EXISTENTE');
    }

    const { data, error } = await supabase
        .from('desejos')
        .insert([{ aluno_id: aId, produto_id: pId }])
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data.id;
}

/**
 * Remove e processa um desejo como compra (autorizado pelo pai).
 * Verifica se o aluno tem pontos suficientes, desconta e remove o desejo.
 */
export async function processarDesejoComoCompra(alunoId, produtoId, autorizadoPor = null) {
    if (!alunoId || !produtoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const aId = Number(alunoId);
    const pId = Number(produtoId);

    // Busca o produto
    const { data: produto, error: errProd } = await supabase
        .from('produtos')
        .select('id, nome, custo_pontos')
        .eq('id', pId)
        .maybeSingle();

    if (errProd) {
        throw new Error(errProd.message);
    }
    if (!produto) {
        throw new Error('PRODUTO_NAO_ENCONTRADO');
    }

    // Busca o aluno
    const { data: aluno, error: errAluno } = await supabase
        .from('alunos')
        .select('id, pontos, turma_id')
        .eq('id', aId)
        .maybeSingle();

    if (errAluno) {
        throw new Error(errAluno.message);
    }
    if (!aluno) {
        throw new Error('ALUNO_NAO_ENCONTRADO');
    }

    const custo = Number(produto.custo_pontos);
    if ((aluno.pontos ?? 0) < custo) {
        throw new Error('SALDO_INSUFICIENTE');
    }

    const novoSaldo = (aluno.pontos ?? 0) - custo;

    // Deduz pontos
    const { error: errDeduz } = await supabase
        .from('alunos')
        .update({ pontos: novoSaldo })
        .eq('id', aId);

    if (errDeduz) {
        throw new Error(errDeduz.message);
    }

    // Remove o desejo
    const { error: errDel } = await supabase
        .from('desejos')
        .delete()
        .eq('aluno_id', aId)
        .eq('produto_id', pId);

    if (errDel) {
        throw new Error(errDel.message);
    }

    // Registra a compra na tabela de compras (entregue: false por padrão)
    const { error: errCompra } = await supabase
        .from('compras')
        .insert([{
            aluno_id: aId,
            produto_id: pId,
            custo_pontos: custo,
            autorizado_por: autorizadoPor ? Number(autorizadoPor) : null,
            entregue: false
        }]);

    if (errCompra) {
        throw new Error(errCompra.message);
    }

    return {
        produto: { nome: produto.nome, custo_pontos: custo },
        saldo_restante: novoSaldo,
        message: 'Pedido realizado com sucesso!'
    };
}

/**
 * Busca os desejos de um aluno.
 */
export async function puxarDesejosDoAluno(alunoId) {
    if (!alunoId) {
        throw new Error('CAMPOS_VAZIOS');
    }

    const { data, error } = await supabase
        .from('desejos')
        .select(`
            id,
            aluno_id,
            produto_id,
            criado_em,
            produtos (
                nome,
                custo_pontos
            )
        `)
        .eq('aluno_id', Number(alunoId))
        .order('criado_em', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(d => {
        const p = Array.isArray(d.produtos) ? d.produtos[0] : d.produtos;
        return {
            id: d.id,
            aluno_id: d.aluno_id,
            produto_id: d.produto_id,
            criado_em: d.criado_em,
            produto_nome: p?.nome ?? null,
            custo_pontos: p?.custo_pontos ?? 0
        };
    });
}
