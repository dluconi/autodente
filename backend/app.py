from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Ativa CORS global em todas as rotas
CORS(app, supports_credentials=True)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///dentist.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Models
class Patient(db.Model):
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
    cadastrado_em = db.Column(db.DateTime, default=datetime.utcnow)
    
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
            'patient_name': f"{self.patient.nome} {self.patient.sobrenome or ''}" if self.patient else "Paciente não encontrado",
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
    observacao = db.Column(db.Text, nullable=True) # Novo campo para observações
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        patient_name = "Paciente não encontrado"
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
        return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

@app.route("/api/patients", methods=["GET"])
def get_patients():
    patients = Patient.query.all()
    return jsonify([patient.to_dict() for patient in patients])

@app.route("/api/patients", methods=["POST"])
def create_patient():
    data = request.get_json()
    
    try:
        patient = Patient(
            nome=data.get("nome"),
            sobrenome=data.get("sobrenome"),
            data_nascimento=datetime.strptime(data.get("data_nascimento"), "%Y-%m-%d").date() if data.get("data_nascimento") else None,
            sexo=data.get("sexo"),
            cpf=data.get("cpf"),
            rg=data.get("rg"),
            estado_civil=data.get("estado_civil"),
            escolaridade=data.get("escolaridade"),
            como_conheceu=data.get("como_conheceu"),
            observacoes=data.get("observacoes"),
            fone_fixo=data.get("fone_fixo"),
            celular=data.get("celular"),
            outros_telefones=data.get("outros_telefones"),
            email=data.get("email"),
            nao_possui_email=data.get("nao_possui_email", False),
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
            is_fully_registered=True # Cadastro completo por esta rota
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Paciente cadastrado com sucesso", "id": patient.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao cadastrar paciente: {str(e)}"}), 500

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
    
    try:
        # Update fields
        for field in ["nome", "sobrenome", "sexo", "cpf", "rg", "estado_civil", "escolaridade", 
                     "como_conheceu", "observacoes", "fone_fixo", "celular", "outros_telefones", 
                     "email", "nao_possui_email", "cep", "cidade", "estado", "endereco", "numero", 
                     "bairro", "complemento", "profissao", "local_trabalho", "num_prontuario", 
                     "tempo_trabalho", "nome_plano", "numero_plano", "nome_pai", "cpf_pai", 
                     "profissao_pai", "rg_pai", "nome_mae", "cpf_mae", "profissao_mae", "rg_mae", 
                     "nome_representante", "cpf_representante", "rg_representante", 
                     "telefone_representante", "nascimento_representante"]:
            if field in data:
                setattr(patient, field, data[field])
        
        if "data_nascimento" in data and data["data_nascimento"]:
            patient.data_nascimento = datetime.strptime(data["data_nascimento"], "%Y-%m-%d").date()
        
        patient.is_fully_registered = True # Atualização implica em cadastro completo
        db.session.commit()
        return jsonify({"success": True, "message": "Paciente atualizado com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao atualizar paciente: {str(e)}"}), 500

@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({"success": True, "message": "Paciente excluído com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir paciente: {str(e)}"}), 500


