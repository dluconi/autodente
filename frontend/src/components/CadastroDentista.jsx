import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, ArrowLeft, Save, User, Phone, MapPin, FileText, Home } from 'lucide-react'
import API_URL from '../lib/api';

const CadastroDentista = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [formData, setFormData] = useState({
    // Dados Cadastrais
    nome: '',
    sobrenome: '',
    data_nascimento: '',
    sexo: '',
    cpf: '',
    rg: '',
    estado_civil: '',
    escolaridade: '',
    como_conheceu: '',
    observacoes: '',
    
    // Contato
    fone_fixo: '',
    celular: '',
    outros_telefones: '',
    email: '',
    nao_possui_email: false,
    
    // Endereço
    cep: '',
    cidade: '',
    estado: '',
    endereco: '',
    numero: '',
    bairro: '',
    complemento: '',
    
    // Dados Complementares
    profissao: '',
    local_trabalho: '',
    num_prontuario: '',
    tempo_trabalho: '',
    nome_plano: '',
    numero_plano: '',
    
    // Filiação
    nome_pai: '',
    cpf_pai: '',
    profissao_pai: '',
    rg_pai: '',
    nome_mae: '',
    cpf_mae: '',
    profissao_mae: '',
    rg_mae: '',
    
    // Representante Legal
    nome_representante: '',
    cpf_representante: '',
    rg_representante: '',
    telefone_representante: '',
    nascimento_representante: ''
  })

  useEffect(() => {
    if (isEditing) {
      fetchPatient()
    }
  }, [id, isEditing])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/patients/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setFormData(data.data)
      } else {
        setMessage('Erro ao carregar dados do paciente')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Erro de conexão com o servidor')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'nao_possui_email' && value === true) {
        newState.email = ''; // Limpa o email quando "Não possui email" é marcado
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const url = isEditing ? `${API_URL}/patients/${id}` : `${API_URL}/patients`
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {    
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(isEditing ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!')
        setMessageType('success')
        
        if (isEditing) {
          // Se estiver editando, após o sucesso, podemos redirecionar para a consulta
          // ou dar um tempo para o usuário ler a mensagem e então redirecionar.
          // Por agora, vamos apenas exibir a mensagem. O usuário navegará manualmente.
          // Considerar adicionar um botão "Voltar para Consulta" ou redirecionamento automático.
          // Para forçar a atualização na tela de consulta, uma abordagem seria
          // invalidar um cache ou usar um estado global, mas a forma mais simples
          // ao voltar é que a consulta recarregue os dados.
        } else {
          // Reset form only for new registrations
          setFormData({
            nome: '', sobrenome: '', data_nascimento: '', sexo: '', cpf: '', rg: '',
            estado_civil: '', escolaridade: '', como_conheceu: '', observacoes: '',
            fone_fixo: '', celular: '', outros_telefones: '', email: '', nao_possui_email: false,
            cep: '', cidade: '', estado: '', endereco: '', numero: '', bairro: '', complemento: '',
            profissao: '', local_trabalho: '', num_prontuario: '', tempo_trabalho: '',
            nome_plano: '', numero_plano: '', nome_pai: '', cpf_pai: '', profissao_pai: '', rg_pai: '',
            nome_mae: '', cpf_mae: '', profissao_mae: '', rg_mae: '', nome_representante: '',
            cpf_representante: '', rg_representante: '', telefone_representante: '', nascimento_representante: ''
          })
        }
      } else {
        // Modificar para lidar com um objeto de 'errors'
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join('\n'); // \n para console, <br/> para HTML
          setMessage(errorMessages || (isEditing ? 'Erro ao atualizar paciente' : 'Erro ao cadastrar paciente'));
        } else {
          setMessage(data.message || (isEditing ? 'Erro ao atualizar paciente' : 'Erro ao cadastrar paciente'));
        }
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Erro de conexão com o servidor')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dr. Lucca Spinelli</h1>
                <p className="text-sm text-blue-600 font-medium">Endodontista</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Início</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isEditing ? 'Editar Paciente' : 'Cadastro de Paciente'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Atualize os dados do paciente nas abas abaixo' : 'Preencha os dados do paciente nas abas abaixo'}
          </p>
        </div>

        {message && (
          <Alert className={`mb-6 ${messageType === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <AlertDescription className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações do Paciente</span>
              </CardTitle>
              <CardDescription>
                Complete todas as abas com as informações necessárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dados-cadastrais" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dados-cadastrais" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Dados Cadastrais</span>
                  </TabsTrigger>
                  <TabsTrigger value="contato" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Contato</span>
                  </TabsTrigger>
                  <TabsTrigger value="dados-complementares" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Dados Complementares</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dados-cadastrais" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder="Digite o nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome">Sobrenome *</Label>
                      <Input
                        id="sobrenome"
                        value={formData.sobrenome}
                        onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                        placeholder="Digite o sobrenome"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                      <Input
                        id="data_nascimento"
                        type="date"
                        value={formData.data_nascimento}
                        onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo</Label>
                      <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado_civil">Estado Civil</Label>
                      <Select value={formData.estado_civil} onValueChange={(value) => handleInputChange('estado_civil', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={formData.rg}
                        onChange={(e) => handleInputChange('rg', e.target.value)}
                        placeholder="Digite o RG"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="escolaridade">Escolaridade</Label>
                      <Select value={formData.escolaridade} onValueChange={(value) => handleInputChange('escolaridade', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                          <SelectItem value="medio">Ensino Médio</SelectItem>
                          <SelectItem value="superior">Ensino Superior</SelectItem>
                          <SelectItem value="pos">Pós-graduação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="como_conheceu">Como conheceu?</Label>
                      <Select value={formData.como_conheceu} onValueChange={(value) => handleInputChange('como_conheceu', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indicacao">Indicação</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="plano">Plano de Saúde</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações adicionais"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contato" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fone_fixo">Telefone Fixo</Label>
                      <Input
                        id="fone_fixo"
                        value={formData.fone_fixo}
                        onChange={(e) => handleInputChange('fone_fixo', e.target.value)}
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        value={formData.celular}
                        onChange={(e) => handleInputChange('celular', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outros_telefones">Outros Telefones</Label>
                      <Input
                        id="outros_telefones"
                        value={formData.outros_telefones}
                        onChange={(e) => handleInputChange('outros_telefones', e.target.value)}
                        placeholder="Outros contatos"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                      disabled={formData.nao_possui_email}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nao_possui_email"
                        checked={formData.nao_possui_email}
                        onCheckedChange={(checked) => handleInputChange('nao_possui_email', checked)}
                      />
                      <Label htmlFor="nao_possui_email" className="text-sm">
                        Não possui email
                      </Label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Endereço</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => handleInputChange('cep', e.target.value)}
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={formData.cidade}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          placeholder="Digite a cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => handleInputChange('endereco', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => handleInputChange('numero', e.target.value)}
                          placeholder="Nº"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={formData.bairro}
                          onChange={(e) => handleInputChange('bairro', e.target.value)}
                          placeholder="Digite o bairro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          value={formData.complemento}
                          onChange={(e) => handleInputChange('complemento', e.target.value)}
                          placeholder="Apto, Bloco, etc."
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dados-complementares" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        value={formData.profissao}
                        onChange={(e) => handleInputChange('profissao', e.target.value)}
                        placeholder="Digite a profissão"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="local_trabalho">Local de Trabalho</Label>
                      <Input
                        id="local_trabalho"
                        value={formData.local_trabalho}
                        onChange={(e) => handleInputChange('local_trabalho', e.target.value)}
                        placeholder="Digite o local de trabalho"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="num_prontuario">Número do Prontuário</Label>
                      <Input
                        id="num_prontuario"
                        value={formData.num_prontuario}
                        onChange={(e) => handleInputChange('num_prontuario', e.target.value)}
                        placeholder="1528"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempo_trabalho">Tempo de Trabalho</Label>
                      <Input
                        id="tempo_trabalho"
                        value={formData.tempo_trabalho}
                        onChange={(e) => handleInputChange('tempo_trabalho', e.target.value)}
                        placeholder="Ex: 5 anos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome_plano">Nome do Plano</Label>
                      <Input
                        id="nome_plano"
                        value={formData.nome_plano}
                        onChange={(e) => handleInputChange('nome_plano', e.target.value)}
                        placeholder="Digite o nome do plano"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero_plano">Número do Plano</Label>
                    <Input
                      id="numero_plano"
                      value={formData.numero_plano}
                      onChange={(e) => handleInputChange('numero_plano', e.target.value)}
                      placeholder="Digite o número do plano"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Filiação</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome_pai">Nome do Pai</Label>
                        <Input
                          id="nome_pai"
                          value={formData.nome_pai}
                          onChange={(e) => handleInputChange('nome_pai', e.target.value)}
                          placeholder="Digite o nome do pai"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf_pai">CPF do Pai</Label>
                        <Input
                          id="cpf_pai"
                          value={formData.cpf_pai}
                          onChange={(e) => handleInputChange('cpf_pai', e.target.value)}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="profissao_pai">Profissão do Pai</Label>
                        <Input
                          id="profissao_pai"
                          value={formData.profissao_pai}
                          onChange={(e) => handleInputChange('profissao_pai', e.target.value)}
                          placeholder="Digite a profissão"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rg_pai">RG do Pai</Label>
                        <Input
                          id="rg_pai"
                          value={formData.rg_pai}
                          onChange={(e) => handleInputChange('rg_pai', e.target.value)}
                          placeholder="Digite o RG"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome_mae">Nome da Mãe</Label>
                        <Input
                          id="nome_mae"
                          value={formData.nome_mae}
                          onChange={(e) => handleInputChange('nome_mae', e.target.value)}
                          placeholder="Digite o nome da mãe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf_mae">CPF da Mãe</Label>
                        <Input
                          id="cpf_mae"
                          value={formData.cpf_mae}
                          onChange={(e) => handleInputChange('cpf_mae', e.target.value)}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profissao_mae">Profissão da Mãe</Label>
                        <Input
                          id="profissao_mae"
                          value={formData.profissao_mae}
                          onChange={(e) => handleInputChange('profissao_mae', e.target.value)}
                          placeholder="Digite a profissão"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rg_mae">RG da Mãe</Label>
                        <Input
                          id="rg_mae"
                          value={formData.rg_mae}
                          onChange={(e) => handleInputChange('rg_mae', e.target.value)}
                          placeholder="Digite o RG"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Representante Legal</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome_representante">Nome do Representante Legal</Label>
                        <Input
                          id="nome_representante"
                          value={formData.nome_representante}
                          onChange={(e) => handleInputChange('nome_representante', e.target.value)}
                          placeholder="Digite o nome"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf_representante">CPF do Representante Legal</Label>
                        <Input
                          id="cpf_representante"
                          value={formData.cpf_representante}
                          onChange={(e) => handleInputChange('cpf_representante', e.target.value)}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rg_representante">RG do Representante Legal</Label>
                        <Input
                          id="rg_representante"
                          value={formData.rg_representante}
                          onChange={(e) => handleInputChange('rg_representante', e.target.value)}
                          placeholder="Digite o RG"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone_representante">Telefone do Representante Legal</Label>
                        <Input
                          id="telefone_representante"
                          value={formData.telefone_representante}
                          onChange={(e) => handleInputChange('telefone_representante', e.target.value)}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nascimento_representante">Nascimento</Label>
                        <Input
                          id="nascimento_representante"
                          value={formData.nascimento_representante}
                          onChange={(e) => handleInputChange('nascimento_representante', e.target.value)}
                          placeholder="Data ou idade"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Link to="/dashboard">
                  <Button variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Salvando...' : 'Salvar Paciente'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}

export default CadastroDentista

