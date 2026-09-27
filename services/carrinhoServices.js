import { supabase } from '../config/supabase.js';
import { deduzirPontos } from './pontosServices.js';

/**
 * Processa um carrinho de compras.
 * Retorna { comprados: [{id, nome, custo}], erros: [{produto_id, msg}], saldo_restante }
 * Utiliza comparações e inserções com booleanos (pode_comprar, consentido, entregue).
 */
export async function processarCarrinho(aluno_id, produto_ids) {
    if (!aluno_id || !Array.isArray(produto_ids) || produto_ids.length === 0) {
        throw new Error('DADOS_INVALIDOS');
    }

    const alunoIdNum = Number(aluno_id);

    // 1. Verifica se o aluno pode comprar
    const { data: aluno, error: errAluno } = await supabase
        .from('alunos')
        .select('pode_comprar')
        .eq('id', alunoIdNum)
        .maybeSingle();

    if (errAluno) {
        throw new Error(errAluno.message);
    }
    if (!aluno) {
        throw new Error('ALUNO_NAO_ENCONTRADO');
    }

    const podeComprar = aluno.pode_comprar === true || aluno.pode_comprar === 1;
    if (!podeComprar) {
        throw new Error('BLOQUEADO_PELO_RESPONSAVEL');
    }

    // 2. Verifica se tem ocorrências pendentes de consentimento (consentido: false)
    const valoresNegativos = [
        'bagunça', 'desmotivado', 'não entregou', 'conflituante',
        'isolado', 'desinteressado', 'indiferente', 'atrasado'
    ];

    const { data: ocorrencias, error: errOc } = await supabase
        .from('avaliacoes')
        .select('id, pontos, valor')
        .eq('aluno_id', alunoIdNum)
        .eq('consentido', false);

    if (errOc) {
        throw new Error(errOc.message);
    }

    const temOcorrenciaNegativa = (ocorrencias || []).some(
        av => (av.pontos !== null && av.pontos <= 10) || valoresNegativos.includes(av.valor)
    );

    if (temOcorrenciaNegativa) {
        throw new Error('OCORRENCIAS_PENDENTES');
    }

    const idsUnicos = [...new Set(produto_ids)];
    const comprados = [];
    const erros = [];
    let saldoFinal = null;

    for (const produto_id of idsUnicos) {
        const prodIdNum = Number(produto_id);

        const { data: produto, error: errProd } = await supabase
            .from('produtos')
            .select('id, nome, custo_pontos')
            .eq('id', prodIdNum)
            .maybeSingle();

        if (errProd) {
            erros.push({ produto_id, msg: errProd.message });
            continue;
        }

        if (!produto) {
            erros.push({ produto_id, msg: 'Produto não encontrado' });
            continue;
        }

        try {
            // Deduz os pontos do aluno
            const novoSaldo = await deduzirPontos(alunoIdNum, produto.custo_pontos);

            // Registra a compra na tabela de compras (entregue: false)
            const { error: errCompra } = await supabase
                .from('compras')
                .insert([{
                    aluno_id: alunoIdNum,
                    produto_id: prodIdNum,
                    custo_pontos: produto.custo_pontos,
                    autorizado_por: null,
                    entregue: false
                }]);

            if (errCompra) {
                throw new Error(errCompra.message);
            }

            comprados.push({ id: produto.id, nome: produto.nome, custo: produto.custo_pontos });
            saldoFinal = novoSaldo;
        } catch (e) {
            if (e.message === 'SALDO_INSUFICIENTE') {
                erros.push({ produto_id, msg: `Saldo insuficiente para "${produto.nome}"` });
            } else {
                erros.push({ produto_id, msg: e.message });
            }
        }
    }

    return { comprados, erros, saldo_restante: saldoFinal };
}
