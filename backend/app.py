from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS
import os
import re # Para regex de email e telefone
from datetime import datetime, timedelta

app = Flask(__name__)

# Ativa CORS global em todas as rotas
CORS(app, supports_credentials=True)

# ConfiguraÃ§Ã£o do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///dentist.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


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
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados Cadastrais
    nome = db.Column(db.String(100), nullable=False)
    sobrenome = db.Column(db.String(100), nullable=True) # Mantido como opcional no DB
    data_nascimento = db.Column(db.Date, nullable=True)
    sexo = db.Column(db.String(10), nullable=True)
    cpf = db.Column(db.String(14), nullable=True, unique=True)
    rg = db.Column(db.String(20), nullable=True)
    estado_civil = db.Column(db.String(20), nullable=True)
    escolaridade = db.Column(db.String(50), nullable=True)
    como_conheceu = db.Column(db.String(100), nullable=True)
    observacoes = db.Column(db.Text, nullable=True)
    cadastrado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Contato
    fone_fixo = db.Column(db.String(20), nullable=True)
    celular = db.Column(db.String(20), nullable=True)
    outros_telefones = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    nao_possui_email = db.Column(db.Boolean, default=False)
    
    # EndereÃ§o
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
    
    # FiliaÃ§Ã£o
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

    # Controle de cadastro
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

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    patient = db.relationship('Patient', backref=db.backref('budgets', lazy=True))
    clinic_name = db.Column(db.String(100), nullable=False)
    observations = db.Column(db.Text, nullable=True)
    total_value = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(20), nullable=False, default='pending') # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.nome} {self.patient.sobrenome or ''}" if self.patient else "Paciente nÃ£o encontrado",
            'clinic_name': self.clinic_name,
            'observations': self.observations,
            'total_value': self.total_value,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'procedures': [procedure.to_dict() for procedure in self.procedures]
        }

class BudgetProcedure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'), nullable=False)
    budget = db.relationship('Budget', backref=db.backref('procedures', lazy=True))
    table_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    tooth = db.Column(db.String(10), nullable=True)
    dentist = db.Column(db.String(100), nullable=True)
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
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    patient = db.relationship('Patient', backref=db.backref('appointments', lazy=True))
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.String(5), nullable=False) # HH:MM
    observacao = db.Column(db.Text, nullable=True) 
    duration_minutes = db.Column(db.Integer, nullable=False, default=30) # Duração em minutos
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        patient_name = "Paciente nÃ£o encontrado"
        if self.patient:
            patient_name = self.patient.nome
            if self.patient.sobrenome:
                patient_name += ' ' + self.patient.sobrenome
        
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': patient_name,
            'appointment_date': self.appointment_date.isoformat(),
            'appointment_time': self.appointment_time,
            'observacao': self.observacao, 
            'duration_minutes': self.duration_minutes, # Adicionado duration_minutes
            'created_at': self.created_at.isoformat(),
            'patient_is_fully_registered': self.patient.is_fully_registered if self.patient else False 
        }

class HistoricoPaciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    patient = db.relationship('Patient', backref=db.backref('historicos', lazy=True))
    historico = db.Column(db.Text, nullable=True)
    arquivo_nome = db.Column(db.String(255), nullable=True)
    arquivo_tipo = db.Column(db.String(100), nullable=True)
    arquivo_tamanho = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
    username = data.get('username')
    password = data.get('password')
    
    if username == 'admin' and password == 'admin':
        return jsonify({'success': True, 'message': 'Login realizado com sucesso'})
    else:
        return jsonify({'success': False, 'message': 'Credenciais invÃ¡lidas'}), 401

@app.route("/api/patients", methods=["GET"])
def get_patients():
    patients = Patient.query.all()
    return jsonify([patient.to_dict() for patient in patients])

