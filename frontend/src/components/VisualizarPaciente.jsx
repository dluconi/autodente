import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, ArrowLeft, User, Phone, MapPin, FileText, Edit, Calculator, Save, Upload, Image, File, Trash2, X, Eye } from 'lucide-react'
import API_URL from '../lib/api';

const VisualizarPaciente = () => {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [historicos, setHistoricos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingHistorico, setEditingHistorico] = useState(false)
  const [historicoText, setHistoricoText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPatient()
    fetchBudgets()
    fetchHistoricos()
  }, [id])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`${API_URL}/api/patients/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setPatient(data.data)
      } else {
        setError('Paciente não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar dados do paciente')
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/budgets/patient/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setBudgets(data.budgets || [])
      }
    } catch (err) {
      console.error('Erro ao carregar orçamentos:', err)
    }
  }

  const fetchHistoricos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/historico/patient/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setHistoricos(data.historicos || [])
      }
    } catch (err) {
      console.error('Erro ao carregar históricos:', err)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      
      // Criar preview apenas para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleSaveHistorico = async () => {
    if (!historicoText.trim() && !selectedFile) {
      setError('Preencha o histórico ou selecione um arquivo')
      return
    }

    setSaving(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('patient_id', id)
      formData.append('historico', historicoText)
      
      if (selectedFile) {
        formData.append('arquivo', selectedFile)
      }

      const response = await fetch(`${API_URL}/api/historico`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setHistoricoText('')
        setSelectedFile(null)
        setFilePreview(null)
        setEditingHistorico(false)
        fetchHistoricos() // Recarregar históricos
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao salvar histórico')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingHistorico(false)
    setHistoricoText('')
    setSelectedFile(null)
    setFilePreview(null)
    setError('')
  }

  const handleDeleteHistorico = async (historicoId) => {
    if (window.confirm('Tem certeza que deseja excluir este histórico?')) {
      try {
        const response = await fetch(`${API_URL}/api/historico/${historicoId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          fetchHistoricos() // Recarregar históricos
        } else {
          setError('Erro ao excluir histórico')
        }
      } catch (err) {
        setError('Erro de conexão com o servidor')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone) => {
    if (!phone) return '-'
    return phone
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do paciente...</p>
        </div>
      </div>
    )
  }

  if (error) {
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
              <Link to="/consulta">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              <Link to={`/cadastro/${id}`}>
                <Button size="sm" className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              </Link>
              <Link to="/consulta">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {patient?.nome} {patient?.sobrenome}
          </h2>
          <p className="text-gray-600">Visualização completa dos dados do paciente</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Paciente</span>
            </CardTitle>
            <CardDescription>
              Dados completos cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dados-cadastrais" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
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
                <TabsTrigger value="historico" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="orcamento" className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Orçamento</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados-cadastrais" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Nome Completo</h4>
                      <p className="text-gray-900">{patient?.nome} {patient?.sobrenome}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Data de Nascimento</h4>
                      <p className="text-gray-900">{formatDate(patient?.data_nascimento)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Sexo</h4>
                      <p className="text-gray-900 capitalize">{patient?.sexo || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Estado Civil</h4>
                      <p className="text-gray-900 capitalize">{patient?.estado_civil || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">CPF</h4>
                      {patient?.cpf ? (
                        <Badge variant="outline">{patient.cpf}</Badge>
                      ) : (
                        <p className="text-gray-400">-</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">RG</h4>
                      <p className="text-gray-900">{patient?.rg || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Escolaridade</h4>
                      <p className="text-gray-900 capitalize">{patient?.escolaridade || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Como conheceu</h4>
                      <p className="text-gray-900 capitalize">{patient?.como_conheceu || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {patient?.observacoes && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Observações</h4>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{patient.observacoes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contato" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Telefone Fixo</h4>
                      <p className="text-gray-900">{formatPhone(patient?.fone_fixo)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Celular</h4>
                      <p className="text-gray-900">{formatPhone(patient?.celular)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Outros Telefones</h4>
                      <p className="text-gray-900">{formatPhone(patient?.outros_telefones)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Email</h4>
                      <p className="text-gray-900">{patient?.email || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Endereço</span>
                    </h3>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">CEP</h4>
                      <p className="text-gray-900">{patient?.cep || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Cidade/Estado</h4>
                      <p className="text-gray-900">{patient?.cidade ? `${patient.cidade}/${patient.estado}` : '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Endereço</h4>
                      <p className="text-gray-900">
                        {patient?.endereco ? 
                          `${patient.endereco}, ${patient.numero || 'S/N'} - ${patient.bairro}${patient.complemento ? ` (${patient.complemento})` : ''}` 
                          : '-'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dados-complementares" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Dados Profissionais</h3>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Profissão</h4>
                      <p className="text-gray-900">{patient?.profissao || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Local de Trabalho</h4>
                      <p className="text-gray-900">{patient?.local_trabalho || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Tempo de Trabalho</h4>
                      <p className="text-gray-900">{patient?.tempo_trabalho || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Número do Prontuário</h4>
                      <p className="text-gray-900">{patient?.num_prontuario || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Plano de Saúde</h3>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Nome do Plano</h4>
                      <p className="text-gray-900">{patient?.nome_plano || '-'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Número do Plano</h4>
                      <p className="text-gray-900">{patient?.numero_plano || '-'}</p>
                    </div>
                  </div>
                </div>

                {(patient?.nome_pai || patient?.nome_mae) && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Filiação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {patient?.nome_pai && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700">Pai</h4>
                          <p className="text-gray-900">{patient.nome_pai}</p>
                          {patient?.cpf_pai && <p className="text-sm text-gray-600">CPF: {patient.cpf_pai}</p>}
                          {patient?.profissao_pai && <p className="text-sm text-gray-600">Profissão: {patient.profissao_pai}</p>}
                          {patient?.rg_pai && <p className="text-sm text-gray-600">RG: {patient.rg_pai}</p>}
                        </div>
                      )}
                      {patient?.nome_mae && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700">Mãe</h4>
                          <p className="text-gray-900">{patient.nome_mae}</p>
                          {patient?.cpf_mae && <p className="text-sm text-gray-600">CPF: {patient.cpf_mae}</p>}
                          {patient?.profissao_mae && <p className="text-sm text-gray-600">Profissão: {patient.profissao_mae}</p>}
                          {patient?.rg_mae && <p className="text-sm text-gray-600">RG: {patient.rg_mae}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {patient?.nome_representante && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Representante Legal</h3>
                    <div className="space-y-2">
                      <p className="text-gray-900 font-medium">{patient.nome_representante}</p>
                      {patient?.cpf_representante && <p className="text-sm text-gray-600">CPF: {patient.cpf_representante}</p>}
                      {patient?.rg_representante && <p className="text-sm text-gray-600">RG: {patient.rg_representante}</p>}
                      {patient?.telefone_representante && <p className="text-sm text-gray-600">Telefone: {patient.telefone_representante}</p>}
                      {patient?.nascimento_representante && <p className="text-sm text-gray-600">Nascimento: {formatDate(patient.nascimento_representante)}</p>}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Histórico Clínico do Paciente</h3>
                    {!editingHistorico && (
                      <Button
                        onClick={() => setEditingHistorico(true)}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Adicionar Histórico</span>
                      </Button>
                    )}
                  </div>

                  {editingHistorico && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Novo Histórico</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancelar</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Histórico Clínico
                          </label>
                          <Textarea
                            placeholder="Digite as informações clínicas do paciente..."
                            value={historicoText}
                            onChange={(e) => setHistoricoText(e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Anexar Arquivo
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <div className="text-center">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <div className="mt-2">
                                <label htmlFor="file-upload-historico" className="cursor-pointer">
                                  <span className="text-sm font-medium text-gray-900">
                                    Clique para selecionar um arquivo
                                  </span>
                                </label>
                                <input
                                  id="file-upload-historico"
                                  name="file-upload-historico"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </div>
                            </div>
                          </div>

                          {selectedFile && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {filePreview ? (
                                  <div className="flex-shrink-0">
                                    <img
                                      src={filePreview}
                                      alt="Preview"
                                      className="h-12 w-12 object-cover rounded border"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex-shrink-0">
                                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                      <File className="h-6 w-6 text-gray-400" />
                                    </div>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFile(null)
                                    setFilePreview(null)
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSaveHistorico}
                            disabled={saving || (!historicoText.trim() && !selectedFile)}
                            className="flex items-center space-x-2"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Salvando...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span>Salvar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {historicos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">Nenhum histórico encontrado</h4>
                      <p className="text-gray-600">Este paciente ainda não possui histórico clínico cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
		      {historicos.filter(h => h.historico !== null).map((historico) => (
                        <Card key={historico.id} className="border-l-4 border-l-teal-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">Histórico #{historico.id}</CardTitle>
                                <CardDescription>
                                  Cadastrado em: {formatDate(historico.created_at)}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteHistorico(historico.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir histórico"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {historico.historico && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-700 mb-2">Informações Clínicas</h5>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                                  {historico.historico}
                                </p>
                              </div>
                            )}
                            
                            {historico.arquivo_nome && (
                              <div>
                                <h5 className="font-semibold text-gray-700 mb-2">Arquivo Anexado</h5>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  {historico.arquivo_tipo && historico.arquivo_tipo.startsWith('image/') ? (
                                    <div className="flex-shrink-0">
                                      <Image className="h-6 w-6 text-green-600" />
                                    </div>
                                  ) : (
                                    <div className="flex-shrink-0">
                                      <File className="h-6 w-6 text-blue-600" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {historico.arquivo_nome}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {historico.arquivo_tipo || 'Tipo desconhecido'}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`${API_URL}/uploads/${historico.arquivo_nome}`, '_blank')}
                                    className="flex items-center space-x-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>Visualizar</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="orcamento" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Orçamentos do Paciente</h3>
                  
                  {budgets.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <Calculator className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">Nenhum orçamento encontrado</h4>
                      <p className="text-gray-600">Este paciente ainda não possui orçamentos aprovados.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {budgets.map((budget) => (
                        <Card key={budget.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">Orçamento #{budget.id}</CardTitle>
                                <CardDescription>
                                  Criado em: {formatDate(budget.created_at)}
                                  {budget.approved_at && (
                                    <span className="ml-2">• Aprovado em: {formatDate(budget.approved_at)}</span>
                                  )}
                                </CardDescription>
                              </div>
                              <Badge variant={budget.status === 'approved' ? 'default' : 'secondary'}>
                                {budget.status === 'approved' ? 'Aprovado' : 'Pendente'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {budget.observations && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-700 mb-2">Observações</h5>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{budget.observations}</p>
                              </div>
                            )}
                            
                            <div className="space-y-3">
                              <h5 className="font-semibold text-gray-700">Procedimentos</h5>
                              {budget.procedures && budget.procedures.length > 0 ? (
                                <div className="space-y-2">
                                  {budget.procedures.map((procedure, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">{procedure.descricao}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                          <span>Tabela: {procedure.tabela}</span>
                                          {procedure.dente && <span>Dente: {procedure.dente}</span>}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-blue-600">{formatCurrency(procedure.valor)}</p>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                                      <span className="text-xl font-bold text-blue-600">
                                        {formatCurrency(budget.procedures.reduce((sum, proc) => sum + parseFloat(proc.valor || 0), 0))}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500">Nenhum procedimento cadastrado</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div>
              Cadastrado em: {formatDate(patient?.cadastrado_em)}
            </div>
            <div className="mt-2 sm:mt-0">
              ID do Paciente: {patient?.id}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VisualizarPaciente

