import express from 'express';
import cors from 'cors';
import { criarProfessor, puxarProfessores } from './services/professoresServices.js';
import { criarTurma, puxarTurmas } from './services/turmasServices.js';
import { criarAlunoComResponsavel, puxarAlunosPorTurma } from './services/alunosServices.js';
import { login } from './services/authServices.js';
import { criarAvaliacao, puxarAvaliacoesPorAluno } from './services/avaliacoesServices.js';
import { atualizarSenhaProfessor, buscarProfessorPorId } from './services/professorServices.js';

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
        return res.status(500).json({ error: "Erro ao buscar turmas." });
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
        const { nomeAluno, senhaAluno, senhaResponsavel } = req.body;

        await criarAlunoComResponsavel(turmaId, nomeAluno, senhaAluno, senhaResponsavel);
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

    try {
        const avaliacoes = await puxarAvaliacoesPorAluno(alunoId);
        return res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('ERRO AO BUSCAR AVALIAÇÕES:', error);
        return res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
});

app.listen(3333, () => {
    console.log('Servidor ativo na porta 3333');
});

