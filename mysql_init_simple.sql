USE dentist_db;

-- Tabela de dentistas/pacientes
CREATE TABLE IF NOT EXISTS dentist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados Cadastrais
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
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
    nascimento_representante VARCHAR(50)
);

-- Inserir dados de exemplo
INSERT INTO dentist (nome, sobrenome, cpf, email, celular, profissao, observacoes) VALUES
('João', 'Silva', '123.456.789-00', 'joao.silva@email.com', '(11) 99999-9999', 'Engenheiro', 'Paciente exemplo para testes'),
('Maria', 'Santos', '987.654.321-00', 'maria.santos@email.com', '(11) 88888-8888', 'Professora', 'Paciente exemplo para demonstração');

