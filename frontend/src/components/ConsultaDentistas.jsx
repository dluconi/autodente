import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, ArrowLeft, Search, Eye, Edit, Trash2, UserPlus } from 'lucide-react'
import API_URL from '../lib/api';

const ConsultaDentistas = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(paciente => { // Alterado para paciente
        if (!paciente) return false;
        return (
          (paciente.nome && paciente.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (paciente.sobrenome && paciente.sobrenome.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (paciente.cpf && paciente.cpf.includes(searchTerm)) ||
          (paciente.email && paciente.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  const fetchPatients = async () => {
    const token = localStorage.getItem('token'); // Adicionar token
    try {
      const response = await fetch(`${API_URL}/pacientes`, { // Alterado para /pacientes
        headers: { 'x-access-token': token }
      });
      if (!response.ok) throw new Error('Falha ao buscar pacientes');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []); // Garantir que seja um array
      setFilteredPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar pacientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      const token = localStorage.getItem('token'); // Adicionar token
      try {
        const response = await fetch(`${API_URL}/pacientes/${id}`, { // Alterado para /pacientes
          method: 'DELETE',
          headers: { 'x-access-token': token }
        });
        
        if (response.ok) {
          fetchPatients(); // Recarregar a lista
        } else {
          const data = await response.json();
          setError(data.message || 'Erro ao excluir paciente');
        }
      } catch (err) {
        setError('Erro de conexão com o servidor: ' + err.message);
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
              <Link to="/cadastro">
                <Button size="sm" className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Novo Paciente</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Consulta de Pacientes</h2>
          <p className="text-gray-600">Visualize e gerencie os pacientes cadastrados</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-xl">Pacientes Cadastrados</CardTitle>
                <CardDescription>
                  Total de {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
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
                    ? 'Comece cadastrando o primeiro paciente do sistema.'
                    : 'Tente ajustar os termos de busca.'
                  }
                </p>
                {patients.length === 0 && (
                  <Link to="/cadastro">
                    <Button className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Cadastrar Primeiro Paciente</span>
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
                      <TableHead>Cadastrado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((dentist) => (
                      <TableRow key={dentist.id}>
                        <TableCell className="font-medium">
                          {dentist.nome} {dentist.sobrenome}
                        </TableCell>
                        <TableCell>
                          {dentist.cpf ? (
                            <Badge variant="outline">{dentist.cpf}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {dentist.email ? (
                            <span className="text-sm">{dentist.email}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatPhone(dentist.celular || dentist.fone_fixo)}
                        </TableCell>
                        <TableCell>
                          {formatDate(dentist.data_nascimento)}
                        </TableCell>
                        <TableCell>
                          {formatDate(dentist.cadastrado_em)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link to={`/visualizar-paciente/${dentist.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/cadastro/${dentist.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Excluir"
                              onClick={() => handleDelete(dentist.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

        {filteredPatients.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
              <div>
                Mostrando {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''}
              </div>
              <div className="mt-2 sm:mt-0">
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ConsultaDentistas

