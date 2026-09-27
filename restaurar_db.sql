-- PoloCoin - Restauração do banco de dados
-- MySQL / MariaDB
-- Atualizado em 2026-09-26 com todas as tabelas e colunas do sistema

CREATE DATABASE IF NOT EXISTS sistema_poloCoin;
USE sistema_poloCoin;

-- ============================================================
-- Professores
-- ============================================================
CREATE TABLE IF NOT EXISTS professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- ============================================================
-- Admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- ============================================================
-- Categorias de avaliação
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    custo_pontos INT NOT NULL DEFAULT 0,
    categoria_id INT,
    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================================
-- Turmas
-- ============================================================
CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    serie INTEGER NOT NULL,
    turma TEXT NOT NULL
);

-- ============================================================
-- Responsáveis
-- ============================================================
CREATE TABLE IF NOT EXISTS responsaveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- ============================================================
-- Alunos
-- ============================================================
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    pontos INT NOT NULL DEFAULT 0,
    pode_comprar TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE CASCADE
);

-- ============================================================
-- Avaliações
-- ============================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    professor_id INT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    pontos INT DEFAULT 0,
    observacao TEXT,
    consentido TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
);

-- ============================================================
-- Vínculo professor-turma
-- ============================================================
CREATE TABLE IF NOT EXISTS professor_turmas (
    professor_id INT NOT NULL,
    turma_id INT NOT NULL,
    PRIMARY KEY (professor_id, turma_id),
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
);

-- ============================================================
-- Desejos (fila de pedidos dos alunos)
-- ============================================================
CREATE TABLE IF NOT EXISTS desejos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    produto_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- ============================================================
-- Compras (histórico de compras dos alunos)
-- ============================================================
CREATE TABLE IF NOT EXISTS compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    produto_id INT NOT NULL,
    custo_pontos INT NOT NULL,
    autorizado_por INT,
    entregue TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (autorizado_por) REFERENCES responsaveis(id) ON DELETE SET NULL
);
