from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS
import os
import re # Para regex de email e telefone
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

app = Flask(__name__)

# Ativa CORS global em todas as rotas
CORS(app, supports_credentials=True)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///dentist.db') # Ajustado para 'DATABASE_URL_PROFILES' ou similar se necessário
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-super-secret-key-change-me') # Mude isso em produção!


db = SQLAlchemy(app)


# --- Decorators de Autenticação ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token é obrigatório!'}), 401

        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = Usuario.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Usuário do token não encontrado!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirou!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido!'}), 401
        except Exception as e:
            return jsonify({'message': f'Erro ao decodificar token: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.perfil != 'admin':
            return jsonify({'message': 'Acesso restrito a administradores!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# --- Funções de Validação ---
def is_valid_cpf(cpf: str) -> bool:
    if not cpf: return True # Permite CPF nulo/vazio se o campo for opcional
    # Remove caracteres não numéricos
    cpf_num = re.sub(r'[^0-9]', '', cpf)
    if len(cpf_num) != 11 or len(set(cpf_num)) == 1:
        return False
    # Validação básica de dígito verificador (simplificada para exemplo)
    # Uma validação completa de DV seria mais complexa
    # Aqui, apenas verificamos o formato e se não são todos números iguais.
    # Para uma validação real, usar uma biblioteca como "validate_docbr".
    return True

def is_valid_email(email: str) -> bool:
    if not email: return True # Permite email nulo/vazio se nao_possui_email=True ou opcional
    # Regex simples para validação de email
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def is_valid_phone(phone: str) -> bool:
    if not phone: return True # Permite telefone nulo/vazio se opcional
    # Remove caracteres não numéricos
    phone_num = re.sub(r'[^0-9]', '', phone)
    # Verifica se tem entre 10 e 11 dígitos (comum para fixo e celular no Brasil)
    return 10 <= len(phone_num) <= 11


# Models
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False) # Novo campo
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False) # Mantido único, mas não para login
    senha_hash = db.Column(db.String(255), nullable=False)
    perfil = db.Column(db.String(10), nullable=False, default='comum') # 'admin' ou 'comum'
    status = db.Column(db.String(10), nullable=False, default='ativo') # Novo campo: 'ativo' ou 'inativo'

    # Relacionamentos para pagamentos
    pagamentos_registrados = db.relationship('Pagamento', foreign_keys='Pagamento.dentista_id', backref='dentista_que_registrou', lazy=True)
    pagamentos_aprovados = db.relationship('Pagamento', foreign_keys='Pagamento.aprovado_por_id', backref='admin_que_aprovou', lazy=True)

    # Relacionamentos para agendamentos
    agendamentos_como_dentista = db.relationship('Appointment', foreign_keys='Appointment.dentista_id', backref='dentista_responsavel', lazy=True)

    def set_password(self, password):
        self.senha_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.senha_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'nome': self.nome, # 'nome' é usado como nome completo para exibição
            'email': self.email,
            'perfil': self.perfil,
            'status': self.status # Adicionado status
        }

class Paciente(db.Model): # Renomeado de Patient para Paciente
    __tablename__ = 'pacientes' # Nome da tabela explicitamente definido
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados Cadastrais
    nome = db.Column(db.String(100), nullable=False)
    sobrenome = db.Column(db.String(100), nullable=True)
    data_nascimento = db.Column(db.Date, nullable=True)
    sexo = db.Column(db.String(10), nullable=True)
    cpf = db.Column(db.String(14), nullable=True, unique=True)
    rg = db.Column(db.String(20), nullable=True)
    estado_civil = db.Column(db.String(20), nullable=True)
    escolaridade = db.Column(db.String(50), nullable=True)
    como_conheceu = db.Column(db.String(100), nullable=True)
    observacoes = db.Column(db.Text, nullable=True)
    cadastrado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Contato
    fone_fixo = db.Column(db.String(20), nullable=True)
    celular = db.Column(db.String(20), nullable=True)
    outros_telefones = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    nao_possui_email = db.Column(db.Boolean, default=False)
    
    # Endereço
    cep = db.Column(db.String(10), nullable=True)
    cidade = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(2), nullable=True)
    endereco = db.Column(db.String(200), nullable=True)
    numero = db.Column(db.String(10), nullable=True)
    bairro = db.Column(db.String(50), nullable=True)
    complemento = db.Column(db.String(100), nullable=True)
    
    # Dados Complementares
    profissao = db.Column(db.String(100), nullable=True)
    local_trabalho = db.Column(db.String(100), nullable=True)
    num_prontuario = db.Column(db.String(20), nullable=True)
    tempo_trabalho = db.Column(db.String(50), nullable=True)
    nome_plano = db.Column(db.String(100), nullable=True)
    numero_plano = db.Column(db.String(50), nullable=True)
    
    # Filiação
    nome_pai = db.Column(db.String(100), nullable=True)
    cpf_pai = db.Column(db.String(14), nullable=True)
    profissao_pai = db.Column(db.String(100), nullable=True)
    rg_pai = db.Column(db.String(20), nullable=True)
    nome_mae = db.Column(db.String(100), nullable=True)
    cpf_mae = db.Column(db.String(14), nullable=True)
    profissao_mae = db.Column(db.String(100), nullable=True)
    rg_mae = db.Column(db.String(20), nullable=True)
    
    # Representante Legal
    nome_representante = db.Column(db.String(100), nullable=True)
    cpf_representante = db.Column(db.String(14), nullable=True)
    rg_representante = db.Column(db.String(20), nullable=True)
    telefone_representante = db.Column(db.String(20), nullable=True)
    nascimento_representante = db.Column(db.String(50), nullable=True)

    is_fully_registered = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'sobrenome': self.sobrenome,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'sexo': self.sexo,
            'cpf': self.cpf,
            'rg': self.rg,
            'estado_civil': self.estado_civil,
            'escolaridade': self.escolaridade,
            'como_conheceu': self.como_conheceu,
            'observacoes': self.observacoes,
            'cadastrado_em': self.cadastrado_em.isoformat() if self.cadastrado_em else None,
            'fone_fixo': self.fone_fixo,
            'celular': self.celular,
            'outros_telefones': self.outros_telefones,
            'email': self.email,
            'nao_possui_email': self.nao_possui_email,
            'cep': self.cep,
            'cidade': self.cidade,
            'estado': self.estado,
            'endereco': self.endereco,
            'numero': self.numero,
            'bairro': self.bairro,
            'complemento': self.complemento,
            'profissao': self.profissao,
            'local_trabalho': self.local_trabalho,
            'num_prontuario': self.num_prontuario,
            'tempo_trabalho': self.tempo_trabalho,
            'nome_plano': self.nome_plano,
            'numero_plano': self.numero_plano,
            'nome_pai': self.nome_pai,
            'cpf_pai': self.cpf_pai,
            'profissao_pai': self.profissao_pai,
            'rg_pai': self.rg_pai,
            'nome_mae': self.nome_mae,
            'cpf_mae': self.cpf_mae,
            'profissao_mae': self.profissao_mae,
            'rg_mae': self.rg_mae,
            'nome_representante': self.nome_representante,
            'cpf_representante': self.cpf_representante,
            'rg_representante': self.rg_representante,
            'telefone_representante': self.telefone_representante,
            'nascimento_representante': self.nascimento_representante,
            'is_fully_registered': self.is_fully_registered
        }

