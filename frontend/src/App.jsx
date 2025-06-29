import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CadastroPaciente from './components/CadastroDentista'; // Renomear para CadastroPaciente
import ConsultaPacientes from './components/ConsultaDentistas'; // Renomear para ConsultaPacientes
import VisualizarPaciente from './components/VisualizarPaciente';
import HistoricoPaciente from './components/HistoricoPaciente';
import Orcamento from './components/Orcamento';
import Agendamento from './components/Agendamento';
import EditarAgendamento from './components/EditarAgendamento';
import Relatorios from './components/Relatorios';
// import AdminButton from './components/AdminButton'; // Será condicionalmente renderizado ou parte do Layout
import AdminPanel from './components/AdminPanel';
import GerenciarDentistas from './components/admin/GerenciarDentistas'; // Será GerenciarUsuarios
import AlterarSenhaAdmin from './components/admin/AlterarSenhaAdmin'; // Pode ser uma funcionalidade de perfil
import TabelaPrecosAdmin from './components/admin/TabelaPrecosAdmin';
import AprovacoesPagamento from './components/admin/AprovacoesPagamento'; // Novo componente
import CadastroUsuario from './components/admin/CadastroUsuario'; // Novo para cadastrar dentistas/admins
import ListaUsuarios from './components/admin/ListaUsuarios'; // Importa o novo componente
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import API_URL from './lib/api'; // Para chamadas à API

// Função para decodificar JWT (simplificada, use uma lib como jwt-decode em produção)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchUserProfile = useCallback(async (token) => {
    // Em um cenário real, você poderia ter um endpoint /api/me para validar o token e pegar dados do usuário
    // Por agora, vamos decodificar o token para pegar o perfil.
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.user_id) {
      // Simulando a busca dos dados completos do usuário se necessário, ou usando o que já vem no token
      // Aqui, estamos assumindo que o login já retorna 'user' com 'id' e 'perfil'
      // Se o token só tiver user_id, você faria um fetch aqui:
      // const response = await fetch(`${API_URL}/usuarios/${decodedToken.user_id}`, { headers: {'x-access-token': token}});
      // const userData = await response.json();
      // setCurrentUser(userData.data); // Ajuste conforme a estrutura da sua API

      // Por enquanto, vamos usar o que o backend já envia no /login ou o que está no token
      // A rota /login já retorna o 'user' object, vamos armazená-lo diretamente
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else if (decodedToken.perfil) { // Se o perfil estiver no token
         setCurrentUser({id: decodedToken.user_id, perfil: decodedToken.perfil, nome: decodedToken.nome || 'Usuário'});
      }
    }
    setLoadingAuth(false);
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoadingAuth(false);
    }
  }, [fetchUserProfile]);

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user)); // Armazena dados do usuário
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  if (loadingAuth) {
    return <div>Carregando autenticação...</div>; // Ou um spinner/loader
  }

  // Componente de Rota Protegida
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (requiredRole && currentUser.perfil !== requiredRole) {
      // Se um perfil específico é requerido e o usuário não o tem
      return <Navigate to="/dashboard" replace />; // Ou para uma página de "acesso negado"
    }
    return children ? children : <Outlet context={{ currentUser, handleLogout }} />; // Passa currentUser e handleLogout para rotas aninhadas
  };

  // Componente de Rota Específica para Admin
  const AdminRoute = ({ children }) => {
    return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
  };


  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard currentUser={currentUser} onLogout={handleLogout} />}
            />
            {/* As demais rotas que usam Outlet context para currentUser e handleLogout permanecem como estão se essa for a intenção */}
            {/* Se elas não usam useOutletContext, podem ser rotas simples dentro de ProtectedRoute */}
            <Route path="/cadastro-paciente" element={<CadastroPaciente />} />
            <Route path="/cadastro-paciente/:id" element={<CadastroPaciente />} />
            <Route path="/visualizar-paciente/:id" element={<VisualizarPaciente />} />
            <Route path="/consulta-pacientes" element={<ConsultaPacientes />} />
            <Route path="/orcamento" element={<Orcamento />} />
            <Route path="/agendamento" element={<Agendamento />} /> {/* Agendamento usa useOutletContext */}
            <Route path="/agendamentos/editar/:idAgendamento" element={<EditarAgendamento />} />
            <Route path="/historico" element={<HistoricoPaciente />} />  {/* HistoricoPaciente usa useOutletContext */}
            <Route path="/relatorios" element={<Relatorios />} />

            {/* Rotas de Admin */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin/gerenciar-usuarios" element={<AdminRoute><GerenciarDentistas /></AdminRoute>} />
            <Route path="/admin/cadastrar-usuario" element={<AdminRoute><CadastroUsuario /></AdminRoute>} />
            <Route path="/admin/usuarios" element={<AdminRoute><ListaUsuarios /></AdminRoute>} /> {/* Nova rota */}
            <Route path="/admin/alterar-senha" element={<AdminRoute><AlterarSenhaAdmin /></AdminRoute>} />
            <Route path="/admin/tabela-precos" element={<AdminRoute><TabelaPrecosAdmin /></AdminRoute>} />
            <Route path="/admin/aprovacoes" element={<AdminRoute><AprovacoesPagamento /></AdminRoute>} />
          </Route>

          <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} /> {/* Rota catch-all */}
        </Routes>
        {/* O AdminButton pode ser movido para dentro do Dashboard ou um Layout autenticado e renderizado condicionalmente */}
        {/* {currentUser && currentUser.perfil === 'admin' && <AdminButton />} */}
        <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}

export default App;