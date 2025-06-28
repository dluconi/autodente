# Sistema de Cadastro de Dentistas - Dr. Lucca Spinelli

## Visão Geral

Este é um sistema completo de cadastro de pacientes desenvolvido especificamente para o consultório do Dr. Lucca Spinelli, especialista em Endodontia. O sistema oferece uma interface moderna e intuitiva para gerenciar informações de pacientes de forma eficiente e segura.

## Características Principais

### Funcionalidades
- **Autenticação Segura com JWT**: Login por email e senha, com perfis de acesso (Admin, Comum).
- **Perfis de Acesso**:
    - **Admin**: Visualiza todas as agendas, aprova pagamentos, gerencia usuários.
    - **Comum (Dentista)**: Visualiza apenas sua própria agenda, registra pagamentos (pendentes de aprovação).
- **Módulo de Aprovação de Pagamentos (Admin)**: Interface para aprovar/rejeitar pagamentos.
- **Cadastro Completo de Pacientes**: Formulário abrangente com múltiplas seções.
- **Gerenciamento de Agendamentos**: Visualização de agenda semanal, drag-and-drop para reagendar (com validação de conflitos e permissões).
- **Consulta e Busca de Pacientes**: Interface para visualizar e pesquisar pacientes.
- **Histórico do Paciente**: Registro de informações clínicas e anexos.
- **Orçamentos**: Criação e visualização de orçamentos para pacientes.
- **Interface Responsiva**: Design adaptável.
- **Validação de Dados**: Frontend e backend.

### Seções do Cadastro de Paciente
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
- **Autenticação**: JWT (JSON Web Tokens)
- **Banco de Dados**: MySQL 8.0 (ou SQLite para desenvolvimento local simplificado)
- **ORM**: SQLAlchemy
- **API**: REST API com endpoints para CRUD de pacientes, usuários, agendamentos, pagamentos, etc.
- **Validação**: Validação de dados no servidor.
- **CORS**: Configurado para permitir requisições do frontend.

### Frontend (React)
- **Framework**: React 18 com Vite
- **Roteamento**: React Router DOM
- **UI Components**: shadcn/ui com Tailwind CSS
- **Ícones**: Lucide React
- **Formulários**: Formulários controlados com validação
- **Design**: Interface moderna com gradientes e animações

### Banco de Dados
- **SGBD**: MySQL 8.0 (configurado no `docker-compose.yml` e `mysql_init.sql`)
- **Estrutura**:
    - `usuarios`: Armazena dados dos usuários do sistema (dentistas, administradores), incluindo email, senha hash e perfil.
    - `pacientes`: Informações detalhadas dos pacientes (anteriormente `dentist`).
    - `pagamentos`: Registros de pagamentos, com status, valor, paciente associado, dentista que registrou e admin que aprovou/rejeitou.
    - `appointments`: Agendamentos, associados a pacientes e dentistas.
    - `budgets`, `budget_procedures`: Para orçamentos.
    - `historico_pacientes`: Histórico clínico dos pacientes.
- **Dados de Exemplo**: Pacientes de exemplo e um usuário administrador padrão criado na inicialização do backend (`admin@example.com` / `admin123`).
- **Indexação**: Índices em campos chave como CPF (pacientes) e email (usuários) para performance e unicidade.

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
- **Usuário Admin Padrão**: `admin@example.com`
- **Senha Admin Padrão**: `admin123`
- Outros usuários (dentistas) podem ser cadastrados pelo admin.

### Fluxo de Trabalho (Exemplos)

**Administrador:**
1.  **Login** como Admin.
2.  **Dashboard**: Visualiza todos os módulos.
3.  **Cadastrar Usuário**: Acessa o painel de admin e cadastra novos usuários (dentistas ou outros admins).
4.  **Aprovar Pagamentos**: Acessa o módulo de aprovações para aprovar/rejeitar pagamentos registrados por dentistas.
5.  **Visualizar Agendas**: Pode visualizar a agenda de qualquer dentista (funcionalidade de filtro pode ser adicionada).

