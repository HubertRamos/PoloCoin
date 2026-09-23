import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { criarProfessor, puxarProfessores } from './services/professoresServices.js';
import { criarTurma, puxarTurmas } from './services/turmasServices.js';
import { criarAlunoComResponsavel, puxarAlunosPorTurma, puxarAvaliacoesDoAluno, atualizarSenhaAluno } from './services/alunosServices.js';
import { login } from './services/authServices.js';
import { criarAvaliacao, puxarAvaliacoesPorAluno } from './services/avaliacoesServices.js';
import { atualizarSenhaProfessor, buscarProfessorPorId } from './services/professorServices.js';
import { puxarAlunosDoResponsavel } from './services/responsavelServices.js';
import { puxarOcorrenciasNegativasDoResponsavel, marcarComoConsentida } from './services/responsavelOcorrenciasServices.js';
import { puxarTurmasDoProfessor, puxarTodasTurmas, vincularTurmaProfessor, desvincularTurmaProfessor } from './services/professorTurmaServices.js';
import { getSaldoPontos, deduzirPontos } from './services/pontosServices.js';
import { puxarTodosProdutos, criarProduto, puxarTodasCategorias, garantirCategoriasBasicas, criarCategoriaSeNecesaria } from './services/produtosServices.js';
import { adicionarDesejo, processarDesejoComoCompra, puxarDesejosDoAluno } from './services/desejosServices.js';
import { getFilhosComSaldos, getDesejosDosFilhos } from './services/responsavelDesejosServices.js';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1478',
    database: 'sistema_poloCoin'
};

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
    const { nome, custo_pontos, categoria } = req.body;
    try {
        let categoria_id = null;
        if (categoria) {
            categoria_id = await criarCategoriaSeNecesaria(categoria);
        }
        const produto = await criarProduto(nome, custo_pontos, categoria_id);
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
        const connection = await mysql.createConnection(dbConfig);
        try {
            // Verifica se o aluno pode comprar (liberado + sem ocorrências pendentes)
            const [aluno] = await connection.execute(
                'SELECT pode_comprar FROM alunos WHERE id = ?',
                [aluno_id]
            );
            if (aluno.length === 0) {
                return res.status(404).json({ error: 'Aluno não encontrado.' });
            }
            const podeComprar = aluno[0].pode_comprar === 1 || aluno[0].pode_comprar === true;

            if (!podeComprar) {
                return res.status(403).json({ error: 'Compras bloqueadas pelo responsável. Adicione o produto aos desejos.' });
            }

            // Verifica ocorrências não consentidas
            const [ocorrenciasNaoConsentidas] = await connection.execute(
                `SELECT COUNT(*) as total FROM avaliacoes av
                 JOIN alunos a ON av.aluno_id = a.id
                 JOIN responsaveis r ON a.responsavel_id = r.id
                 WHERE a.id = ? AND av.consentido = 0
                 AND (av.pontos <= 10 OR av.valor IN ('bagunça','desmotivado','não entregou','conflituante','isolado','desinteressado','indiferente','atrasado'))`,
                [aluno_id]
            );
            if (ocorrenciasNaoConsentidas[0].total > 0) {
                return res.status(403).json({ error: 'Você tem ocorrências pendentes de consentimento do seu responsável. Não é possível realizar compras enquanto elas não forem resolvidas.' });
            }

            const [produtos] = await connection.execute(
                'SELECT id, nome, custo_pontos FROM produtos WHERE id = ?',
                [produto_id]
            );
            if (produtos.length === 0) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }
            const produto = produtos[0];

            const novoSaldo = await deduzirPontos(aluno_id, produto.custo_pontos);

            // Registra a compra na tabela de compras
            await connection.execute(
                'INSERT INTO compras (aluno_id, produto_id, custo_pontos, autorizado_por) VALUES (?, ?, ?, ?)',
                [aluno_id, produto_id, produto.custo_pontos, null]
            );

            return res.status(200).json({
                message: 'Pedido realizado com sucesso!',
                produto: { nome: produto.nome, custo_pontos: produto.custo_pontos },
                saldo_restante: novoSaldo
            });
        } finally {
            await connection.end();
        }
    } catch (error) {
        if (error.message === 'SALDO_INSUFICIENTE') {
            return res.status(400).json({ error: 'Saldo insuficiente para esta compra.' });
        }
        console.error('ERRO AO REALIZAR PEDIDO:', error);
        return res.status(500).json({ error: 'Erro ao processar pedido.' });
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
        const connection = await mysql.createConnection(dbConfig);
        try {
            const [aluno] = await connection.execute(
                'SELECT pode_comprar FROM alunos WHERE id = ?',
                [id]
            );
            if (aluno.length === 0) {
                return res.status(404).json({ error: 'Aluno não encontrado.' });
            }
            const liberado = aluno[0].pode_comprar === 1 || aluno[0].pode_comprar === true;

            const [ocorrenciasNaoConsentidas] = await connection.execute(
                `SELECT COUNT(*) as total FROM avaliacoes av
                 JOIN alunos a ON av.aluno_id = a.id
                 JOIN responsaveis r ON a.responsavel_id = r.id
                 WHERE a.id = ? AND av.consentido = 0
                 AND (av.pontos <= 10 OR av.valor IN ('bagunça','desmotivado','não entregou','conflituante','isolado','desinteressado','indiferente','atrasado'))`,
                [id]
            );
            const temPendente = (ocorrenciasNaoConsentidas[0].total > 0);

            return res.status(200).json({
                pode_comprar: liberado && !temPendente,
                liberado_pelo_pai: liberado,
                tem_ocorrencia_pendente: temPendente
            });
        } finally {
            await connection.end();
        }
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
        const connection = await mysql.createConnection(dbConfig);
        try {
            // Verifica se tem ocorrências não consentidas
            const [ocorrenciasNaoConsentidas] = await connection.execute(
                `SELECT COUNT(*) as total FROM avaliacoes av
                 JOIN alunos a ON av.aluno_id = a.id
                 JOIN responsaveis r ON a.responsavel_id = r.id
                 WHERE a.id = ? AND av.consentido = 0
                 AND (av.pontos <= 10 OR av.valor IN ('bagunça','desmotivado','não entregou','conflituante','isolado','desinteressado','indiferente','atrasado'))`,
                [aluno_id]
            );
            if (ocorrenciasNaoConsentidas[0].total > 0) {
                return res.status(403).json({ error: 'Você tem ocorrências pendentes de consentimento. Resolva primeiro antes de adicionar desejos.' });
            }

            const resultado = await adicionarDesejo(aluno_id, produto_id);
            return res.status(201).json({ message: 'Desejo adicionado! O responsável será notificado.', desejo: resultado });
        } finally {
            await connection.end();
        }
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
        const connection = await mysql.createConnection(dbConfig);
        try {
            await connection.execute(
                'UPDATE alunos SET pode_comprar = ? WHERE id = ?',
                [pode_comprar ? 1 : 0, aluno_id]
            );
            return res.status(200).json({ message: 'Permissão atualizada com sucesso!', pode_comprar });
        } finally {
            await connection.end();
        }
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

// Inicialização segura do servidor
const PORT = 3333;
garantirCategoriasBasicas()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor ativo na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao inicializar base de dados:', err);
    });