class Pagamento(db.Model):
    __tablename__ = 'pagamentos'
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    dentista_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False) # Quem registrou/realizou o procedimento
    valor = db.Column(db.Float, nullable=False)
    data_pagamento = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    status = db.Column(db.String(20), nullable=False, default='pendente') # 'pendente', 'aprovado', 'rejeitado'
    aprovado_por_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True) # Admin que aprovou/rejeitou
    data_acao_aprovacao = db.Column(db.DateTime, nullable=True)

    paciente = db.relationship('Paciente', backref=db.backref('pagamentos', lazy=True))
    # dentista = db.relationship('Usuario', foreign_keys=[dentista_id], backref=db.backref('pagamentos_realizados', lazy=True))
    # aprovado_por = db.relationship('Usuario', foreign_keys=[aprovado_por_id], backref=db.backref('pagamentos_processados', lazy=True))


    def to_dict(self):
        dentista_responsavel = Usuario.query.get(self.dentista_id)
        admin_acao = Usuario.query.get(self.aprovado_por_id) if self.aprovado_por_id else None
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'paciente_nome': f"{self.paciente.nome} {self.paciente.sobrenome or ''}" if self.paciente else "Paciente não encontrado",
            'dentista_id': self.dentista_id,
            'dentista_nome': dentista_responsavel.nome if dentista_responsavel else "Dentista não encontrado",
            'valor': self.valor,
            'data_pagamento': self.data_pagamento.isoformat(),
            'status': self.status,
            'aprovado_por_id': self.aprovado_por_id,
            'aprovado_por_nome': admin_acao.nome if admin_acao else None,
            'data_acao_aprovacao': self.data_acao_aprovacao.isoformat() if self.data_acao_aprovacao else None
        }

class Budget(db.Model):
    __tablename__ = 'budgets'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False) # Alterado para 'pacientes.id'
    patient = db.relationship('Paciente', backref=db.backref('budgets', lazy=True)) # Alterado para 'Paciente'
    clinic_name = db.Column(db.String(100), nullable=False)
    observations = db.Column(db.Text, nullable=True)
    total_value = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(20), nullable=False, default='pending') # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.nome} {self.patient.sobrenome or ''}" if self.patient else "Paciente não encontrado",
            'clinic_name': self.clinic_name,
            'observations': self.observations,
            'total_value': self.total_value,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'procedures': [procedure.to_dict() for procedure in self.procedures]
        }

class BudgetProcedure(db.Model):
    __tablename__ = 'budget_procedures'
    id = db.Column(db.Integer, primary_key=True)
    budget_id = db.Column(db.Integer, db.ForeignKey('budgets.id'), nullable=False) # Alterado para 'budgets.id'
    budget = db.relationship('Budget', backref=db.backref('procedures', lazy=True))
    table_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    tooth = db.Column(db.String(10), nullable=True)
    dentist = db.Column(db.String(100), nullable=True) # Nome do dentista (string), pode ser FK para Usuario no futuro
    value = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'budget_id': self.budget_id,
            'table_name': self.table_name,
            'description': self.description,
            'tooth': self.tooth,
            'dentist': self.dentist,
            'value': self.value
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False) # Alterado para 'pacientes.id'
    dentista_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False) # Novo campo
    patient = db.relationship('Paciente', backref=db.backref('appointments', lazy=True)) # Alterado para 'Paciente'
    # dentista = db.relationship('Usuario', backref=db.backref('appointments_as_dentist', lazy=True)) # Removido, já existe em Usuario
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.String(5), nullable=False) # HH:MM
    observacao = db.Column(db.Text, nullable=True) 
    duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        paciente_nome_completo = "Paciente não encontrado"
        if self.patient:
            paciente_nome_completo = self.patient.nome
            if self.patient.sobrenome:
                paciente_nome_completo += ' ' + self.patient.sobrenome
        
        dentista_obj = Usuario.query.get(self.dentista_id)
        dentista_nome = dentista_obj.nome if dentista_obj else "Dentista não informado"

        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': paciente_nome_completo,
            'dentista_id': self.dentista_id,
            'dentista_nome': dentista_nome,
            'appointment_date': self.appointment_date.isoformat(),
            'appointment_time': self.appointment_time,
            'observacao': self.observacao, 
            'duration_minutes': self.duration_minutes,
            'created_at': self.created_at.isoformat(),
            'patient_is_fully_registered': self.patient.is_fully_registered if self.patient else False 
        }

class HistoricoPaciente(db.Model):
    __tablename__ = 'historico_pacientes'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False) # Alterado para 'pacientes.id'
    patient = db.relationship('Paciente', backref=db.backref('historicos', lazy=True)) # Alterado para 'Paciente'
    historico = db.Column(db.Text, nullable=True)
    arquivo_nome = db.Column(db.String(255), nullable=True)
    arquivo_tipo = db.Column(db.String(100), nullable=True)
    arquivo_tamanho = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'historico': self.historico,
            'arquivo_nome': self.arquivo_nome,
            'arquivo_tipo': self.arquivo_tipo,
            'arquivo_tamanho': self.arquivo_tamanho,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username') # Alterado de email para username
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Usuário e senha são obrigatórios'}), 400

    user = Usuario.query.filter_by(username=username).first() # Busca por username

    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

    # Geração do Token JWT
    token_payload = {
        'user_id': user.id,
        'perfil': user.perfil,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24) # Token expira em 24 horas
    }
    token = jwt.encode(token_payload, app.config['JWT_SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'success': True,
        'message': 'Login realizado com sucesso',
        'token': token,
        'user': user.to_dict() # Retorna dados do usuário, incluindo perfil
    })

