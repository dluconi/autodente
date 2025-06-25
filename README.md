# Sistema de Cadastro de Dentistas - Dr. Lucca Spinelli

## Visão Geral

Este é um sistema completo de cadastro de pacientes desenvolvido especificamente para o consultório do Dr. Lucca Spinelli, especialista em Endodontia. O sistema oferece uma interface moderna e intuitiva para gerenciar informações de pacientes de forma eficiente e segura.

## Características Principais

### Funcionalidades
- **Autenticação Segura**: Sistema de login com credenciais admin/admin
- **Cadastro Completo de Pacientes**: Formulário abrangente com múltiplas seções
- **Consulta e Busca**: Interface para visualizar e pesquisar pacientes cadastrados
- **Interface Responsiva**: Design adaptável para desktop e dispositivos móveis
- **Validação de Dados**: Validação robusta de formulários no frontend e backend

### Seções do Cadastro
1. **Dados Cadastrais**
   - Nome e sobrenome
   - Data de nascimento
   - Sexo e estado civil
   - CPF e RG
   - Escolaridade
   - Como conheceu o consultório
   - Observações

2. **Contato**
   - Telefone fixo e celular
   - Outros telefones
   - Email (com opção "não possui email")
   - Endereço completo (CEP, cidade, estado, rua, número, bairro, complemento)

3. **Dados Complementares**
   - Profissão e local de trabalho
   - Número do prontuário
   - Tempo de trabalho
   - Informações do plano de saúde
   - Dados de filiação (pai e mãe)
   - Informações do representante legal

## Arquitetura Técnica

### Backend (Flask)
- **Framework**: Flask (Python)
- **Banco de Dados**: MySQL 8.0
- **ORM**: SQLAlchemy
- **API**: REST API com endpoints para CRUD completo
- **Validação**: Validação de dados no servidor
- **CORS**: Configurado para permitir requisições do frontend

### Frontend (React)
- **Framework**: React 18 com Vite
- **Roteamento**: React Router DOM
- **UI Components**: shadcn/ui com Tailwind CSS
- **Ícones**: Lucide React
- **Formulários**: Formulários controlados com validação
- **Design**: Interface moderna com gradientes e animações

### Banco de Dados
- **SGBD**: MySQL 8.0
- **Estrutura**: Tabela única `dentist` com todos os campos necessários
- **Dados de Exemplo**: Pacientes pré-cadastrados para demonstração
- **Indexação**: Índice único no CPF para evitar duplicatas

### Containerização
- **Docker**: Aplicação completamente containerizada
- **Docker Compose**: Orquestração de múltiplos serviços
- **Serviços**:
  - `db`: MySQL 8.0
  - `backend`: Flask API
  - `frontend`: React com Vite
- **Volumes**: Persistência de dados do MySQL
- **Health Checks**: Verificação de saúde dos serviços

## Estrutura do Projeto

```
dentist_system/
├── backend/
│   ├── app.py              # Aplicação Flask principal
│   ├── requirements.txt    # Dependências Python
│   └── Dockerfile         # Container do backend
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CadastroDentista.jsx
│   │   │   └── ConsultaDentistas.jsx
│   │   ├── App.jsx        # Componente principal
│   │   └── main.jsx       # Ponto de entrada
│   ├── package.json       # Dependências Node.js
│   └── Dockerfile        # Container do frontend
├── docker-compose.yml     # Orquestração dos serviços
├── mysql_init.sql        # Script de inicialização do banco
└── README.md             # Documentação
```

## Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Portas 3000, 5000 e 3306 disponíveis

### Execução com Docker (Recomendado)
```bash
# Clone o repositório
git clone <repository-url>
cd dentist_system

# Execute o sistema completo
docker compose up -d --build

# Acesse a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MySQL: localhost:3306
```

### Execução Local (Desenvolvimento)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configure o banco de dados MySQL local
export DATABASE_URL="mysql+pymysql://user:password@localhost:3306/dentist_db"
python app.py
```

#### Frontend
```bash
cd frontend
pnpm install
pnpm run dev --host
```

## Uso do Sistema

### Login
- **Usuário**: admin
- **Senha**: admin

### Fluxo de Trabalho
1. **Login**: Acesse com as credenciais padrão
2. **Dashboard**: Visualize o painel de controle com estatísticas
3. **Novo Cadastro**: Clique em "Novo Cadastro" para adicionar um paciente
4. **Preenchimento**: Complete as três abas do formulário
5. **Salvamento**: Clique em "Salvar Paciente" para confirmar
6. **Consulta**: Use "Consultar Pacientes" para visualizar e gerenciar registros

### Funcionalidades da Consulta
- **Busca**: Pesquise por nome, CPF ou email
- **Visualização**: Veja todos os dados em formato de tabela
- **Ações**: Visualizar, editar ou excluir registros
- **Estatísticas**: Acompanhe o número total de pacientes

## API Endpoints

### Autenticação
- `POST /api/login` - Login do usuário

### Pacientes
- `GET /api/dentists` - Listar todos os pacientes
- `POST /api/dentists` - Criar novo paciente
- `GET /api/dentists/{id}` - Obter paciente específico
- `PUT /api/dentists/{id}` - Atualizar paciente
- `DELETE /api/dentists/{id}` - Excluir paciente

## Configuração do Banco de Dados

### Variáveis de Ambiente
- `MYSQL_ROOT_PASSWORD`: root_password
- `MYSQL_DATABASE`: dentist_db
- `MYSQL_USER`: user
- `MYSQL_PASSWORD`: password

### Estrutura da Tabela
A tabela `dentist` contém todos os campos necessários para o cadastro completo, incluindo dados pessoais, contato, endereço, informações profissionais, filiação e representante legal.

## Segurança

### Medidas Implementadas
- Validação de entrada no frontend e backend
- Sanitização de dados SQL através do SQLAlchemy ORM
- CORS configurado adequadamente
- Senhas de banco de dados em variáveis de ambiente
- Validação de tipos de dados

### Recomendações para Produção
- Alterar credenciais padrão de login
- Implementar autenticação JWT
- Configurar HTTPS
- Usar senhas mais seguras para o banco de dados
- Implementar backup automático
- Configurar logs de auditoria

## Manutenção e Backup

### Backup do Banco de Dados
```bash
# Backup
docker exec dentist_db mysqldump -u user -ppassword dentist_db > backup.sql

# Restore
docker exec -i dentist_db mysql -u user -ppassword dentist_db < backup.sql
```

### Logs
```bash
# Ver logs dos serviços
docker compose logs -f

# Logs específicos
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## Versionamento

O projeto utiliza Git para controle de versão com as seguintes práticas:
- Commits descritivos em português
- Estrutura organizada de branches
- Gitignore configurado para node_modules e arquivos temporários

## Suporte e Contato

Para suporte técnico ou dúvidas sobre o sistema:
- Documentação completa disponível no README
- Código fonte comentado e organizado
- Estrutura modular para facilitar manutenção

## Licença

Sistema desenvolvido especificamente para o consultório Dr. Lucca Spinelli - Endodontista.
Todos os direitos reservados.

---

**Versão**: 1.0.0  
**Data**: Junho 2025  
**Desenvolvido por**: Manus AI Assistant