@app.route("/api/patients", methods=["POST"])
def create_patient():
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
        data["email"] = None # Atualiza o 'data' para consistência ao criar o Patient

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
        patient = Patient(
            nome=nome,
            sobrenome=sobrenome, # Usar o 'sobrenome' validado ou original
            data_nascimento=data_nascimento_obj,
            sexo=data.get("sexo"),
            cpf=cpf, # Usar o 'cpf' validado ou original
            rg=data.get("rg"),
            estado_civil=data.get("estado_civil"),
            escolaridade=data.get("escolaridade"),
            como_conheceu=data.get("como_conheceu"),
            observacoes=data.get("observacoes"),
            fone_fixo=fone_fixo, # Usar o 'fone_fixo' validado ou original
            celular=celular, # Usar o 'celular' validado ou original
            outros_telefones=data.get("outros_telefones"),
            email=email, # Email tratado pela flag nao_possui_email
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
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Paciente cadastrado com sucesso", "id": patient.id}), 201

    except IntegrityError as e: # Especificamente para erros de constraint (como CPF único)
        db.session.rollback()
        if "UNIQUE constraint failed: patient.cpf" in str(e) or "Duplicate entry" in str(e).lower() and "for key 'cpf'" in str(e).lower() : # Adaptar para a msg do seu DB
            return jsonify({"success": False, "message": "CPF já cadastrado."}), 409 # Conflict
        return jsonify({"success": False, "message": f"Erro de integridade no banco de dados: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        # Log do erro no servidor para depuração
        app.logger.error(f"Erro ao cadastrar paciente: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao cadastrar paciente. Tente novamente mais tarde."}), 500

@app.route("/api/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    return jsonify({
        "success": True,
        "data": patient.to_dict()
    })

@app.route("/api/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json()
    errors = {}

    # Validações (exemplo para alguns campos, aplicar a todos que precisam)
    if "nome" in data and (not data["nome"] or len(data["nome"].strip()) == 0):
        errors["nome"] = "Nome é obrigatório."

    if "cpf" in data and data["cpf"] and not is_valid_cpf(data["cpf"]):
        errors["cpf"] = "CPF inválido."
    
    email_update = data.get("email")
    nao_possui_email_update = data.get("nao_possui_email", patient.nao_possui_email) # Usa valor existente se não fornecido

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
        for field in data: # Atualiza os campos fornecidos
            if field == "data_nascimento" and data[field]:
                setattr(patient, field, datetime.strptime(data[field], "%Y-%m-%d").date())
            elif hasattr(patient, field):
                 # Especificamente para 'nao_possui_email', garantir que o 'email' seja limpo se True
                if field == "nao_possui_email" and data[field] is True:
                    patient.email = None
                setattr(patient, field, data[field])
        
        patient.is_fully_registered = True
        db.session.commit()
        return jsonify({"success": True, "message": "Paciente atualizado com sucesso"})

    except IntegrityError as e:
        db.session.rollback()
        if "UNIQUE constraint failed: patient.cpf" in str(e) or "Duplicate entry" in str(e).lower() and "for key 'cpf'" in str(e).lower():
            return jsonify({"success": False, "message": "CPF já cadastrado para outro paciente."}), 409
        return jsonify({"success": False, "message": f"Erro de integridade no banco de dados: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao atualizar paciente {patient_id}: {str(e)}")
        return jsonify({"success": False, "message": "Erro interno ao atualizar paciente."}), 500

@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({"success": True, "message": "Paciente excluÃ­do com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir paciente: {str(e)}"}), 500


@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json()
    patient_name = data.get("patient_name")
    appointment_date_str = data.get("appointment_date")
    appointment_time = data.get("appointment_time")
    observacao = data.get("observacao")
    duration_minutes = data.get("duration_minutes", 30) # Receber duration_minutes, default 30

    if not patient_name or not appointment_date_str or not appointment_time: # patient_name pode ser nulo se patient_id for fornecido
        if not data.get("patient_id") or not appointment_date_str or not appointment_time:
             return jsonify({"success": False, "message": "ID do paciente ou nome, data e hora do agendamento sÃ£o obrigatÃ³rios."}), 400

    if not patient_name and not data.get("patient_id"): # Garante que pelo menos um identificador de paciente exista
        return jsonify({"success": False, "message": "Nome do paciente ou ID do paciente é obrigatório."}), 400

    try:
        appointment_date = datetime.strptime(appointment_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Formato de data invÃ¡lido. Use YYYY-MM-DD."}), 400

    patient_id_frontend = data.get("patient_id") # Verificar se o frontend envia o ID do paciente selecionado
    patient = None

    if patient_id_frontend:
        patient = Patient.query.get(patient_id_frontend)
        if not patient:
             return jsonify({"success": False, "message": f"Paciente com ID {patient_id_frontend} nÃ£o encontrado."}), 404
    else:
        # Tentar encontrar paciente pelo nome completo (nome e sobrenome)
        # Isso assume que patient_name pode conter "Nome Sobrenome"
        parts = patient_name.split(" ", 1)
        nome_busca = parts[0]
        sobrenome_busca = parts[1] if len(parts) > 1 else None

        if sobrenome_busca:
            patient = Patient.query.filter(Patient.nome.ilike(nome_busca), Patient.sobrenome.ilike(sobrenome_busca)).first()
        else:
            # Se nÃ£o hÃ¡ sobrenome, busca apenas pelo primeiro nome (menos preciso)
            patient = Patient.query.filter(Patient.nome.ilike(nome_busca), Patient.sobrenome.is_(None)).first()
            if not patient: # Tenta uma busca mais genÃ©rica se a anterior falhar
                 patient = Patient.query.filter(Patient.nome.ilike(patient_name)).first()


    is_new_patient = False
    if not patient:
        # Se o paciente nÃ£o existe, cria um novo (prÃ©-cadastro)
        # O campo is_fully_registered serÃ¡ adicionado ao modelo Patient depois
        new_patient_name_parts = patient_name.split(" ", 1)
        patient = Patient(
            nome=new_patient_name_parts[0],
            sobrenome=new_patient_name_parts[1] if len(new_patient_name_parts) > 1 else None,
            is_fully_registered=False # Marcar como nÃ£o totalmente registrado
        )
        db.session.add(patient)
        is_new_patient = True
        # db.session.flush() # Para obter o ID se necessÃ¡rio antes do commit principal
    
    # Preparar horários para o novo agendamento
    try:
        appointment_time_obj = datetime.strptime(appointment_time, "%H:%M").time()
        new_start_datetime = datetime.combine(appointment_date, appointment_time_obj)
        new_end_datetime = new_start_datetime + timedelta(minutes=int(duration_minutes))
    except ValueError:
        return jsonify({"success": False, "message": "Formato de hora inválido. Use HH:MM."}), 400

    # Verificar conflitos com agendamentos existentes na mesma data
    existing_appointments_on_date = Appointment.query.filter_by(appointment_date=appointment_date).all()

    for existing_app in existing_appointments_on_date:
        try:
            existing_app_time_obj = datetime.strptime(existing_app.appointment_time, "%H:%M").time()
            existing_start_datetime = datetime.combine(existing_app.appointment_date, existing_app_time_obj)
            existing_end_datetime = existing_start_datetime + timedelta(minutes=existing_app.duration_minutes)

            # Verificar sobreposição de intervalos
            # Se max(start1, start2) < min(end1, end2) -> há sobreposição
            if max(new_start_datetime, existing_start_datetime) < min(new_end_datetime, existing_end_datetime):
                return jsonify({
                    "success": False, 
                    "message": f"Horário em conflito com agendamento existente das {existing_app.appointment_time} (duração: {existing_app.duration_minutes} min)."
                }), 409 # Conflict
        except ValueError:
            # Lidar com horários possivelmente malformados no banco, embora não devesse acontecer
            print(f"Aviso: Agendamento ID {existing_app.id} com formato de hora inválido no banco de dados.")
            continue 

    # Se o paciente foi recÃ©m-criado e nÃ£o salvo, ou se jÃ¡ existia:
    if not patient.id: # Se o paciente foi criado agora e ainda nÃ£o tem ID (nÃ£o foi commitado)
        try:
            db.session.add(patient)
            db.session.flush() # Para obter o ID do paciente antes de usÃ¡-lo no agendamento
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": f"Erro ao registrar novo paciente: {str(e)}"}), 500
            
    appointment = Appointment(
        patient_id=patient.id,
        appointment_date=appointment_date,
        appointment_time=appointment_time, # Salva a string original HH:MM
        observacao=observacao,
        duration_minutes=int(duration_minutes)
    )

    try:
        db.session.add(appointment)
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento criado com sucesso", "appointment": appointment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        # Se o erro foi ao salvar o agendamento, e o paciente foi criado nesta transaÃ§Ã£o,
        # o rollback tambÃ©m desfaz a criaÃ§Ã£o do paciente, o que Ã© bom.
        return jsonify({"success": False, "message": f"Erro ao criar agendamento: {str(e)}"}), 500

@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([appointment.to_dict() for appointment in appointments])

@app.route("/api/appointments/today", methods=["GET"])
def get_appointments_today():
    today = datetime.now().date()
    appointments = Appointment.query.filter_by(appointment_date=today).all()
    return jsonify([appointment.to_dict() for appointment in appointments])

# Budget routes
@app.route("/api/appointments/tomorrow", methods=["GET"])
def get_appointments_tomorrow():
    tomorrow = datetime.now().date() + timedelta(days=1)
    appointments = Appointment.query.filter_by(appointment_date=tomorrow).all()
    return jsonify([appointment.to_dict() for appointment in appointments])

@app.route("/api/appointments/<int:appointment_id>", methods=["GET"])
def get_appointment_by_id(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    return jsonify(appointment.to_dict())

@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento excluÃ­do com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir agendamento: {str(e)}"}), 500

@app.route("/api/appointments/<int:appointment_id>", methods=["PUT"])
def update_appointment_route(appointment_id): # Renomeado para evitar conflito com model Appointment
    appointment = Appointment.query.get_or_404(appointment_id)
    data = request.get_json()

    # Extrair e validar dados - similar à rota de criação
    new_date_str = data.get("appointment_date", appointment.appointment_date.isoformat())
    new_time_str = data.get("appointment_time", appointment.appointment_time)
    new_duration_minutes = int(data.get("duration_minutes", appointment.duration_minutes))
    new_observacao = data.get("observacao", appointment.observacao)
    new_patient_id = data.get("patient_id", appointment.patient_id) # Permitir mudança de paciente

    try:
        new_appointment_date_obj = datetime.strptime(new_date_str, "%Y-%m-%d").date()
        new_appointment_time_obj = datetime.strptime(new_time_str, "%H:%M").time()
    except ValueError:
        return jsonify({"success": False, "message": "Formato de data ou hora inválido."}), 400

    # Verificar se o novo paciente existe (se mudou)
    if new_patient_id != appointment.patient_id:
        new_patient = Patient.query.get(new_patient_id)
        if not new_patient:
            return jsonify({"success": False, "message": f"Novo paciente com ID {new_patient_id} não encontrado."}), 404
    
    # Lógica de Verificação de Conflito (excluindo o próprio agendamento)
    new_start_dt = datetime.combine(new_appointment_date_obj, new_appointment_time_obj)
    new_end_dt = new_start_dt + timedelta(minutes=new_duration_minutes)

    existing_appointments_on_date = Appointment.query.filter(
        Appointment.appointment_date == new_appointment_date_obj,
        Appointment.id != appointment_id # Exclui o próprio agendamento da verificação
    ).all()

    for existing_app in existing_appointments_on_date:
        existing_app_time_obj = datetime.strptime(existing_app.appointment_time, "%H:%M").time()
        existing_start_datetime = datetime.combine(existing_app.appointment_date, existing_app_time_obj)
        existing_end_datetime = existing_start_datetime + timedelta(minutes=existing_app.duration_minutes)

        if max(new_start_dt, existing_start_datetime) < min(new_end_dt, existing_end_datetime):
            return jsonify({
                "success": False, 
                "message": f"Horário em conflito com outro agendamento existente ({existing_app.patient.nome if existing_app.patient else 'Desconhecido'}) das {existing_app.appointment_time} (duração: {existing_app.duration_minutes} min)."
            }), 409

    # Atualizar os campos do agendamento
    appointment.patient_id = new_patient_id
    appointment.appointment_date = new_appointment_date_obj
    appointment.appointment_time = new_time_str
    appointment.duration_minutes = new_duration_minutes
    appointment.observacao = new_observacao
    # appointment.updated_at = datetime.utcnow() # Se você tiver um campo updated_at

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento atualizado com sucesso", "appointment": appointment.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao atualizar agendamento: {str(e)}"}), 500

@app.route("/api/budgets", methods=["POST", "OPTIONS"])
def create_budget():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    patient_id = data.get("patient_id")
    clinic_name = data.get("clinic_name", "Dr. Lucca Spinelli")
    observations = data.get("observations", "")
    procedures = data.get("procedures", [])

    if not patient_id or not procedures:
        return jsonify({"success": False, "message": "ID do paciente e procedimentos sÃ£o obrigatÃ³rios."}), 400

    try:
        total_value = sum(float(proc.get("valor", 0)) for proc in procedures)

        budget = Budget(
            patient_id=patient_id,
            clinic_name=clinic_name,
            observations=observations,
            total_value=total_value
        )

        db.session.add(budget)
        db.session.flush()  # Para pegar o ID do orÃ§amento

        for proc in procedures:
            procedure = BudgetProcedure(
                budget_id=budget.id,
                table_name=proc.get("tabela", ""),
                description=proc.get("descricao", ""),
                tooth=proc.get("dente", ""),
                dentist=proc.get("dentista", ""),
                value=float(proc.get("valor", 0))
            )
            db.session.add(procedure)

        db.session.commit()
        return jsonify({"success": True, "message": "OrÃ§amento criado com sucesso", "budget": budget.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao criar orÃ§amento: {str(e)}"}), 500

@app.route("/api/budgets/patient/<int:patient_id>", methods=["GET"])
def get_patient_budgets(patient_id):
    budgets = Budget.query.filter_by(patient_id=patient_id).all()
    return jsonify([budget.to_dict() for budget in budgets])

@app.route("/api/budgets/<int:budget_id>/approve", methods=["POST"])
def approve_budget(budget_id):
    try:
        budget = Budget.query.get_or_404(budget_id)
        budget.status = 'approved'
        db.session.commit()
        return jsonify({"success": True, "message": "OrÃ§amento aprovado com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao aprovar orÃ§amento: {str(e)}"}), 500

@app.route("/api/dentists", methods=["GET"])
def get_dentists():
    # Exemplo fixo sÃ³a testar
    return jsonify([
        {"id": 1, "nome": "Dr. Lucca Spinelli"},
        {"id": 2, "nome": "Dr. Daniel Spinelli"}
    ])

# HistÃ³rico routes
@app.route("/api/historico", methods=["POST"])
def create_historico():
    try:
        patient_id = request.form.get('patient_id')
        historico_text = request.form.get('historico')
        arquivo = request.files.get('arquivo')
        
        if not patient_id:
            return jsonify({"success": False, "message": "ID do paciente Ã© obrigatÃ³rio"}), 400
            
        if not historico_text and not arquivo:
            return jsonify({"success": False, "message": "HistÃ³rico ou arquivo Ã© obrigatÃ³rio"}), 400
        
        # Verificar se o paciente existe
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"success": False, "message": "Paciente nÃ£o encontrado"}), 404
        
        historico = HistoricoPaciente(
            patient_id=patient_id,
            historico=historico_text
        )
        
        # Processar arquivo se fornecido
        if arquivo and arquivo.filename:
            import os
            import uuid
            
            # Criar diretÃ³rio uploads se nÃ£o existir
            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Gerar nome Ãºnico para o arquivo
            file_extension = os.path.splitext(arquivo.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Salvar arquivo
            arquivo.save(file_path)
            
            # Atualizar dados do histÃ³rico
            historico.arquivo_nome = unique_filename
            historico.arquivo_tipo = arquivo.content_type
            historico.arquivo_tamanho = os.path.getsize(file_path)
        
        db.session.add(historico)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": "HistÃ³rico salvo com sucesso",
            "historico": historico.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao salvar histÃ³rico: {str(e)}"}), 500

@app.route("/api/historico/patient/<int:patient_id>", methods=["GET"])
def get_patient_historicos(patient_id):
    try:
        historicos = HistoricoPaciente.query.filter_by(patient_id=patient_id).order_by(HistoricoPaciente.created_at.desc()).all()
        return jsonify({
            "success": True,
            "historicos": [historico.to_dict() for historico in historicos]
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar histÃ³ricos: {str(e)}"}), 500

@app.route("/api/historico/<int:historico_id>", methods=["DELETE"])
def delete_historico(historico_id):
    try:
        historico = HistoricoPaciente.query.get_or_404(historico_id)
        
        # Remover arquivo se existir
        if historico.arquivo_nome:
            import os
            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            file_path = os.path.join(upload_dir, historico.arquivo_nome)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        db.session.delete(historico)
        db.session.commit()
        
        return jsonify({"success": True, "message": "HistÃ³rico excluÃ­do com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir histÃ³rico: {str(e)}"}), 500

# Rota para servir arquivos de upload
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    import os
    from flask import send_from_directory
    upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(upload_dir, filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
