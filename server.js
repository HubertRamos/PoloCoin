import express from 'express';
import cors from 'cors';
import { supabase } from './config/supabase.js';
import { criarProfessor, puxarProfessores } from './services/professoresServices.js';
import { criarTurma, puxarTurmas } from './services/turmasServices.js';
import { criarAlunoComResponsavel, puxarAlunosPorTurma, puxarAvaliacoesDoAluno, atualizarSenhaAluno } from './services/alunosServices.js';
import { login } from './services/authServices.js';
import { criarAvaliacao, puxarAvaliacoesPorAluno, puxarAvaliacoesPorTurma } from './services/avaliacoesServices.js';
import { atualizarSenhaProfessor, buscarProfessorPorId } from './services/professorServices.js';
import { puxarAlunosDoResponsavel } from './services/responsavelServices.js';
import { puxarOcorrenciasNegativasDoResponsavel, marcarComoConsentida } from './services/responsavelOcorrenciasServices.js';
import { puxarTurmasDoProfessor, puxarTodasTurmas, vincularTurmaProfessor, desvincularTurmaProfessor } from './services/professorTurmaServices.js';
import { getSaldoPontos, deduzirPontos } from './services/pontosServices.js';
import { puxarTodosProdutos, criarProduto, puxarTodasCategorias, garantirCategoriasBasicas, criarCategoriaSeNecesaria } from './services/produtosServices.js';
import { adicionarDesejo, processarDesejoComoCompra, puxarDesejosDoAluno } from './services/desejosServices.js';
import { getFilhosComSaldos, getDesejosDosFilhos } from './services/responsavelDesejosServices.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// --- Rotas de Professores ---
app.post('/cadastrar', async (req, res) => {
    const { name, password } = req.body;
    try {
        await criarProfessor(name, password);
        return res.status(201).json({ message: 'Professor cadastrado com sucesso!' });
    } catch (error) {
        if (error.message === 'DUPLICADO') {
            return res.status(400).json({ error: 'Este professor já está cadastrado no sistema!' });
        }
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: 'Preencha todos os campos corretamente.' });
        }
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.get('/professores', async (req, res) => {
    try {
        const professores = await puxarProfessores();
        return res.status(200).json(professores);
    } catch (error) {
        console.error("ERRO AO BUSCAR PROFESSORES:", error);
        return res.status(500).json({ error: 'Erro ao buscar dados do banco.' });
    }
});

// --- Rotas de Turmas ---
app.get('/turmas', async (req, res) => {
    try {
        const turmas = await puxarTurmas();
        return res.status(200).json(turmas);
    } catch (error) {
        console.error("ERRO AO BUSCAR TURMAS:", error);
        return res.status(200).json({ error: "Erro ao buscar turmas." });
    }
});

app.post('/turmas', async (req, res) => {
    try {
        const { serie, turma } = req.body;
        await criarTurma(serie, turma);
        return res.status(201).json({ message: "Turma criada com sucesso!" });
    } catch (error) {
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: "Preencha todos os campos corretamente." });
        }
        if (error.message === 'DUPLICADO') {
            return res.status(400).json({ error: "Esta turma já está cadastrada." });
        }
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// --- Rotas de Alunos ---
app.get('/turmas/:turmaId/alunos', async (req, res) => {
    try {
        const { turmaId } = req.params;
        const alunos = await puxarAlunosPorTurma(turmaId);
        return res.status(200).json(alunos);
    } catch (error) {
        console.error("ERRO AO BUSCAR ALUNOS:", error);
        return res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
});

app.post('/turmas/:turmaId/alunos', async (req, res) => {
    try {
        const { turmaId } = req.params;
        const { nomeAluno, nomeResponsavel, senhaAluno, senhaResponsavel } = req.body;
        await criarAlunoComResponsavel(turmaId, nomeAluno, nomeResponsavel, senhaAluno, senhaResponsavel);
        return res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
    } catch (error) {
        if (error.message === 'DUPLICADO') {
            return res.status(400).json({ error: 'Este aluno já está cadastrado nesta turma!' });
        }
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: 'Preencha todos os campos corretamente.' });
        }
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// --- Rotas de Autenticação ---
app.post('/login', async (req, res) => {
    const { nome, senha, tipo } = req.body;
    try {
        const user = await login(nome, senha, tipo);
        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            user: {
                id: user.id,
                nome: user.name,
                tipo: user.tipo,
            },
        });
    } catch (error) {
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }
        console.error('ERRO NO LOGIN:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// --- Rotas do Responsável ---
app.get('/responsavel/alunos', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do responsável é obrigatório.' });
    }
    try {
        const alunos = await puxarAlunosDoResponsavel(id);
        return res.status(200).json(alunos);
    } catch (error) {
        console.error("ERRO AO BUSCAR ALUNOS DO RESPONSÁVEL:", error);
        return res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
});

app.get('/responsavel/ocorrencias', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do responsável é obrigatório.' });
    }
    try {
        const ocorrencias = await puxarOcorrenciasNegativasDoResponsavel(id);
        return res.status(200).json(ocorrencias);
    } catch (error) {
        console.error("ERRO AO BUSCAR OCORRÊNCIAS NEGATIVAS:", error);
        return res.status(500).json({ error: 'Erro ao buscar ocorrências.' });
    }
});