@app.route("/api/usuarios", methods=["POST"])
@admin_required # Apenas admins podem criar novos usuários (dentistas/admins)
def create_usuario(current_user):
    data = request.get_json()
    username = data.get('username')
    nome = data.get('nome')
    email = data.get('email')
    password = data.get('password')
    perfil = data.get('perfil', 'comum')

    if not username or not nome or not email or not password:
        return jsonify({"success": False, "message": "Nome de usuário, nome, email e senha são obrigatórios."}), 400

    if not is_valid_email(email):
        return jsonify({"success": False, "message": "Email inválido."}), 400

    if perfil not in ['admin', 'comum']:
        return jsonify({"success": False, "message": "Perfil inválido. Use 'admin' ou 'comum'."}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Nome de usuário já cadastrado."}), 409

    if Usuario.query.filter_by(email=email).first(): # Email também deve ser único
        return jsonify({"success": False, "message": "Email já cadastrado."}), 409

    try:
        # O status padrão é 'ativo' conforme definido no modelo
        novo_usuario = Usuario(username=username, nome=nome, email=email, perfil=perfil)
        novo_usuario.set_password(password)
        db.session.add(novo_usuario)
        db.session.commit()
        return jsonify({"success": True, "message": "Usuário cadastrado com sucesso", "usuario": novo_usuario.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao cadastrar usuário: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao cadastrar usuário."}), 500

@app.route("/api/usuarios", methods=["GET"])
@admin_required
def get_usuarios(current_user):
    try:
        usuarios = Usuario.query.order_by(Usuario.nome).all()
        return jsonify({"success": True, "usuarios": [usuario.to_dict() for usuario in usuarios]}), 200
    except Exception as e:
        app.logger.error(f"Erro ao buscar usuários: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao buscar usuários."}), 500

@app.route("/api/usuarios/<int:user_id>/status", methods=["PUT"])
@admin_required
def update_usuario_status(current_user, user_id):
    data = request.get_json()
    novo_status = data.get('status')

    if not novo_status or novo_status not in ['ativo', 'inativo']:
        return jsonify({"success": False, "message": "Status inválido. Use 'ativo' ou 'inativo'."}), 400

    usuario_alvo = Usuario.query.get(user_id)

    if not usuario_alvo:
        return jsonify({"success": False, "message": "Usuário não encontrado."}), 404

    # Regra de segurança: não permitir que um admin desative a si próprio se for o único admin ativo.
    if usuario_alvo.id == current_user.id and novo_status == 'inativo' and usuario_alvo.perfil == 'admin':
        admins_ativos = Usuario.query.filter_by(perfil='admin', status='ativo').count()
        if admins_ativos <= 1:
            return jsonify({"success": False, "message": "Não é possível desativar o único administrador ativo do sistema."}), 403

    # Não permitir desativar o usuário admin padrão se ele for o alvo e for o único admin
    # Esta verificação é similar à de cima, mas mais explícita para o admin padrão.
    if usuario_alvo.username == 'admin' and novo_status == 'inativo' and usuario_alvo.perfil == 'admin':
        admins_ativos = Usuario.query.filter_by(perfil='admin', status='ativo').count()
        if admins_ativos <= 1 and Usuario.query.filter_by(perfil='admin', status='ativo', id=usuario_alvo.id).count() == 1:
             return jsonify({"success": False, "message": "Não é possível desativar o administrador principal se for o único ativo."}), 403


    usuario_alvo.status = novo_status
    try:
        db.session.commit()
        return jsonify({"success": True, "message": f"Status do usuário '{usuario_alvo.username}' atualizado para '{novo_status}'.", "usuario": usuario_alvo.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao atualizar status do usuário {user_id}: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao atualizar status do usuário."}), 500

@app.route("/api/usuarios/<int:user_id>", methods=["PUT"])
@admin_required
def update_usuario(current_user, user_id):
    usuario_alvo = Usuario.query.get_or_404(user_id)
    data = request.get_json()

    # Campos que podem ser atualizados
    novo_username = data.get('username', usuario_alvo.username)
    novo_nome = data.get('nome', usuario_alvo.nome)
    novo_email = data.get('email', usuario_alvo.email)
    novo_perfil = data.get('perfil', usuario_alvo.perfil)
    # Senha não é atualizada aqui para simplicidade; status tem endpoint dedicado.

    if not novo_username or not novo_nome or not novo_email:
        return jsonify({"success": False, "message": "Username, nome e email são obrigatórios."}), 400

    if not is_valid_email(novo_email):
        return jsonify({"success": False, "message": "Email inválido."}), 400

    if novo_perfil not in ['admin', 'comum']:
        return jsonify({"success": False, "message": "Perfil inválido. Use 'admin' ou 'comum'."}), 400

    # Verificar unicidade de username se ele foi alterado
    if novo_username != usuario_alvo.username and Usuario.query.filter_by(username=novo_username).first():
        return jsonify({"success": False, "message": "Novo nome de usuário já está em uso."}), 409

    # Verificar unicidade de email se ele foi alterado
    if novo_email != usuario_alvo.email and Usuario.query.filter_by(email=novo_email).first():
        return jsonify({"success": False, "message": "Novo email já está em uso."}), 409

    # Regra de segurança: não permitir que o último admin mude seu perfil para 'comum'
    if usuario_alvo.perfil == 'admin' and novo_perfil == 'comum':
        if usuario_alvo.status == 'ativo': # Só considera se o admin estiver ativo
            admins_ativos = Usuario.query.filter_by(perfil='admin', status='ativo').count()
            if admins_ativos <= 1 and usuario_alvo.id == current_user.id: # E se for o próprio admin tentando se rebaixar
                 return jsonify({"success": False, "message": "Não é possível alterar o perfil do único administrador ativo para 'comum'."}), 403
        # Se o admin que está sendo editado não é o que está logado, ou se há outros admins ativos, permite a mudança.
        # Ou se o admin sendo editado está inativo, também permite.

    usuario_alvo.username = novo_username
    usuario_alvo.nome = novo_nome
    usuario_alvo.email = novo_email
    usuario_alvo.perfil = novo_perfil

    # Nova senha (opcional)
    nova_senha = data.get('password')
    if nova_senha:
        if len(nova_senha) < 6: # Exemplo de validação mínima de senha
            return jsonify({"success": False, "message": "A nova senha deve ter pelo menos 6 caracteres."}), 400
        usuario_alvo.set_password(nova_senha)

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Usuário atualizado com sucesso.", "usuario": usuario_alvo.to_dict()}), 200
    except IntegrityError as ie: # Captura erros de unicidade que podem ter passado
        db.session.rollback()
        app.logger.error(f"Erro de integridade ao atualizar usuário {user_id}: {str(ie)}")
        # Mensagens mais específicas podem ser dadas baseadas no erro exato de 'ie'
        if 'UNIQUE constraint failed: usuarios.username' in str(ie) or 'Duplicate entry' in str(ie).lower() and 'for key \'usuarios.username\'' in str(ie).lower():
            return jsonify({"success": False, "message": "Nome de usuário já existe."}), 409
        if 'UNIQUE constraint failed: usuarios.email' in str(ie) or 'Duplicate entry' in str(ie).lower() and 'for key \'usuarios.email\'' in str(ie).lower():
            return jsonify({"success": False, "message": "Email já existe."}), 409
        return jsonify({"success": False, "message": "Erro de integridade dos dados."}), 409
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao atualizar usuário {user_id}: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao atualizar usuário."}), 500


@app.route("/api/pacientes", methods=["GET"]) # Renomeado de /api/patients para /api/pacientes
@token_required
def get_pacientes(current_user):
    pacientes = Paciente.query.all() # Renomeado de Patient para Paciente
    return jsonify([paciente.to_dict() for paciente in pacientes])

@app.route("/api/pacientes", methods=["POST"]) # Renomeado de /api/patients para /api/pacientes
@token_required # Todos usuários logados podem cadastrar pacientes
def create_paciente(current_user):
    data = request.get_json()
    errors = {}

    # Validações
    nome = data.get("nome")
    if not nome or len(nome.strip()) == 0:
        errors["nome"] = "Nome é obrigatório."

    # Adicionando validação para sobrenome se for decidido que é obrigatório no backend
    sobrenome = data.get("sobrenome")
    # if not sobrenome or len(sobrenome.strip()) == 0: # Descomentar se sobrenome for obrigatório
    #     errors["sobrenome"] = "Sobrenome é obrigatório."

    cpf = data.get("cpf")
    if cpf and not is_valid_cpf(cpf):
        errors["cpf"] = "CPF inválido."

    email = data.get("email")
    nao_possui_email = data.get("nao_possui_email", False)
    if not nao_possui_email and email and not is_valid_email(email):
        errors["email"] = "Email inválido."
    if nao_possui_email: # Garante que o email seja nulo se a flag estiver ativa
        email = None
        data["email"] = None # Atualiza o 'data' para consistência ao criar o Paciente

    celular = data.get("celular")
    if celular and not is_valid_phone(celular):
        errors["celular"] = "Número de celular inválido."

    fone_fixo = data.get("fone_fixo")
    if fone_fixo and not is_valid_phone(fone_fixo): # Mesma validação para fixo
        errors["fone_fixo"] = "Número de telefone fixo inválido."

    data_nascimento_str = data.get("data_nascimento")
    data_nascimento_obj = None
    if data_nascimento_str:
        try:
            data_nascimento_obj = datetime.strptime(data_nascimento_str, "%Y-%m-%d").date()
        except ValueError:
            errors["data_nascimento"] = "Formato de data de nascimento inválido. Use YYYY-MM-DD."
    
    if errors:
        return jsonify({"success": False, "message": "Erro de validação", "errors": errors}), 400

    try:
        paciente = Paciente( # Renomeado de Patient para Paciente
            nome=nome,
            sobrenome=sobrenome,
            data_nascimento=data_nascimento_obj,
            sexo=data.get("sexo"),
            cpf=cpf,
            rg=data.get("rg"),
            estado_civil=data.get("estado_civil"),
            escolaridade=data.get("escolaridade"),
            como_conheceu=data.get("como_conheceu"),
            observacoes=data.get("observacoes"),
            fone_fixo=fone_fixo,
            celular=celular,
            outros_telefones=data.get("outros_telefones"),
            email=email,
            nao_possui_email=nao_possui_email,
            cep=data.get("cep"),
            cidade=data.get("cidade"),
            estado=data.get("estado"),
            endereco=data.get("endereco"),
            numero=data.get("numero"),
            bairro=data.get("bairro"),
            complemento=data.get("complemento"),
            profissao=data.get("profissao"),
            local_trabalho=data.get("local_trabalho"),
            num_prontuario=data.get("num_prontuario"),
            tempo_trabalho=data.get("tempo_trabalho"),
            nome_plano=data.get("nome_plano"),
            numero_plano=data.get("numero_plano"),
            nome_pai=data.get("nome_pai"),
            cpf_pai=data.get("cpf_pai"),
            profissao_pai=data.get("profissao_pai"),
            rg_pai=data.get("rg_pai"),
            nome_mae=data.get("nome_mae"),
            cpf_mae=data.get("cpf_mae"),
            profissao_mae=data.get("profissao_mae"),
            rg_mae=data.get("rg_mae"),
            nome_representante=data.get("nome_representante"),
            cpf_representante=data.get("cpf_representante"),
            rg_representante=data.get("rg_representante"),
            telefone_representante=data.get("telefone_representante"),
            nascimento_representante=data.get("nascimento_representante"),
            is_fully_registered=True
        )
        
        db.session.add(paciente)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Paciente cadastrado com sucesso", "id": paciente.id}), 201

    except IntegrityError as e:
        db.session.rollback()
        if "UNIQUE constraint failed: pacientes.cpf" in str(e) or \
           "Duplicate entry" in str(e).lower() and "for key 'pacientes.cpf'" in str(e).lower() or \
           "for key 'cpf'" in str(e).lower() and "pacientes" in str(e).lower() : # Adaptar para a msg do seu DB (SQLite vs MySQL)
            return jsonify({"success": False, "message": "CPF já cadastrado."}), 409
        return jsonify({"success": False, "message": f"Erro de integridade no banco de dados: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao cadastrar paciente: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao cadastrar paciente. Tente novamente mais tarde."}), 500

@app.route("/api/pacientes/<int:paciente_id>", methods=["GET"]) # Renomeado patient_id para paciente_id
@token_required
def get_paciente(current_user, paciente_id): # Renomeado patient_id para paciente_id
    paciente = Paciente.query.get_or_404(paciente_id) # Renomeado de Patient para Paciente
    return jsonify({
        "success": True,
        "data": paciente.to_dict()
    })

@app.route("/api/pacientes/<int:paciente_id>", methods=["PUT"]) # Renomeado patient_id para paciente_id
@token_required
def update_paciente(current_user, paciente_id): # Renomeado patient_id para paciente_id
    paciente = Paciente.query.get_or_404(paciente_id) # Renomeado de Patient para Paciente
    data = request.get_json()
    errors = {}

    # Validações (exemplo para alguns campos, aplicar a todos que precisam)
    if "nome" in data and (not data["nome"] or len(data["nome"].strip()) == 0):
        errors["nome"] = "Nome é obrigatório."

    if "cpf" in data and data["cpf"] and not is_valid_cpf(data["cpf"]):
        errors["cpf"] = "CPF inválido."
    
    email_update = data.get("email")
    nao_possui_email_update = data.get("nao_possui_email", paciente.nao_possui_email) # Usa valor existente se não fornecido

    if not nao_possui_email_update and email_update and not is_valid_email(email_update):
        errors["email"] = "Email inválido."

    if nao_possui_email_update:
        data["email"] = None # Garante que o email seja nulo se a flag estiver ativa

    if "data_nascimento" in data and data["data_nascimento"]:
        try:
            datetime.strptime(data["data_nascimento"], "%Y-%m-%d").date()
        except ValueError:
            errors["data_nascimento"] = "Formato de data de nascimento inválido. Use YYYY-MM-DD."

    if errors:
        return jsonify({"success": False, "message": "Erro de validação", "errors": errors}), 400

    try:
        for field in data:
            if field == "data_nascimento" and data[field]:
                setattr(paciente, field, datetime.strptime(data[field], "%Y-%m-%d").date())
            elif hasattr(paciente, field):
                if field == "nao_possui_email" and data[field] is True:
                    paciente.email = None
                setattr(paciente, field, data[field])
        
        paciente.is_fully_registered = True # Garante que está marcado como completo
        db.session.commit()
        return jsonify({"success": True, "message": "Paciente atualizado com sucesso"})

    except IntegrityError as e:
        db.session.rollback()
        if "UNIQUE constraint failed: pacientes.cpf" in str(e) or \
           "Duplicate entry" in str(e).lower() and "for key 'pacientes.cpf'" in str(e).lower() or \
           "for key 'cpf'" in str(e).lower() and "pacientes" in str(e).lower():
            return jsonify({"success": False, "message": "CPF já cadastrado para outro paciente."}), 409
        return jsonify({"success": False, "message": f"Erro de integridade no banco de dados: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao atualizar paciente {paciente_id}: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao atualizar paciente."}), 500

@app.route("/api/pacientes/<int:paciente_id>", methods=["DELETE"]) # Renomeado patient_id para paciente_id
@token_required # Idealmente @admin_required ou alguma lógica de permissão mais granular
def delete_paciente(current_user, paciente_id): # Renomeado patient_id para paciente_id
    paciente = Paciente.query.get_or_404(paciente_id) # Renomeado de Patient para Paciente
    
    try:
        # Adicionar verificação se há dependências (agendamentos, pagamentos) antes de excluir se necessário
        db.session.delete(paciente)
        db.session.commit()
        return jsonify({"success": True, "message": "Paciente excluído com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir paciente: {str(e)}"}), 500


@app.route("/api/appointments", methods=["POST"])
@token_required
def create_appointment(current_user):
    data = request.get_json()
    patient_name = data.get("patient_name")
    appointment_date_str = data.get("appointment_date")
    appointment_time = data.get("appointment_time")
    observacao = data.get("observacao")
    duration_minutes = data.get("duration_minutes", 30) # Receber duration_minutes, default 30

    # Definição do dentista_id: Se admin, pode ser enviado no payload, senão é o próprio usuário logado
    dentista_id_payload = data.get("dentista_id")
    if current_user.perfil == 'admin' and dentista_id_payload:
        dentista_agendamento_id = dentista_id_payload
        dentista_para_agendamento = Usuario.query.get(dentista_agendamento_id)
        if not dentista_para_agendamento or dentista_para_agendamento.perfil != 'comum':
            return jsonify({"success": False, "message": "Dentista (comum) para agendamento não encontrado ou inválido."}), 404
    elif current_user.perfil == 'comum':
        dentista_agendamento_id = current_user.id
    else: # Admin não especificou dentista_id, assume ele mesmo se for comum (improvável para admin) ou erro
        if current_user.perfil == 'admin' and not dentista_id_payload:
             return jsonify({"success": False, "message": "Admin deve especificar o dentista_id para o agendamento."}), 400
        dentista_agendamento_id = current_user.id # Fallback, mas idealmente admin sempre especifica

    if not patient_name and not data.get("patient_id"):
        return jsonify({"success": False, "message": "Nome do paciente ou ID do paciente é obrigatório."}), 400

    if not appointment_date_str or not appointment_time:
        return jsonify({"success": False, "message": "Data e hora do agendamento são obrigatórios."}), 400

    try:
        appointment_date = datetime.strptime(appointment_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Formato de data inválido. Use YYYY-MM-DD."}), 400

    paciente_id_frontend = data.get("patient_id")
    paciente = None

    if paciente_id_frontend:
        paciente = Paciente.query.get(paciente_id_frontend) # Renomeado de Patient para Paciente
        if not paciente:
             return jsonify({"success": False, "message": f"Paciente com ID {paciente_id_frontend} não encontrado."}), 404
    else:
        # Tentar encontrar paciente pelo nome completo (nome e sobrenome)
        # Isso assume que patient_name pode conter "Nome Sobrenome"
        parts = patient_name.split(" ", 1)
        nome_busca = parts[0]
        sobrenome_busca = parts[1] if len(parts) > 1 else None

        if sobrenome_busca:
            paciente = Paciente.query.filter(Paciente.nome.ilike(nome_busca), Paciente.sobrenome.ilike(sobrenome_busca)).first()
        else:
            paciente = Paciente.query.filter(Paciente.nome.ilike(nome_busca), Paciente.sobrenome.is_(None)).first()
            if not paciente:
                 paciente = Paciente.query.filter(Paciente.nome.ilike(patient_name)).first()

    if not paciente:
        new_paciente_name_parts = patient_name.split(" ", 1)
        paciente = Paciente(
            nome=new_paciente_name_parts[0],
            sobrenome=new_paciente_name_parts[1] if len(new_paciente_name_parts) > 1 else None,
            is_fully_registered=False
        )
        try:
            db.session.add(paciente)
            db.session.flush() # Para obter o ID antes de usá-lo no agendamento
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro ao criar novo paciente durante agendamento: {str(e)}")
            return jsonify({"success": False, "message": f"Erro ao registrar novo paciente: {str(e)}"}), 500
    
    try:
        appointment_time_obj = datetime.strptime(appointment_time, "%H:%M").time()
        new_start_datetime = datetime.combine(appointment_date, appointment_time_obj)
        new_end_datetime = new_start_datetime + timedelta(minutes=int(duration_minutes))
    except ValueError:
        return jsonify({"success": False, "message": "Formato de hora inválido. Use HH:MM."}), 400

    # Verificar conflitos para o dentista específico
    existing_appointments_query = Appointment.query.filter_by(
        appointment_date=appointment_date,
        dentista_id=dentista_agendamento_id
    )
    # Se estiver atualizando, excluir o próprio agendamento da verificação de conflito
    # appointment_id_to_exclude = kwargs.get('appointment_id_to_exclude') # Para rota de update
    # if appointment_id_to_exclude:
    #     existing_appointments_query = existing_appointments_query.filter(Appointment.id != appointment_id_to_exclude)

    existing_appointments_on_date = existing_appointments_query.all()

    for existing_app in existing_appointments_on_date:
        try:
            existing_app_time_obj = datetime.strptime(existing_app.appointment_time, "%H:%M").time()
            existing_start_datetime = datetime.combine(existing_app.appointment_date, existing_app_time_obj)
            existing_end_datetime = existing_start_datetime + timedelta(minutes=existing_app.duration_minutes)

            if max(new_start_datetime, existing_start_datetime) < min(new_end_datetime, existing_end_datetime):
                dentista_conflito = Usuario.query.get(existing_app.dentista_id)
                nome_dentista_conflito = dentista_conflito.nome if dentista_conflito else "desconhecido"
                return jsonify({
                    "success": False, 
                    "message": f"Horário em conflito com agendamento existente para Dr(a). {nome_dentista_conflito} às {existing_app.appointment_time} (duração: {existing_app.duration_minutes} min)."
                }), 409
        except ValueError:
            app.logger.warning(f"Agendamento ID {existing_app.id} com formato de hora inválido no banco de dados.")
            continue 
            
    novo_agendamento = Appointment(
        patient_id=paciente.id,
        dentista_id=dentista_agendamento_id, # Adicionado dentista_id
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        observacao=observacao,
        duration_minutes=int(duration_minutes)
    )

    try:
        db.session.add(novo_agendamento)
        if not paciente.id: # Se o paciente foi criado nesta transação e ainda não foi salvo
             db.session.add(paciente) # Adiciona o paciente à sessão se for novo
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento criado com sucesso", "appointment": novo_agendamento.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao salvar agendamento: {str(e)}")
        return jsonify({"success": False, "message": f"Erro ao criar agendamento: {str(e)}"}), 500

@app.route("/api/appointments", methods=["GET"])
@token_required
def get_appointments(current_user):
    appointments_query = Appointment.query

    if current_user.perfil == 'admin':
        dentista_id_param = request.args.get('dentista_id', type=int)
        if dentista_id_param:
            # Admin está solicitando a agenda de um dentista específico
            target_dentist = Usuario.query.filter_by(id=dentista_id_param, perfil='comum').first()
            if not target_dentist:
                return jsonify({"success": False, "message": f"Dentista com ID {dentista_id_param} não encontrado ou não é um usuário comum."}), 404
            appointments_query = appointments_query.filter_by(dentista_id=dentista_id_param)
        else:
            # Admin não especificou dentista_id, retorna todos os agendamentos (comportamento padrão anterior)
            # Ou poderia retornar uma lista vazia/mensagem para selecionar um dentista.
            # Por enquanto, mantendo o retorno de todos.
            pass # Nenhuma filtragem adicional por dentista_id se não for fornecido
    elif current_user.perfil == 'comum':
        # Usuário comum só pode ver seus próprios agendamentos
        appointments_query = appointments_query.filter_by(dentista_id=current_user.id)
    else:
        return jsonify({"success": False, "message": "Perfil de usuário desconhecido."}), 403

    appointments = appointments_query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()

    # Adicionado success: True e a chave 'appointments' para consistência com outras rotas
    return jsonify({"success": True, "appointments": [appointment.to_dict() for appointment in appointments]})

@app.route("/api/appointments/today", methods=["GET"])
@token_required
def get_appointments_today(current_user):
    today = datetime.now(timezone.utc).date()
    query = Appointment.query.filter_by(appointment_date=today)
    if current_user.perfil == 'comum':
        query = query.filter_by(dentista_id=current_user.id)
    appointments = query.all()
    return jsonify([appointment.to_dict() for appointment in appointments])

@app.route("/api/appointments/tomorrow", methods=["GET"])
@token_required
def get_appointments_tomorrow(current_user):
    tomorrow = datetime.now(timezone.utc).date() + timedelta(days=1)
    query = Appointment.query.filter_by(appointment_date=tomorrow)
    if current_user.perfil == 'comum':
        query = query.filter_by(dentista_id=current_user.id)
    appointments = query.all()
    return jsonify([appointment.to_dict() for appointment in appointments])

@app.route("/api/appointments/<int:appointment_id>", methods=["GET"])
@token_required
def get_appointment_by_id(current_user, appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    if current_user.perfil == 'comum' and appointment.dentista_id != current_user.id:
        return jsonify({"success": False, "message": "Acesso não autorizado a este agendamento."}), 403
    return jsonify(appointment.to_dict())

@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
@token_required
def delete_appointment(current_user, appointment_id):
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        db.session.delete(appointment)
        db.session.commit()
        # Adicionar lógica para verificar se o usuário tem permissão para excluir (ex: admin ou o dentista do agendamento)
        if current_user.perfil == 'comum' and appointment.dentista_id != current_user.id:
            return jsonify({"success": False, "message": "Você não tem permissão para excluir este agendamento."}), 403

        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento excluído com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir agendamento: {str(e)}"}), 500

@app.route("/api/appointments/<int:appointment_id>", methods=["PUT"])
@token_required
def update_appointment_route(current_user, appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    data = request.get_json()

    # Verificar permissão: Admin pode alterar qualquer um, Comum só os seus.
    if current_user.perfil == 'comum' and appointment.dentista_id != current_user.id:
        return jsonify({"success": False, "message": "Você não tem permissão para alterar este agendamento."}), 403

    new_date_str = data.get("appointment_date", appointment.appointment_date.isoformat())
    new_time_str = data.get("appointment_time", appointment.appointment_time)
    new_duration_minutes = int(data.get("duration_minutes", appointment.duration_minutes))
    new_observacao = data.get("observacao", appointment.observacao)
    new_patient_id = data.get("patient_id", appointment.patient_id)

    # Admin pode mudar o dentista do agendamento, usuário comum não.
    new_dentista_id = data.get("dentista_id", appointment.dentista_id)
    if current_user.perfil == 'admin':
        if 'dentista_id' in data: # Se admin está tentando mudar o dentista
            target_dentist = Usuario.query.get(data['dentista_id'])
            if not target_dentist or target_dentist.perfil != 'comum':
                return jsonify({"success": False, "message": "Dentista (comum) de destino inválido ou não encontrado."}), 404
            new_dentista_id = data['dentista_id']
    elif 'dentista_id' in data and data['dentista_id'] != appointment.dentista_id: # Comum tentando mudar dentista
        return jsonify({"success": False, "message": "Você não pode alterar o dentista responsável."}), 403


    try:
        new_appointment_date_obj = datetime.strptime(new_date_str, "%Y-%m-%d").date()
        new_appointment_time_obj = datetime.strptime(new_time_str, "%H:%M").time()
    except ValueError:
        return jsonify({"success": False, "message": "Formato de data ou hora inválido."}), 400

    if new_patient_id != appointment.patient_id:
        new_patient = Paciente.query.get(new_patient_id) # Alterado para Paciente
        if not new_patient:
            return jsonify({"success": False, "message": f"Novo paciente com ID {new_patient_id} não encontrado."}), 404
    
    new_start_dt = datetime.combine(new_appointment_date_obj, new_appointment_time_obj)
    new_end_dt = new_start_dt + timedelta(minutes=new_duration_minutes)

    # Conflito apenas para o dentista do agendamento (new_dentista_id)
    existing_appointments_on_date = Appointment.query.filter(
        Appointment.appointment_date == new_appointment_date_obj,
        Appointment.dentista_id == new_dentista_id, # Verifica conflito para o dentista que terá o agendamento
        Appointment.id != appointment_id
    ).all()

    for existing_app in existing_appointments_on_date:
        existing_app_time_obj = datetime.strptime(existing_app.appointment_time, "%H:%M").time()
        existing_start_datetime = datetime.combine(existing_app.appointment_date, existing_app_time_obj)
        existing_end_datetime = existing_start_datetime + timedelta(minutes=existing_app.duration_minutes)

        if max(new_start_dt, existing_start_datetime) < min(new_end_dt, existing_end_datetime):
            dentista_conflito = Usuario.query.get(existing_app.dentista_id)
            nome_dentista_conflito = dentista_conflito.nome if dentista_conflito else "desconhecido"
            return jsonify({
                "success": False, 
                "message": f"Horário em conflito com outro agendamento para Dr(a). {nome_dentista_conflito} às {existing_app.appointment_time} (duração: {existing_app.duration_minutes} min)."
            }), 409

    appointment.patient_id = new_patient_id
    appointment.dentista_id = new_dentista_id # Atualiza o dentista_id
    appointment.appointment_date = new_appointment_date_obj
    appointment.appointment_time = new_time_str
    appointment.duration_minutes = new_duration_minutes
    appointment.observacao = new_observacao

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento atualizado com sucesso", "appointment": appointment.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao atualizar agendamento: {str(e)}"}), 500

# --- Rotas de Orçamento (Budget) ---
@app.route("/api/budgets", methods=["POST", "OPTIONS"])
@token_required # Assumindo que qualquer usuário logado pode criar orçamentos
def create_budget(current_user):
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    paciente_id = data.get("patient_id") # Alterado de patient_id para paciente_id consistentemente
    clinic_name = data.get("clinic_name", "Dr. Lucca Spinelli")
    observations = data.get("observations", "")
    procedures_data = data.get("procedures", []) # Renomeado para procedures_data

    if not paciente_id or not procedures_data:
        return jsonify({"success": False, "message": "ID do paciente e procedimentos são obrigatórios."}), 400

    paciente_obj = Paciente.query.get(paciente_id)
    if not paciente_obj:
        return jsonify({"success": False, "message": f"Paciente com ID {paciente_id} não encontrado."}), 404

    try:
        total_value = sum(float(proc.get("value", 0)) for proc in procedures_data) # campo 'value' ao invés de 'valor'

        budget = Budget(
            patient_id=paciente_id,
            clinic_name=clinic_name,
            observations=observations,
            total_value=total_value
        )

        db.session.add(budget)
        db.session.flush()

        for proc_data in procedures_data: # Renomeado para proc_data
            procedure = BudgetProcedure(
                budget_id=budget.id,
                table_name=proc_data.get("table_name", ""), # campo 'table_name'
                description=proc_data.get("description", ""), # campo 'description'
                tooth=proc_data.get("tooth", ""), # campo 'tooth'
                dentist=proc_data.get("dentist", ""), # campo 'dentist'
                value=float(proc_data.get("value", 0)) # campo 'value'
            )
            db.session.add(procedure)

        db.session.commit()
        return jsonify({"success": True, "message": "Orçamento criado com sucesso", "budget": budget.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar orçamento: {str(e)}")
        return jsonify({"success": False, "message": f"Erro ao criar orçamento: {str(e)}"}), 500

@app.route("/api/budgets/patient/<int:paciente_id>", methods=["GET"]) # Renomeado patient_id para paciente_id
@token_required
def get_patient_budgets(current_user, paciente_id): # Renomeado patient_id para paciente_id
    # Adicionar verificação se o usuário tem permissão para ver orçamentos deste paciente
    # Por exemplo, se for admin ou o dentista que atende o paciente (requer mais lógica)
    paciente = Paciente.query.get_or_404(paciente_id)
    # Exemplo simples: admin vê todos, comum precisa de lógica adicional
    # if current_user.perfil == 'comum' and ... (lógica de permissão)

    budgets = Budget.query.filter_by(patient_id=paciente_id).all()
    return jsonify([budget.to_dict() for budget in budgets])

@app.route("/api/budgets/<int:budget_id>/approve", methods=["POST"])
@admin_required # Apenas admin pode aprovar orçamentos
def approve_budget(current_user, budget_id):
    try:
        budget = Budget.query.get_or_404(budget_id)
        budget.status = 'approved'
        # budget.approved_by_id = current_user.id # Se quiser registrar quem aprovou o orçamento
        # budget.approved_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({"success": True, "message": "Orçamento aprovado com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao aprovar orçamento: {str(e)}"}), 500

@app.route("/api/dentistas", methods=["GET"]) # Rota para listar dentistas (usuários com perfil 'comum')
@token_required # Todos logados podem ver a lista de dentistas
def get_dentistas(current_user):
    dentistas = Usuario.query.filter_by(perfil='comum').all()
    return jsonify([dentista.to_dict() for dentista in dentistas])

# --- Rotas de Pagamento ---
@app.route("/api/pagamentos", methods=["POST"])
@token_required # Dentista (comum) registra um pagamento
def registrar_pagamento(current_user):
    if current_user.perfil != 'comum':
        return jsonify({"success": False, "message": "Apenas dentistas podem registrar pagamentos."}), 403

    data = request.get_json()
    paciente_id = data.get('paciente_id')
    valor = data.get('valor')

    if not paciente_id or valor is None:
        return jsonify({"success": False, "message": "ID do paciente e valor são obrigatórios."}), 400

    try:
        valor_float = float(valor)
        if valor_float <= 0:
            return jsonify({"success": False, "message": "Valor do pagamento deve ser positivo."}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Valor do pagamento inválido."}), 400

    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"success": False, "message": "Paciente não encontrado."}), 404

    try:
        novo_pagamento = Pagamento(
            paciente_id=paciente_id,
            dentista_id=current_user.id, # Dentista que está registrando
            valor=valor_float,
            status='pendente'
        )
        db.session.add(novo_pagamento)
        db.session.commit()
        return jsonify({"success": True, "message": "Pagamento registrado com sucesso.", "pagamento": novo_pagamento.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao registrar pagamento: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao registrar pagamento."}), 500

@app.route("/api/pagamentos/pendentes", methods=["GET"])
@admin_required # Apenas admin pode ver pagamentos pendentes
def listar_pagamentos_pendentes(current_user):
    pagamentos = Pagamento.query.filter_by(status='pendente').order_by(Pagamento.data_pagamento.desc()).all()
    return jsonify([p.to_dict() for p in pagamentos])

@app.route("/api/pagamentos/<int:pagamento_id>/aprovar", methods=["POST"])
@admin_required # Apenas admin pode aprovar
def aprovar_pagamento(current_user, pagamento_id):
    pagamento = Pagamento.query.get_or_404(pagamento_id)
    if pagamento.status != 'pendente':
        return jsonify({"success": False, "message": f"Pagamento não está pendente (status atual: {pagamento.status})."}), 400

    pagamento.status = 'aprovado'
    pagamento.aprovado_por_id = current_user.id
    pagamento.data_acao_aprovacao = datetime.now(timezone.utc)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Pagamento aprovado com sucesso.", "pagamento": pagamento.to_dict()})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao aprovar pagamento {pagamento_id}: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao aprovar pagamento."}), 500

@app.route("/api/pagamentos/<int:pagamento_id>/rejeitar", methods=["POST"])
@admin_required # Apenas admin pode rejeitar
def rejeitar_pagamento(current_user, pagamento_id):
    pagamento = Pagamento.query.get_or_404(pagamento_id)
    if pagamento.status != 'pendente':
        return jsonify({"success": False, "message": f"Pagamento não está pendente (status atual: {pagamento.status})."}), 400

    pagamento.status = 'rejeitado'
    pagamento.aprovado_por_id = current_user.id # Mesmo campo, indica quem tomou a ação
    pagamento.data_acao_aprovacao = datetime.now(timezone.utc)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Pagamento rejeitado com sucesso.", "pagamento": pagamento.to_dict()})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao rejeitar pagamento {pagamento_id}: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao rejeitar pagamento."}), 500


# --- Rotas de Histórico ---
@app.route("/api/historico", methods=["POST"])
@token_required # Assumindo que usuários logados (dentistas) podem adicionar histórico
def create_historico(current_user):
    try:
        paciente_id = request.form.get('paciente_id') # Alterado de patient_id
        historico_text = request.form.get('historico')
        arquivo = request.files.get('arquivo')
        
        if not paciente_id:
            return jsonify({"success": False, "message": "ID do paciente é obrigatório"}), 400
            
        if not historico_text and not arquivo:
            return jsonify({"success": False, "message": "Histórico ou arquivo é obrigatório"}), 400
        
        paciente = Paciente.query.get(paciente_id) # Alterado de Patient para Paciente
        if not paciente:
            return jsonify({"success": False, "message": "Paciente não encontrado"}), 404
        
        historico = HistoricoPaciente(
            patient_id=paciente_id, # Alterado de patient_id
            historico=historico_text
        )
        
        if arquivo and arquivo.filename:
            import uuid # os já importado no topo
            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            file_extension = os.path.splitext(arquivo.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)
            arquivo.save(file_path)
            historico.arquivo_nome = unique_filename
            historico.arquivo_tipo = arquivo.content_type
            historico.arquivo_tamanho = os.path.getsize(file_path)
        
        db.session.add(historico)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "Histórico salvo com sucesso",
            "historico": historico.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao salvar histórico: {str(e)}")
        return jsonify({"success": False, "message": f"Erro ao salvar histórico: {str(e)}"}), 500

@app.route("/api/historico/patient/<int:paciente_id>", methods=["GET"]) # Renomeado patient_id para paciente_id
@token_required
def get_patient_historicos(current_user, paciente_id): # Renomeado patient_id para paciente_id
    # Adicionar verificação de permissão se necessário
    paciente = Paciente.query.get_or_404(paciente_id)
    historicos = HistoricoPaciente.query.filter_by(patient_id=paciente_id).order_by(HistoricoPaciente.created_at.desc()).all()
    return jsonify({
        "success": True,
        "historicos": [h.to_dict() for h in historicos] # Renomeado historico para h
    })

@app.route("/api/historico/<int:historico_id>", methods=["DELETE"])
@token_required # Adicionar verificação de permissão (admin ou criador do histórico)
def delete_historico(current_user, historico_id):
    try:
        historico = HistoricoPaciente.query.get_or_404(historico_id)
        
        # Remover arquivo se existir
        if historico.arquivo_nome:
            import os
            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            file_path = os.path.join(upload_dir, historico.arquivo_nome)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Adicionar lógica de permissão: Apenas admin ou o usuário que criou o histórico (se aplicável)
        # Ex: if current_user.perfil != 'admin' and historico.criado_por_id != current_user.id:
        #         return jsonify({"success": False, "message": "Permissão negada."}), 403

        db.session.delete(historico)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Histórico excluído com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao excluir histórico {historico_id}: {str(e)}")
        return jsonify({"success": False, "message": f"Erro ao excluir histórico: {str(e)}"}), 500

# Rota para servir arquivos de upload (se aplicável, verificar se já existe ou se é necessária)
@app.route("/uploads/<filename>")
@token_required # Proteger acesso aos uploads
def uploaded_file(current_user, filename):
    # Adicionar verificação se o current_user tem permissão para acessar este arquivo específico
    # Esta é uma implementação básica, pode precisar de mais segurança.
    upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    # Verificar se o arquivo pertence a um histórico que o usuário pode ver, por exemplo.
    # historico_associado = HistoricoPaciente.query.filter_by(arquivo_nome=filename).first()
    # if not historico_associado:
    #     return jsonify({"success": False, "message": "Arquivo não encontrado ou não associado."}), 404
    # if current_user.perfil == 'comum' and ... (lógica de permissão para o histórico)

    from flask import send_from_directory # Mover import para o topo se usado em mais lugares
    return send_from_directory(upload_dir, filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Cria as tabelas se não existirem
        # Adicionar um usuário admin padrão se não existir
        admin_username = 'admin'
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
        admin_nome = os.environ.get('ADMIN_NOME', 'Administrador Padrão')
        admin_senha = os.environ.get('ADMIN_SENHA', 'admin') # Senha padrão 'admin'

        if not Usuario.query.filter_by(username=admin_username).first():
            if Usuario.query.filter_by(email=admin_email).first():
                # Se o email já existe mas o username 'admin' não, pode ser um problema de dados legados ou configuração.
                # Aqui, vamos priorizar a criação do admin com username 'admin'.
                # Poderia ser necessário tratar esse caso de forma mais elaborada.
                print(f"Atenção: Email {admin_email} já existe, mas usuário '{admin_username}' não. Verifique a consistência dos dados.")
                # Decide-se não criar o admin se o email já está em uso por outro username para evitar conflito no email unique.
                # Ou, alternativamente, atualizar o usuário existente se a política permitir.
                # Por simplicidade, aqui não faremos nada se o email já existir e o username 'admin' não.
            else:
                admin_user = Usuario(
                    username=admin_username,
                    nome=admin_nome,
                    email=admin_email, # Email ainda precisa ser único
                    perfil='admin'
                )
                admin_user.set_password(admin_senha)
                db.session.add(admin_user)
                db.session.commit()
                print(f"Usuário admin '{admin_user.username}' (Email: {admin_user.email}) criado com senha '{admin_senha}'.")
        else:
            # Garantir que o usuário admin existente tenha a senha 'admin' se desejado
            existing_admin = Usuario.query.filter_by(username=admin_username).first()
            if not existing_admin.check_password(admin_senha):
                print(f"Atualizando senha do usuário admin '{existing_admin.username}' para '{admin_senha}'.")
                existing_admin.set_password(admin_senha)
                db.session.commit()
            print(f"Usuário admin '{existing_admin.username}' (Email: {existing_admin.email}) verificado.")

    app.run(host='0.0.0.0', port=5000, debug=True)
