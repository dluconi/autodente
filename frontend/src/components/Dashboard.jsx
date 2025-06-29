import { Link } from 'react-router-dom'; // Removido useOutletContext
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Stethoscope, UserPlus, Users, FileText, Home, Calendar, LogOut, BarChart,
  DollarSign, ShieldCheck, UserCog, ListChecks
} from 'lucide-react';
import AdminButton from './AdminButton';

// O Dashboard agora recebe currentUser e onLogout como props
const Dashboard = ({ currentUser, onLogout }) => {

  const nomeUsuario = currentUser?.nome || 'Usuário';
  const perfilUsuario = currentUser?.perfil || 'desconhecido';


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
                {/* TODO: Nome da clínica ou nome do Admin/Dentista logado */}
                <h1 className="text-xl font-bold text-gray-800">Bem-vindo(a), {nomeUsuario}!</h1>
                <p className="text-sm text-blue-600 font-medium">
                  Perfil: {perfilUsuario.charAt(0).toUpperCase() + perfilUsuario.slice(1)}
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Início</span>
                </Button>
              </Link>
              {/* Botão Admin visível apenas para admins */}
              {currentUser && currentUser.perfil === 'admin' && (
                <AdminButton />
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onLogout} // Usar onLogout recebido via props
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Painel de Controle</h2>
          <p className="text-gray-600">Acesse as funcionalidades do sistema de forma rápida e organizada.</p>
        </div>

        {/* Módulos do Sistema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          {/* Novo Cadastro de Paciente */}
          <Link to="/cadastro-paciente" className="flex"> {/* Rota atualizada */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500 w-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Novo Paciente</CardTitle>
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
          <Link to="/consulta-pacientes" className="flex"> {/* Rota atualizada */}
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
                    <DollarSign className="h-6 w-6 text-orange-600" /> {/* Ícone atualizado */}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-800">Orçamento</CardTitle>
                    <CardDescription>Criar orçamentos para pacientes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Crie orçamentos detalhados com procedimentos e valores.
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
                    <CardTitle className="text-lg text-gray-800">Agenda</CardTitle> {/* Simplificado */}
                    <CardDescription>Gerenciar agendamentos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">
                  Visualize e gerencie sua agenda de consultas.
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

          {/* Módulos de Admin - Visíveis apenas para perfil 'admin' */}
          {currentUser && currentUser.perfil === 'admin' && (
            <>
              {/* Aprovações de Pagamento */}
              <Link to="/admin/aprovacoes" className="flex">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500 w-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <ShieldCheck className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-800">Aprovar Pagamentos</CardTitle>
                        <CardDescription>Gerenciar pagamentos pendentes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600">
                      Aprove ou rejeite pagamentos registrados pelos dentistas.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Cadastrar Usuário (Dentista/Admin) */}
              <Link to="/admin/cadastrar-usuario" className="flex">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-indigo-500 w-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <UserCog className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-800">Cadastrar Usuário</CardTitle>
                        <CardDescription>Adicionar dentistas ou admins</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600">
                      Crie novas contas de usuário para o sistema.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Listar Usuários */}
              <Link to="/admin/usuarios" className="flex">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-cyan-500 w-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-100 p-2 rounded-full">
                        <ListChecks className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-800">Listar Usuários</CardTitle>
                        <CardDescription>Gerenciar usuários existentes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600">
                      Visualize, edite e gerencie o status dos usuários.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard;

