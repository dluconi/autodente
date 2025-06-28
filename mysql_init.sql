CREATE DATABASE IF NOT EXISTS dentist_db;
USE dentist_db;

-- Criar usuário se não existir
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON dentist_db.* TO 'user'@'%';
FLUSH PRIVILEGES;

-- Tabela de Usuários (Dentistas/Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL, -- Adicionado campo username
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL, -- Mantido como UNIQUE
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(10) NOT NULL DEFAULT 'comum' -- 'admin' ou 'comum'
);

-- Tabela de Pacientes (renomeada de 'dentist')
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados Cadastrais
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100), -- Permitindo nulo conforme modelo Python (nullable=True)
    data_nascimento DATE,
    sexo VARCHAR(10),
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    estado_civil VARCHAR(20),
    escolaridade VARCHAR(50),
    como_conheceu VARCHAR(100),
    observacoes TEXT,
    cadastrado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Contato
    fone_fixo VARCHAR(20),
    celular VARCHAR(20),
    outros_telefones VARCHAR(100),
    email VARCHAR(100),
    nao_possui_email BOOLEAN DEFAULT FALSE,
    
    -- Endereço
    cep VARCHAR(10),
    cidade VARCHAR(50),
    estado VARCHAR(2),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    bairro VARCHAR(50),
    complemento VARCHAR(100),
    
    -- Dados Complementares
    profissao VARCHAR(100),
    local_trabalho VARCHAR(100),
    num_prontuario VARCHAR(20),
    tempo_trabalho VARCHAR(50),
    nome_plano VARCHAR(100),
    numero_plano VARCHAR(50),
    
    -- Filiação
    nome_pai VARCHAR(100),
    cpf_pai VARCHAR(14),
    profissao_pai VARCHAR(100),
    rg_pai VARCHAR(20),
    nome_mae VARCHAR(100),
    cpf_mae VARCHAR(14),
    profissao_mae VARCHAR(100),
    rg_mae VARCHAR(20),
    
    -- Representante Legal
    nome_representante VARCHAR(100),
    cpf_representante VARCHAR(14),
    rg_representante VARCHAR(20),
    telefone_representante VARCHAR(20),
    nascimento_representante VARCHAR(50),
    is_fully_registered BOOLEAN DEFAULT FALSE NOT NULL
);

-- Tabela de Agendamentos (Appointments)
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL, -- Renomeado para patient_id
    dentista_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(5) NOT NULL, -- HH:MM
    observacao TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE, -- Adicionado ON DELETE CASCADE
    FOREIGN KEY (dentista_id) REFERENCES usuarios(id) ON DELETE CASCADE  -- Adicionado ON DELETE CASCADE
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    dentista_id INT NOT NULL, -- Usuário (dentista) que registrou/realizou
    valor DECIMAL(10, 2) NOT NULL,
    data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado'
    aprovado_por_id INT, -- Usuário (admin) que aprovou/rejeitou
    data_acao_aprovacao DATETIME,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (dentista_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aprovado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL -- Se o admin for deletado, mantém o registro
);

-- Tabela de Orçamentos (Budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_name VARCHAR(100) NOT NULL,
    observations TEXT,
    total_value FLOAT NOT NULL DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- Tabela de Procedimentos do Orçamento (BudgetProcedures)
CREATE TABLE IF NOT EXISTS budget_procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NOT NULL,
    tooth VARCHAR(10),
    dentist VARCHAR(100), -- Nome do dentista (string), não FK para manter simples por agora
    value FLOAT NOT NULL,
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- Tabela de Histórico do Paciente
CREATE TABLE IF NOT EXISTS historico_pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    historico TEXT,
    arquivo_nome VARCHAR(255),
    arquivo_tipo VARCHAR(100),
    arquivo_tamanho INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES pacientes(id) ON DELETE CASCADE
);


-- Inserir dados de exemplo para pacientes
INSERT INTO pacientes (nome, sobrenome, cpf, email, celular, profissao, observacoes, is_fully_registered) VALUES
('João Silva Exemplo', 'Paciente', '111.222.333-44', 'joao.paciente@email.com', '(11) 91111-1111', 'Engenheiro de Software', 'Paciente de teste inicial', TRUE),
('Maria Santos Exemplo', 'Paciente', '222.333.444-55', 'maria.paciente@email.com', '(11) 92222-2222', 'Designer Gráfica', 'Outra paciente para demonstração', TRUE);

-- Nota: O usuário admin padrão será criado pela aplicação Flask (app.py) na primeira execução se não existir.
-- Se precisar criar manualmente:
-- INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
-- ('Admin Padrão', 'admin@example.com', 'hash_da_senha_admin123', 'admin');
-- ('Dentista Comum', 'dentista@example.com', 'hash_da_senha_dentista123', 'comum');