@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json()
    patient_name = data.get("patient_name")
    appointment_date_str = data.get("appointment_date")
    appointment_time = data.get("appointment_time")
    observacao = data.get("observacao") # Novo campo

    if not patient_name or not appointment_date_str or not appointment_time:
        return jsonify({"success": False, "message": "Nome do paciente, data e hora do agendamento são obrigatórios."}), 400

    try:
        appointment_date = datetime.strptime(appointment_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Formato de data inválido. Use YYYY-MM-DD."}), 400

    patient_id_frontend = data.get("patient_id") # Verificar se o frontend envia o ID do paciente selecionado
    patient = None

    if patient_id_frontend:
        patient = Patient.query.get(patient_id_frontend)
        if not patient:
             return jsonify({"success": False, "message": f"Paciente com ID {patient_id_frontend} não encontrado."}), 404
    else:
        # Tentar encontrar paciente pelo nome completo (nome e sobrenome)
        # Isso assume que patient_name pode conter "Nome Sobrenome"
        parts = patient_name.split(" ", 1)
        nome_busca = parts[0]
        sobrenome_busca = parts[1] if len(parts) > 1 else None

        if sobrenome_busca:
            patient = Patient.query.filter(Patient.nome.ilike(nome_busca), Patient.sobrenome.ilike(sobrenome_busca)).first()
        else:
            # Se não há sobrenome, busca apenas pelo primeiro nome (menos preciso)
            patient = Patient.query.filter(Patient.nome.ilike(nome_busca), Patient.sobrenome.is_(None)).first()
            if not patient: # Tenta uma busca mais genérica se a anterior falhar
                 patient = Patient.query.filter(Patient.nome.ilike(patient_name)).first()


    is_new_patient = False
    if not patient:
        # Se o paciente não existe, cria um novo (pré-cadastro)
        # O campo is_fully_registered será adicionado ao modelo Patient depois
        new_patient_name_parts = patient_name.split(" ", 1)
        patient = Patient(
            nome=new_patient_name_parts[0],
            sobrenome=new_patient_name_parts[1] if len(new_patient_name_parts) > 1 else None,
            is_fully_registered=False # Marcar como não totalmente registrado
        )
        db.session.add(patient)
        is_new_patient = True
        # db.session.flush() # Para obter o ID se necessário antes do commit principal

    # Verificar agendamento duplicado (mesma data e hora para qualquer paciente)
    existing_appointment = Appointment.query.filter_by(
        appointment_date=appointment_date,
        appointment_time=appointment_time
    ).first()

    if existing_appointment:
        return jsonify({"success": False, "message": "Já existe um agendamento para esta data e hora."}), 409 # 409 Conflict

    # Se o paciente foi recém-criado e não salvo, ou se já existia:
    if not patient.id: # Se o paciente foi criado agora e ainda não tem ID (não foi commitado)
        try:
            db.session.add(patient)
            db.session.flush() # Para obter o ID do paciente antes de usá-lo no agendamento
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": f"Erro ao registrar novo paciente: {str(e)}"}), 500
            
    appointment = Appointment(
        patient_id=patient.id,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        observacao=observacao
    )

    try:
        db.session.add(appointment)
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento criado com sucesso", "appointment": appointment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        # Se o erro foi ao salvar o agendamento, e o paciente foi criado nesta transação,
        # o rollback também desfaz a criação do paciente, o que é bom.
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

@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"success": True, "message": "Agendamento excluído com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir agendamento: {str(e)}"}), 500

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
        return jsonify({"success": False, "message": "ID do paciente e procedimentos são obrigatórios."}), 400

    try:
        total_value = sum(float(proc.get("valor", 0)) for proc in procedures)

        budget = Budget(
            patient_id=patient_id,
            clinic_name=clinic_name,
            observations=observations,
            total_value=total_value
        )

        db.session.add(budget)
        db.session.flush()  # Para pegar o ID do orçamento

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
        return jsonify({"success": True, "message": "Orçamento criado com sucesso", "budget": budget.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao criar orçamento: {str(e)}"}), 500

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
        return jsonify({"success": True, "message": "Orçamento aprovado com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao aprovar orçamento: {str(e)}"}), 500

@app.route("/api/dentists", methods=["GET"])
def get_dentists():
    # Exemplo fixo sóa testar
    return jsonify([
        {"id": 1, "nome": "Dr. Lucca Spinelli"},
        {"id": 2, "nome": "Dr. Daniel Spinelli"}
    ])

# Histórico routes
@app.route("/api/historico", methods=["POST"])
def create_historico():
    try:
        patient_id = request.form.get('patient_id')
        historico_text = request.form.get('historico')
        arquivo = request.files.get('arquivo')
        
        if not patient_id:
            return jsonify({"success": False, "message": "ID do paciente é obrigatório"}), 400
            
        if not historico_text and not arquivo:
            return jsonify({"success": False, "message": "Histórico ou arquivo é obrigatório"}), 400
        
        # Verificar se o paciente existe
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"success": False, "message": "Paciente não encontrado"}), 404
        
        historico = HistoricoPaciente(
            patient_id=patient_id,
            historico=historico_text
        )
        
        # Processar arquivo se fornecido
        if arquivo and arquivo.filename:
            import os
            import uuid
            
            # Criar diretório uploads se não existir
            upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Gerar nome único para o arquivo
            file_extension = os.path.splitext(arquivo.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Salvar arquivo
            arquivo.save(file_path)
            
            # Atualizar dados do histórico
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
        return jsonify({"success": False, "message": f"Erro ao salvar histórico: {str(e)}"}), 500

@app.route("/api/historico/patient/<int:patient_id>", methods=["GET"])
def get_patient_historicos(patient_id):
    try:
        historicos = HistoricoPaciente.query.filter_by(patient_id=patient_id).order_by(HistoricoPaciente.created_at.desc()).all()
        return jsonify({
            "success": True,
            "historicos": [historico.to_dict() for historico in historicos]
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao buscar históricos: {str(e)}"}), 500

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
        
        return jsonify({"success": True, "message": "Histórico excluído com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Erro ao excluir histórico: {str(e)}"}), 500

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
