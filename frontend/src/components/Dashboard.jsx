import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stethoscope, UserPlus, Users, FileText, Home, Calendar, CalendarDays, LogOut, BarChart } from 'lucide-react' // Adicionado BarChart
import { useState, useEffect } from 'react'
import API_URL from '../lib/api';

const Dashboard = ({ onLogout }) => {
  const [appointmentsToday, setAppointmentsToday] = useState([])
  const [appointmentsTomorrow, setAppointmentsTomorrow] = useState([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [todayRegistrations, setTodayRegistrations] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const cleanedApiUrl = API_URL.replace(/\/$/, ""); // Remove a barra final de API_URL se existir
    try {
      // Buscar agendamentos de hoje
      const todayResponse = await fetch(`${cleanedApiUrl}/appointments/today`)
      const todayData = await todayResponse.json()
      setAppointmentsToday(todayData)

      // Buscar agendamentos de amanhã
      const tomorrowResponse = await fetch(`${cleanedApiUrl}/appointments/tomorrow`)
      const tomorrowData = await tomorrowResponse.json()
      setAppointmentsTomorrow(tomorrowData)

      // Buscar total de pacientes
      const patientsResponse = await fetch(`${cleanedApiUrl}/dentists`)
      const patientsData = await patientsResponse.json()
      setTotalPatients(patientsData.length)

      // Calcular cadastros de hoje
      const today = new Date().toISOString().split('T')[0]
      const todayRegs = patientsData.filter(patient => 
        patient.created_at && patient.created_at.startsWith(today)
      ).length
      setTodayRegistrations(todayRegs)

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time) => {
    return time.substring(0, 5) // Remove segundos se houver
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logoff</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Gestão Odontológica</h2>
          <p className="text-gray-600">Cadastre, organize e acompanhe seus pacientes com eficiência em um painel pensado para dentistas.</p>
        </div>

        {/* Módulos do Sistema - Todos os cards com altura uniforme e flexível */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Novo Cadastro */}
          <Link to="/cadastro" className="flex">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Novo Cadastro</CardTitle>
                    <CardDescription>Cadastrar novo paciente</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Adicione um novo paciente ao sistema com todos os dados necessários.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Consultar Pacientes */}
          <Link to="/consulta" className="flex">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Consultar Pacientes</CardTitle>
                    <CardDescription>Visualizar pacientes cadastrados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Consulte, edite e gerencie os dados dos pacientes cadastrados.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Histórico de Pacientes */}
          <Link to="/historico" className="flex">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-teal-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <FileText className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Histórico de Pacientes</CardTitle>
                    <CardDescription>Cadastrar histórico clínico</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Cadastre informações clínicas e anexe arquivos do histórico.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Orçamento */}
          <Link to="/orcamento" className="flex">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Orçamento</CardTitle>
                    <CardDescription>Criar orçamentos para pacientes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Crie orçamentos detalhados com procedimentos e formas de pagamento.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Agendamento */}
          <Link to="/agendamento" className="flex">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Agendamento</CardTitle>
                    <CardDescription>Agendar consultas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Agende consultas para pacientes existentes ou faça pré-cadastro.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Relatórios */}
          <Link to="/relatorios" className="flex">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <BarChart className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Relatórios</CardTitle>
                    <CardDescription>Visualizar e gerar relatórios</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Acesse e gere relatórios detalhados do sistema.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Dashboards de Agendamentos - Centralizados */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl w-full">
            {/* Pacientes de Hoje */}
            <Card className="shadow-lg">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Pacientes de Hoje</span>
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <p className="text-gray-500">Carregando...</p>
                ) : appointmentsToday.length > 0 ? (
                  <div className="space-y-3">
                    {appointmentsToday.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{appointment.patient_name}</p>
                          <p className="text-sm text-gray-600">Agendamento</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatTime(appointment.appointment_time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum agendamento para hoje</p>
                )}
              </CardContent>
            </Card>

            {/* Pacientes de Amanhã */}
            <Card className="shadow-lg">
              <CardHeader className="bg-green-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Pacientes de Amanhã</span>
                </CardTitle>
                <CardDescription className="text-green-100">
                  {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <p className="text-gray-500">Carregando...</p>
                ) : appointmentsTomorrow.length > 0 ? (
                  <div className="space-y-3">
                    {appointmentsTomorrow.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{appointment.patient_name}</p>
                          <p className="text-sm text-gray-600">Agendamento</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatTime(appointment.appointment_time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum agendamento para amanhã</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>


      </main>
    </div>
  )
}

export default Dashboard

