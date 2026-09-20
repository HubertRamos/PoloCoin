import express from 'express';
import cors from 'cors';
import { criarProfessor, puxarProfessores } from './services/professoresServices.js';
import { criarTurma, puxarTurmas } from './services/turmasServices.js';
import { criarAlunoComResponsavel, puxarAlunosPorTurma } from './services/alunosServices.js';

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


app.listen(3333, () => {
    console.log('Servidor ativo na porta 3333');
});

