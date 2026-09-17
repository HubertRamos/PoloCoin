import express from 'express';
import cors from 'cors';
import { criarProfessor, puxarProfessores } from './services/professoresServices.js';

const app = express();
app.use(cors());
app.use(express.json());

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


app.listen(3333, () => {
    console.log('Servidor ativo na porta 3333');
});