// --- Rotas de Alteração de Senha do Professor ---
app.post('/professor/senha', async (req, res) => {
    const { id, senhaAtual, novaSenha } = req.body;
    try {
        if (!id || !senhaAtual || !novaSenha) {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }
        const professor = await buscarProfessorPorId(id);
        if (!professor) {
            return res.status(404).json({ error: 'Professor não encontrado.' });
        }
        if (professor.password !== senhaAtual) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }
        const atualizado = await atualizarSenhaProfessor(id, novaSenha);
        if (!atualizado) {
            return res.status(500).json({ error: 'Erro ao atualizar senha.' });
        }
        return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
    } catch (error) {
        console.error('ERRO AO ATUALIZAR SENHA:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// --- Rotas de Turmas do Professor ---
app.get('/professor/turmas', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do professor é obrigatório.' });
    }
    try {
        const [turmasVinculadas, todasTurmas] = await Promise.all([
            puxarTurmasDoProfessor(id),
            puxarTodasTurmas()
        ]);
        return res.status(200).json({
            vinculadas: turmasVinculadas,
            disponiveis: todasTurmas
        });
    } catch (error) {
        console.error('ERRO AO BUSCAR TURMAS DO PROFESSOR:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.post('/professor/turmas/vincular', async (req, res) => {
    const { professorId, turmaId } = req.body;
    try {
        if (!professorId || !turmaId) {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }
        const resultado = await vincularTurmaProfessor(professorId, turmaId);
        return res.status(200).json(resultado);
    } catch (error) {
        console.error('ERRO AO VINCULAR TURMA:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.post('/professor/turmas/desvincular', async (req, res) => {
    const { professorId, turmaId } = req.body;
    try {
        if (!professorId || !turmaId) {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }
        const resultado = await desvincularTurmaProfessor(professorId, turmaId);
        return res.status(200).json(resultado);
    } catch (error) {
        console.error('ERRO AO DESVINCULAR TURMA:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// --- Rotas de Avaliações ---
app.post('/avaliacoes', async (req, res) => {
    const { alunoId, professorId, categoria, valor, pontos, observacao } = req.body;
    try {
        const avaliacao = await criarAvaliacao(alunoId, professorId, categoria, valor, pontos || 0, observacao || '');
        return res.status(201).json({ message: 'Avaliação registrada com sucesso!', avaliacao });
    } catch (error) {
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }
        console.error('ERRO AO CRIAR AVALIAÇÃO:', error);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.get('/avaliacoes/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    const { professorId } = req.query;
    try {
        const avaliacoes = await puxarAvaliacoesPorAluno(alunoId, professorId || null);
        return res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('ERRO AO BUSCAR AVALIAÇÕES:', error);
        return res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
});

// --- Rotas para ocorrências da turma (todas as avaliações) ---
app.get('/turmas/:turmaId/avaliacoes', async (req, res) => {
    const { turmaId } = req.params;
    try {
        const avaliacoes = await puxarAvaliacoesPorTurma(turmaId);
        return res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('ERRO AO BUSCAR AVALIAÇÕES DA TURMA:', error);
        return res.status(500).json({ error: 'Erro ao buscar avaliações da turma.' });
    }
});

// --- Rotas de Produtos ---
app.get('/produtos', async (req, res) => {
    try {
        const produtos = await puxarTodosProdutos();
        return res.status(200).json(produtos);
    } catch (error) {
        console.error('ERRO AO BUSCAR PRODUTOS:', error);
        return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

app.post('/produtos', async (req, res) => {
    const { nome, custo_pontos, preco, categoria } = req.body;
    const pontosValor = custo_pontos !== undefined && custo_pontos !== null && custo_pontos !== ''
        ? custo_pontos
        : preco;

    try {
        let categoria_id = null;
        if (categoria) {
            categoria_id = await criarCategoriaSeNecesaria(categoria);
        }
        const produto = await criarProduto(nome, pontosValor, categoria_id);
        return res.status(201).json({ message: 'Produto cadastrado com sucesso!', produto });
    } catch (error) {
        console.error('ERRO AO CRIAR PRODUTO:', error);
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: 'Preencha nome e custo em pontos.' });
        }
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

app.get('/categorias/produtos', async (req, res) => {
    try {
        const categorias = await puxarTodasCategorias();
        return res.status(200).json(categorias);
    } catch (error) {
        console.error('ERRO AO BUSCAR CATEGORIAS:', error);
        return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
});

// --- Filtros de Produtos (loja do aluno) ---
app.get('/produtos/filtrados', async (req, res) => {
    try {
        const { categoria, busca } = req.query;
        const { puxarProdutosFiltrados } = await import('./services/produtosServices.js');
        const produtos = await puxarProdutosFiltrados({ categoria, busca });
        return res.status(200).json(produtos);
    } catch (error) {
        console.error('ERRO AO BUSCAR PRODUTOS FILTRADOS:', error);
        return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

app.get('/categorias/filtro', async (req, res) => {
    try {
        const { puxarCategoriasParaFiltro } = await import('./services/produtosServices.js');
        const categorias = await puxarCategoriasParaFiltro();
        return res.status(200).json(categorias);
    } catch (error) {
        console.error('ERRO AO BUSCAR CATEGORIAS PARA FILTRO:', error);
        return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
});

// --- Rotas do Aluno ---
app.get('/aluno/ocorrencias', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }
    try {
        const ocorrencias = await puxarAvaliacoesDoAluno(id);
        return res.status(200).json(ocorrencias);
    } catch (error) {
        console.error('ERRO AO BUSCAR OCORRÊNCIAS DO ALUNO:', error);
        return res.status(500).json({ error: 'Erro ao buscar ocorrências.' });
    }
});

app.post('/aluno/comprar', async (req, res) => {
    const { aluno_id, produto_id } = req.body;
    if (!aluno_id || !produto_id) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }
    try {
        const alunoIdNum = Number(aluno_id);
        const prodIdNum = Number(produto_id);

        // Verifica se o aluno pode comprar (liberado + sem ocorrências pendentes)
        const { data: aluno, error: errAluno } = await supabase
            .from('alunos')
            .select('pode_comprar')
            .eq('id', alunoIdNum)
            .maybeSingle();

        if (errAluno) {
            throw new Error(errAluno.message);
        }
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }

        const podeComprar = aluno.pode_comprar === true || aluno.pode_comprar === 1;
        if (!podeComprar) {
            return res.status(403).json({ error: 'Compras bloqueadas pelo responsável. Adicione o produto aos desejos.' });
        }

        // Verifica ocorrências não consentidas
        const valoresNegativos = ['bagunça','desmotivado','não entregou','conflituante','isolado','desinteressado','indiferente','atrasado'];
        const { data: ocorrencias, error: errOc } = await supabase
            .from('avaliacoes')
            .select('id, pontos, valor')
            .eq('aluno_id', alunoIdNum)
            .eq('consentido', false);

        if (errOc) {
            throw new Error(errOc.message);
        }

        const temOcorrencias = (ocorrencias || []).some(
            av => (av.pontos !== null && av.pontos <= 10) || valoresNegativos.includes(av.valor)
        );

        if (temOcorrencias) {
            return res.status(403).json({ error: 'Você tem ocorrências pendentes de consentimento do seu responsável. Não é possível realizar compras enquanto elas não forem resolvidas.' });
        }

        const { data: produto, error: errProd } = await supabase
            .from('produtos')
            .select('id, nome, custo_pontos')
            .eq('id', prodIdNum)
            .maybeSingle();

        if (errProd) {
            throw new Error(errProd.message);
        }
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

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

        return res.status(200).json({
            message: 'Pedido realizado com sucesso!',
            produto: { nome: produto.nome, custo_pontos: produto.custo_pontos },
            saldo_restante: novoSaldo
        });
    } catch (error) {
        if (error.message === 'SALDO_INSUFICIENTE') {
            return res.status(400).json({ error: 'Saldo insuficiente para esta compra.' });
        }
        console.error('ERRO AO REALIZAR PEDIDO:', error);
        return res.status(500).json({ error: 'Erro ao processar pedido.' });
    }
});

// --- Carrinho do Aluno (compra múltipla) ---
app.post('/aluno/comprar-carrinho', async (req, res) => {
    try {
        const { aluno_id, produtos } = req.body;
        if (!aluno_id || !Array.isArray(produtos) || produtos.length === 0) {
            return res.status(400).json({ error: 'Dados inválidos.' });
        }
        const { processarCarrinho } = await import('./services/carrinhoServices.js');
        const resultado = await processarCarrinho(aluno_id, produtos.map(p => p.id));
        if (resultado.erros.length > 0 && resultado.comprados.length === 0) {
            return res.status(400).json({ error: resultado.erros[0].erro, erros: resultado.erros });
        }
        return res.status(200).json({
            comprados: resultado.comprados,
            erros: resultado.erros,
            saldo_restante: resultado.saldo_restante
        });
    } catch (e) {
        console.error('ERRO AO PROCESSAR CARRINHO:', e);
        if (e.message === 'BLOQUEADO_PELO_RESPONSAVEL') {
            return res.status(403).json({ error: 'Compras bloqueadas pelo responsável.' });
        }
        if (e.message === 'OCORRENCIAS_PENDENTES') {
            return res.status(403).json({ error: 'Você tem ocorrências pendentes de consentimento.' });
        }
        return res.status(500).json({ error: 'Erro ao processar carrinho.' });
    }
});

// --- Saldo do Aluno ---
app.get('/aluno/saldo', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }
    try {
        const saldo = await getSaldoPontos(id);
        return res.status(200).json({ pontos: saldo });
    } catch (error) {
        console.error('ERRO AO BUSCAR SALDO:', error);
        return res.status(500).json({ error: 'Erro ao buscar saldo.' });
    }
});

// --- Verificar permissão de compra do aluno ---
app.get('/aluno/pode-comprar', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }
    try {
        const alunoIdNum = Number(id);
        const { data: aluno, error: errAluno } = await supabase
            .from('alunos')
            .select('pode_comprar')
            .eq('id', alunoIdNum)
            .maybeSingle();

        if (errAluno) {
            throw new Error(errAluno.message);
        }
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }

        const liberado = aluno.pode_comprar === true || aluno.pode_comprar === 1;

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

        const temPendente = (ocorrencias || []).some(
            av => (av.pontos !== null && av.pontos <= 10) || valoresNegativos.includes(av.valor)
        );

        return res.status(200).json({
            pode_comprar: liberado && !temPendente,
            liberado_pelo_pai: liberado,
            tem_ocorrencia_pendente: temPendente
        });
    } catch (error) {
        console.error('ERRO AO VERIFICAR PERMISSÃO:', error);
        return res.status(500).json({ error: 'Erro ao verificar permissão.' });
    }
});

// --- Desejos do Aluno (Controle Parental) ---
app.post('/aluno/desejos', async (req, res) => {
    const { aluno_id, produto_id } = req.body;
    if (!aluno_id || !produto_id) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }
    try {
        const alunoIdNum = Number(aluno_id);
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

        const temPendente = (ocorrencias || []).some(
            av => (av.pontos !== null && av.pontos <= 10) || valoresNegativos.includes(av.valor)
        );

        if (temPendente) {
            return res.status(403).json({ error: 'Você tem ocorrências pendentes de consentimento. Resolva primeiro antes de adicionar desejos.' });
        }

        const resultado = await adicionarDesejo(aluno_id, produto_id);
        return res.status(201).json({ message: 'Desejo adicionado! O responsável será notificado.', desejo: resultado });
    } catch (error) {
        if (error.message === 'DESEJO_EXISTENTE') {
            return res.status(400).json({ error: 'Este produto já está na sua lista de desejos.' });
        }
        console.error('ERRO AO ADICIONAR DESEJO:', error);
        return res.status(500).json({ error: 'Erro ao adicionar desejo.' });
    }
});

app.get('/aluno/desejos', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }
    try {
        const desejos = await puxarDesejosDoAluno(id);
        return res.status(200).json(desejos);
    } catch (error) {
        console.error('ERRO AO BUSCAR DESEJOS:', error);
        return res.status(500).json({ error: 'Erro ao buscar desejos.' });
    }
});

// --- Painel do Responsável: Saldo e Controle ---
app.get('/responsavel/filhos', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do responsável é obrigatório.' });
    }
    try {
        const filhos = await getFilhosComSaldos(id);
        return res.status(200).json(filhos);
    } catch (error) {
        console.error('ERRO AO BUSCAR FILHOS:', error);
        return res.status(500).json({ error: 'Erro ao buscar filhos.' });
    }
});

app.get('/responsavel/desejos', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID do responsável é obrigatório.' });
    }
    try {
        const dados = await getDesejosDosFilhos(id);
        return res.status(200).json(dados);
    } catch (error) {
        console.error('ERRO AO BUSCAR DESEJOS DOS FILHOS:', error);
        return res.status(500).json({ error: 'Erro ao buscar desejos.' });
    }
});

app.post('/responsavel/comprar-desejo', async (req, res) => {
    const { aluno_id, produto_id, responsavel_id } = req.body;
    if (!aluno_id || !produto_id) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }
    try {
        const resultado = await processarDesejoComoCompra(aluno_id, produto_id, responsavel_id || null);
        return res.status(200).json(resultado);
    } catch (error) {
        if (error.message === 'SALDO_INSUFICIENTE') {
            return res.status(400).json({ error: 'O aluno não tem pontos suficientes para esta compra.' });
        }
        if (error.message === 'DESEJO_NAO_ENCONTRADO' || error.message === 'PRODUTO_NAO_ENCONTRADO' || error.message === 'ALUNO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: 'Desejo ou produto não encontrado.' });
        }
        console.error('ERRO AO PROCESSAR DESEJO:', error);
        return res.status(500).json({ error: 'Erro ao processar compra.' });
    }
});

app.patch('/aluno/pode-comprar', async (req, res) => {
    const { aluno_id, pode_comprar } = req.body;
    if (!aluno_id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }
    try {
        const podeComprarBool = pode_comprar === true || pode_comprar === 1 || pode_comprar === '1' || pode_comprar === 'true';
        const { error } = await supabase
            .from('alunos')
            .update({ pode_comprar: podeComprarBool })
            .eq('id', Number(aluno_id));

        if (error) {
            throw new Error(error.message);
        }
        return res.status(200).json({ message: 'Permissão atualizada com sucesso!', pode_comprar: podeComprarBool });
    } catch (error) {
        console.error('ERRO AO ATUALIZAR PERMISSÃO:', error);
        return res.status(500).json({ error: 'Erro ao atualizar permissão.' });
    }
});

// --- Consentir avaliações (chamado quando o pai finaliza o consentimento) ---
app.post('/responsavel/consentir-avaliacoes', async (req, res) => {
    const { avaliacoes_ids } = req.body;
    if (!avaliacoes_ids || !Array.isArray(avaliacoes_ids) || avaliacoes_ids.length === 0) {
        return res.status(400).json({ error: 'Lista de avaliações é obrigatório.' });
    }
    try {
        for (const avId of avaliacoes_ids) {
            await marcarComoConsentida(avId);
        }
        return res.status(200).json({ message: `${avaliacoes_ids.length} avaliação(ões) consentida(s) com sucesso!` });
    } catch (error) {
        console.error('ERRO AO CONSENTIR AVALIAÇÕES:', error);
        return res.status(500).json({ error: 'Erro ao consentir avaliações.' });
    }
});

app.post('/aluno/senha', async (req, res) => {
    const { id, senhaAtual, novaSenha } = req.body;
    if (!id || !novaSenha) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }
    try {
        await atualizarSenhaAluno(id, senhaAtual || null, novaSenha);
        return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
    } catch (error) {
        if (error.message === 'CAMPOS_VAZIOS') {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }
        if (error.message === 'SENHA_ATUAL_INVALIDA') {
            return res.status(400).json({ error: 'A senha atual está incorreta.' });
        }
        if (error.message === 'ALUNO_NAO_ENCONTRADO') {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }
        console.error('ERRO AO ATUALIZAR SENHA:', error);
        return res.status(500).json({ error: 'Erro ao atualizar senha.' });
    }
});

// --- Compras (Painel do Adm) ---
app.get('/admin/compras', async (req, res) => {
    try {
        const { puxarTodasCompras } = await import('./services/comprasServices.js');
        const compras = await puxarTodasCompras();
        return res.status(200).json(compras);
    } catch (error) {
        console.error('ERRO AO BUSCAR COMPRAS:', error);
        return res.status(500).json({ error: 'Erro ao buscar compras.' });
    }
});

app.patch('/admin/compras/:id/entregar', async (req, res) => {
    const { id } = req.params;
    try {
        const { marcarEntrega } = await import('./services/comprasServices.js');
        const resultado = await marcarEntrega(id);
        if (!resultado) {
            return res.status(404).json({ error: 'Compra não encontrada.' });
        }
        return res.status(200).json({ message: 'Entrega confirmada com sucesso!' });
    } catch (error) {
        console.error('ERRO AO CONFIRMAR ENTREGA:', error);
        return res.status(500).json({ error: 'Erro ao confirmar entrega.' });
    }
});

// --- Histórico de Vendas (7 dias) ---
app.get('/admin/historico-vendas', async (req, res) => {
    try {
        const { puxarHistoricoVendas } = await import('./services/comprasServices.js');
        const historico = await puxarHistoricoVendas();
        return res.status(200).json(historico);
    } catch (error) {
        console.error('ERRO AO BUSCAR HISTÓRICO:', error);
        return res.status(500).json({ error: 'Erro ao buscar histórico de vendas.' });
    }
});

app.delete('/admin/historico-vendas/limpar', async (req, res) => {
    try {
        const { limparHistoricoAntigo } = await import('./services/comprasServices.js');
        const removidos = await limparHistoricoAntigo();
        return res.status(200).json({ message: `Histórico limpo. ${removidos} registros removidos.`, removidos });
    } catch (error) {
        console.error('ERRO AO LIMPAR HISTÓRICO:', error);
        return res.status(500).json({ error: 'Erro ao limpar histórico de vendas.' });
    }
});

// --- Filtrar Compras Pendentes ---
app.get('/admin/entregas-pendentes', async (req, res) => {
    try {
        const { puxarTodasCompras } = await import('./services/comprasServices.js');
        let compras = await puxarTodasCompras();
        // Só pendentes
        compras = compras.filter(c => !c.entregue);

        const { produto } = req.query;
        const { categoria } = req.query;
        const { turma_id } = req.query;

        if (produto) {
            compras = compras.filter(c => c.produto_nome.toLowerCase().includes(produto.toLowerCase()));
        }
        if (categoria) {
            compras = compras.filter(c => c.categoria_nome && c.categoria_nome.toLowerCase().includes(categoria.toLowerCase()));
        }
        if (turma_id) {
            compras = compras.filter(c => c.turma_id == turma_id);
        }

        return res.status(200).json(compras);
    } catch (error) {
        console.error('ERRO AO BUSCAR ENTREGAS PENDENTES:', error);
        return res.status(500).json({ error: 'Erro ao buscar entregas.' });
    }
});

app.get('/admin/entregas-pendentes/produtos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('compras')
            .select(`
                produto_id,
                produtos (
                    id,
                    nome,
                    custo_pontos,
                    categorias (
                        nome
                    )
                )
            `)
            .eq('entregue', false);

        if (error) {
            throw new Error(error.message);
        }

        const produtosMap = new Map();
        for (const item of (data || [])) {
            const prod = Array.isArray(item.produtos) ? item.produtos[0] : item.produtos;
            if (prod && !produtosMap.has(prod.id)) {
                const cat = prod.categorias ? (Array.isArray(prod.categorias) ? prod.categorias[0] : prod.categorias) : null;
                produtosMap.set(prod.id, {
                    id: prod.id,
                    produto_nome: prod.nome,
                    custo_pontos: prod.custo_pontos,
                    categoria_nome: cat?.nome ?? null
                });
            }
        }

        const rows = Array.from(produtosMap.values()).sort((a, b) => a.produto_nome.localeCompare(b.produto_nome));
        return res.status(200).json(rows);
    } catch (error) {
        console.error('ERRO AO BUSCAR PRODUTOS PARA FILTRO:', error);
        return res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

app.get('/admin/entregas-pendentes/categorias', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('compras')
            .select(`
                produtos (
                    categoria_id,
                    categorias (
                        id,
                        nome
                    )
                )
            `)
            .eq('entregue', false);

        if (error) {
            throw new Error(error.message);
        }

        const categoriasMap = new Map();
        for (const item of (data || [])) {
            const prod = Array.isArray(item.produtos) ? item.produtos[0] : item.produtos;
            const cat = prod?.categorias ? (Array.isArray(prod.categorias) ? prod.categorias[0] : prod.categorias) : null;
            if (cat && !categoriasMap.has(cat.id)) {
                categoriasMap.set(cat.id, {
                    id: cat.id,
                    categoria_nome: cat.nome
                });
            }
        }

        const rows = Array.from(categoriasMap.values()).sort((a, b) => a.categoria_nome.localeCompare(b.categoria_nome));
        return res.status(200).json(rows);
    } catch (error) {
        console.error('ERRO AO BUSCAR CATEGORIAS PARA FILTRO:', error);
        return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
});

app.get('/admin/entregas-pendentes/turmas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('compras')
            .select(`
                alunos (
                    turmas (
                        id,
                        serie,
                        turma
                    )
                )
            `)
            .eq('entregue', false);

        if (error) {
            throw new Error(error.message);
        }

        const turmasMap = new Map();
        for (const item of (data || [])) {
            const aluno = Array.isArray(item.alunos) ? item.alunos[0] : item.alunos;
            const turma = aluno?.turmas ? (Array.isArray(aluno.turmas) ? aluno.turmas[0] : aluno.turmas) : null;
            if (turma && !turmasMap.has(turma.id)) {
                turmasMap.set(turma.id, {
                    id: turma.id,
                    turma_nome: `${turma.serie}${turma.turma}`
                });
            }
        }

        const rows = Array.from(turmasMap.values()).sort((a, b) => a.turma_nome.localeCompare(b.turma_nome));
        return res.status(200).json(rows);
    } catch (error) {
        console.error('ERRO AO BUSCAR TURMAS PARA FILTRO:', error);
        return res.status(500).json({ error: 'Erro ao buscar turmas.' });
    }
});

// Inicialização segura do servidor
const PORT = 3000;
garantirCategoriasBasicas()
    .catch((err) => {
        console.warn('Aviso: Verifique conexão com Supabase (SUPABASE_URL e SUPABASE_KEY):', err.message);
    })
    .finally(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor ativo na porta ${PORT}`);
        });
    });
