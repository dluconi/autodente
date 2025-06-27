import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CadastroDentista from './components/CadastroDentista';
import ConsultaDentistas from './components/ConsultaDentistas';
import VisualizarPaciente from './components/VisualizarPaciente';
import HistoricoPaciente from './components/HistoricoPaciente';
import Orcamento from './components/Orcamento';
import Agendamento from './components/Agendamento';
import EditarAgendamento from './components/EditarAgendamento'; // Correto!
import Relatorios from './components/Relatorios'; // Adicionar importação
import AdminButton from './components/AdminButton'; // Importar AdminButton
import AdminPanel from './components/AdminPanel'; // Importar AdminPanel
import GerenciarDentistas from './components/admin/GerenciarDentistas'; // Importar GerenciarDentistas
import AlterarSenhaAdmin from './components/admin/AlterarSenhaAdmin'; // Importar AlterarSenhaAdmin
import TabelaPrecosAdmin from './components/admin/TabelaPrecosAdmin'; // Importar TabelaPrecosAdmin
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/cadastro" 
            element={isAuthenticated ? <CadastroDentista /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/cadastro/:id" 
            element={isAuthenticated ? <CadastroDentista /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/visualizar/:id" 
            element={isAuthenticated ? <VisualizarPaciente /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/consulta" 
            element={isAuthenticated ? <ConsultaDentistas /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/orcamento" 
            element={isAuthenticated ? <Orcamento /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/agendamento" 
            element={isAuthenticated ? <Agendamento /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/agendamentos/editar/:idAgendamento" // Correto!
            element={isAuthenticated ? <EditarAgendamento /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/historico" 
            element={isAuthenticated ? <HistoricoPaciente /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/relatorios"
            element={isAuthenticated ? <Relatorios /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/dentistas"
            element={isAuthenticated ? <GerenciarDentistas /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/alterar-senha"
            element={isAuthenticated ? <AlterarSenhaAdmin /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/tabela-precos"
            element={isAuthenticated ? <TabelaPrecosAdmin /> : <Navigate to="/login" replace />}
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        {isAuthenticated && <AdminButton />} {/* Renderiza o botão se autenticado */}
      </div>
    </Router>
  );
}

export default App;