**Dentista (Usuário Comum):**
1.  **Login** com suas credenciais.
2.  **Dashboard**: Visualiza módulos permitidos para seu perfil.
3.  **Novo Paciente**: Cadastra um novo paciente.
4.  **Agendamento**: Gerencia sua própria agenda, cria novos agendamentos para seus pacientes.
5.  **Registrar Pagamento**: Após um atendimento, acessa a ficha do paciente e registra um pagamento (que ficará pendente de aprovação).
6.  **Consultar Pacientes**: Busca e gerencia seus pacientes.

## API Endpoints Principais

### Autenticação
- `POST /api/login`: Autentica um usuário e retorna um token JWT e dados do usuário (incluindo perfil).

### Usuários (Dentistas/Admins)
- `POST /api/usuarios`: (Admin) Cadastra um novo usuário.
- `GET /api/dentistas`: Lista usuários com perfil 'comum' (dentistas).

### Pacientes
- `GET /api/pacientes`: Lista todos os pacientes (protegido por token).
- `POST /api/pacientes`: Cria um novo paciente (protegido por token).
- `GET /api/pacientes/{id}`: Obtém um paciente específico.
- `PUT /api/pacientes/{id}`: Atualiza um paciente.
- `DELETE /api/pacientes/{id}`: Exclui um paciente.

### Agendamentos (Appointments)
- `GET /api/appointments`: Lista agendamentos. Admin vê todos; Comum vê apenas os seus.
- `POST /api/appointments`: Cria um novo agendamento.
- `PUT /api/appointments/{id}`: Atualiza um agendamento.
- `DELETE /api/appointments/{id}`: Exclui um agendamento.

### Pagamentos
- `POST /api/pagamentos`: (Comum) Registra um novo pagamento (status inicial 'pendente').
- `GET /api/pagamentos/pendentes`: (Admin) Lista todos os pagamentos com status 'pendente'.
- `POST /api/pagamentos/{id}/aprovar`: (Admin) Aprova um pagamento.
- `POST /api/pagamentos/{id}/rejeitar`: (Admin) Rejeita um pagamento.

### Outros
- Endpoints para Orçamentos (`/api/budgets/...`) e Histórico (`/api/historico/...`) também disponíveis.

## Configuração do Banco de Dados

### Variáveis de Ambiente (Backend)
- `DATABASE_URL`: URL de conexão com o banco de dados (Ex: `mysql+pymysql://user:password@db:3306/dentist_db` para Docker, ou local).
- `JWT_SECRET_KEY`: Chave secreta para assinar os tokens JWT (importante alterar para produção).
- `ADMIN_EMAIL`, `ADMIN_NOME`, `ADMIN_SENHA`: (Opcional) Credenciais para criação automática do primeiro usuário admin se não existir.

### Variáveis de Ambiente (MySQL - docker-compose.yml)
- `MYSQL_ROOT_PASSWORD`: Senha root do MySQL.
- `MYSQL_DATABASE`: Nome do banco de dados a ser criado (`dentist_db`).
- `MYSQL_USER`: Usuário a ser criado para a aplicação.
- `MYSQL_PASSWORD`: Senha para o usuário da aplicação.

## Segurança

### Medidas Implementadas
- **Autenticação JWT**: Tokens são usados para proteger as rotas da API.
- **Hashing de Senhas**: Senhas dos usuários são armazenadas com hash (usando `werkzeug.security`).
- **Controle de Acesso por Perfil**: Rotas e funcionalidades são restritas com base no perfil do usuário (admin/comum) tanto no backend quanto no frontend.
- Validação de entrada no frontend e backend.
- Sanitização de dados SQL através do SQLAlchemy ORM.
- CORS configurado adequadamente.
- Senhas de banco de dados e `JWT_SECRET_KEY` gerenciadas por variáveis de ambiente.

### Recomendações para Produção
- **Alterar `JWT_SECRET_KEY`**: Use uma chave secreta forte e única.
- **Alterar Credenciais Admin Padrão**: Mude a senha do usuário admin padrão após a primeira inicialização ou configure-a via variáveis de ambiente.
- Configurar HTTPS para toda a comunicação.
- Usar senhas fortes para o banco de dados.
- Implementar backups regulares do banco de dados.
- Configurar logs de auditoria detalhados.
- Revisar e restringir permissões de banco de dados do usuário da aplicação.

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

