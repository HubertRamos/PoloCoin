import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
host: 'localhost',
user: 'root',
password: '1478',
database: 'sistema_poloCoin'
};
// Rota de Cadastro de Usuários
app.post('/cadastrar', async (req, res) => {
const { name, password } = req.body;
if ( !name || !password ) {
return res.status(400).json({ error: 'Preencha todos os campos!' });
}
try {
// 1. Abre a porta de comunicação com o MySQL
const connection = await mysql.createConnection(dbConfig);
// 2. Prepara o comando SQL com interrogações (Proteção contra SQL Injection)
const sql = 'INSERT INTO usuarios (name, password) VALUES (?, ?)';
// 3. Transmite os dados reais e executa o comando
await connection.execute(sql, [name, password]);
// 4. Fecha a conexão para economizar memória
await connection.end();
return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
} catch (error) {
if (error.code === 'ER_DUP_ENTRY') {
return res.status(409).json({ error: 'CPF já cadastrado no sistema.' });
}
return res.status(500).json({ error: 'Erro de conexão com o banco de dados.' });
}
});
app.listen(3000, () => {
console.log('Servidor ativo na porta 3000');
});
