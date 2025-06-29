import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, Home, Search, FileText, Upload, Eye, Edit, Trash2, Save, X, Image, File } from 'lucide-react'
import API_URL from '../lib/api'

const HistoricoPaciente = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientHistories, setPatientHistories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showHistories, setShowHistories] = useState(false)
  const [editingHistory, setEditingHistory] = useState(null)
  const [historico, setHistorico] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient => {
        if (!patient) return false
        return (
          (patient.nome && patient.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (patient.sobrenome && patient.sobrenome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (patient.cpf && patient.cpf.includes(searchTerm)) ||
          (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  const fetchPatients = async () => {
    const token = localStorage.getItem('token'); // Adicionado para autenticação
    if (!token) {
      setError('Usuário não autenticado para buscar pacientes.');
      setLoading(false);
      return;
    }
    try {
      // Corrigido para /api/pacientes e adicionado token
      const response = await fetch(`${API_URL}/api/pacientes`, { headers: { 'x-access-token': token } });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
        throw new Error(errData.message || `Erro ao buscar pacientes: ${response.statusText}`);
      }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []); // API de pacientes retorna um array diretamente
      setFilteredPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar pacientes: ' + (err.message || 'Erro desconhecido'));
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setLoading(false);
    }
  }

  const fetchPatientHistories = async (patientId) => {
    const token = localStorage.getItem('token'); // Adicionado para autenticação
    if (!token) {
      setError('Usuário não autenticado para buscar históricos.');
      return;
    }
    try {
      // Corrigido para /api/historico e adicionado token
      const response = await fetch(`${API_URL}/api/historico/patient/${patientId}`, { headers: { 'x-access-token': token } });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPatientHistories(data.historicos || []);
        } else {
          setPatientHistories([]);
          console.error('Falha ao buscar históricos da API:', data.message);
        }
      } else {
        const errData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
        console.error('Erro HTTP ao buscar históricos:', errData.message || response.statusText);
        setPatientHistories([]);
      }
    } catch (err) {
      console.error('Erro de conexão ao carregar históricos:', err);
      setError('Erro de conexão ao carregar históricos.');
      setPatientHistories([]);
    }
  }

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setShowForm(true)
    setShowHistories(false)
    setHistorico('')
    setSelectedFile(null)
    setFilePreview(null)
    setEditingHistory(null)
    setError('')
    setSuccess('')
  }

  const handleViewHistories = async (patient) => {
    setSelectedPatient(patient)
    setShowHistories(true)
    setShowForm(false)
    await fetchPatientHistories(patient.id)
    setError('')
    setSuccess('')
  }

  const handleEditHistory = (history) => {
    setEditingHistory(history)
    setHistorico(history.historico || '')
    setShowForm(true)
    setShowHistories(false)
    setSelectedFile(null)
    setFilePreview(null)
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

  const handleSave = async () => {
    if (!selectedPatient) {
      setError('Nenhum paciente selecionado')
      return
    }

    if (!historico.trim() && !selectedFile) {
      setError('Preencha o histórico ou selecione um arquivo')
      return
    }

    setSaving(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('patient_id', selectedPatient.id)
      formData.append('historico', historico)
      
      if (selectedFile) {
        formData.append('arquivo', selectedFile)
      }

      let response
      const token = localStorage.getItem('token'); // Adicionado para autenticação
      if (!token) {
        setError('Usuário não autenticado para salvar histórico.');
        setSaving(false);
        return;
      }

      const headers = { 'x-access-token': token }; // Não definir Content-Type quando usando FormData

      if (editingHistory) {
        // Atualizar histórico existente - Backend não tem rota PUT /api/historico/:id implementada
        // Assumindo que a criação (POST) pode lidar com "upsert" ou que uma rota PUT precisa ser criada.
        // Por ora, vamos focar em corrigir a chamada de POST.
        // Se PUT for necessário, o backend precisará de: @app.route('/api/historico/<int:historico_id>', methods=['PUT'])
        // E este código precisaria ser ajustado.
        // Por enquanto, vamos alertar que a edição não está totalmente implementada se for o caso.
        // Para este exercício, vamos assumir que o POST /api/historico pode ser usado para criar, e não há edição de histórico aqui.
        // Se a edição fosse por este mesmo endpoint, seria POST e o backend faria a lógica de upsert.
        // Como o backend atual só tem POST /api/historico, a edição não está funcional.
        // Vamos focar em fazer o POST funcionar corretamente.
        // Se a intenção é apenas criar, e não editar por este formulário:
        if(editingHistory) {
            setError("A funcionalidade de editar histórico ainda não está implementada no backend.");
            setSaving(false);
            return;
        }
        response = await fetch(`${API_URL}/api/historico`, { // Corrigido para /api/historico
          method: 'POST',
          headers: headers,
          body: formData
        });

      } else {
        // Criar novo histórico
        response = await fetch(`${API_URL}/api/historico`, { // Corrigido para /api/historico
          method: 'POST',
          headers: headers,
          body: formData
        });
      }

      if (response.ok) {
        setSuccess(editingHistory ? 'Histórico atualizado com sucesso!' : 'Histórico salvo com sucesso!')
        setHistorico('')
        setSelectedFile(null)
        setFilePreview(null)
        setShowForm(false)
        setEditingHistory(null)
        
        // Recarregar históricos se estávamos visualizando
        if (selectedPatient) {
          await fetchPatientHistories(selectedPatient.id)
          setShowHistories(true)
        }
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

  const handleCancel = () => {
    setShowForm(false)
    setShowHistories(false)
    setSelectedPatient(null)
    setHistorico('')
    setSelectedFile(null)
    setFilePreview(null)
    setEditingHistory(null)
    setError('')
    setSuccess('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const formatPhone = (phone) => {
    if (!phone) return '-'
    return phone
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pacientes...</p>
        </div>
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
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Início</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Histórico de Pacientes</h2>
          <p className="text-gray-600">Cadastre informações clínicas e anexe arquivos do histórico dos pacientes</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {!showForm && !showHistories ? (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <CardTitle className="text-xl">Selecionar Paciente</CardTitle>
                  <CardDescription>
                    Escolha um paciente para cadastrar ou visualizar o histórico clínico
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome, CPF ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {patients.length === 0 ? 'Nenhum paciente cadastrado' : 'Nenhum paciente encontrado'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {patients.length === 0 
                      ? 'É necessário ter pacientes cadastrados para criar históricos.'
                      : 'Tente ajustar os termos de busca.'
                    }
                  </p>
                  {patients.length === 0 && (
                    <Link to="/cadastro">
                      <Button className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Cadastrar Paciente</span>
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Data Nascimento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.nome} {patient.sobrenome}
                          </TableCell>
                          <TableCell>
                            {patient.cpf ? (
                              <Badge variant="outline">{patient.cpf}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {patient.email ? (
                              <span className="text-sm">{patient.email}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatPhone(patient.celular || patient.fone_fixo)}
                          </TableCell>
                          <TableCell>
                            {formatDate(patient.data_nascimento)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewHistories(patient)}
                                className="h-8 w-8 p-0"
                                title="Visualizar Históricos"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePatientSelect(patient)}
                                className="flex items-center space-x-2"
                              >
                                <FileText className="h-4 w-4" />
                                <span>Novo Histórico</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : showHistories ? (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Históricos do Paciente</CardTitle>
                  <CardDescription>
                    Paciente: {selectedPatient?.nome} {selectedPatient?.sobrenome}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handlePatientSelect(selectedPatient)}
                    className="flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Novo Histórico</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Voltar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {patientHistories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Nenhum histórico encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Este paciente ainda não possui históricos cadastrados.
                  </p>
                  <Button
                    onClick={() => handlePatientSelect(selectedPatient)}
                    className="flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Cadastrar Primeiro Histórico</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientHistories.map((history) => {
                    const dateTime = formatDateTime(history.created_at)
                    return (
                      <Card key={history.id} className="border-l-4 border-l-teal-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                Data: {dateTime.date}
                              </CardTitle>
                              <CardDescription>
                                Horário: {dateTime.time}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHistory(history)}
                              className="h-8 w-8 p-0"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {history.historico && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-800 mb-2">Histórico Clínico:</h4>
                              <p className="text-gray-600 whitespace-pre-wrap">{history.historico}</p>
                            </div>
                          )}
                          {history.arquivo_nome && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Arquivo Anexado:</h4>
                              <div className="flex items-center space-x-2 text-sm text-blue-600">
                                <File className="h-4 w-4" />
                                <span>{history.arquivo_nome}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {editingHistory ? 'Editar Histórico' : 'Cadastrar Histórico'}
                  </CardTitle>
                  <CardDescription>
                    Paciente: {selectedPatient?.nome} {selectedPatient?.sobrenome}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Histórico Clínico
                </label>
                <Textarea
                  placeholder="Digite as informações clínicas do paciente..."
                  value={historico}
                  onChange={(e) => setHistorico(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar Arquivo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Clique para selecionar um arquivo
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Todos os tipos de arquivo são aceitos
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {filePreview ? (
                        <div className="flex-shrink-0">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="h-16 w-16 object-cover rounded-lg border"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <File className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {filePreview && (
                          <div className="flex items-center mt-1">
                            <Image className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs text-green-600">Pré-visualização disponível</span>
                          </div>
                        )}
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

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || (!historico.trim() && !selectedFile)}
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
                      <span>{editingHistory ? 'Atualizar' : 'Salvar'} Histórico</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default HistoricoPaciente

