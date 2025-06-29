import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogOut, ChevronLeft, Stethoscope, UserCog } from 'lucide-react'; // Adicionado ChevronLeft
import AdminButton from './AdminButton'; // Mantido para consistência, se necessário

const AppLayout = ({ currentUser, onLogout, title, children }) => {
  const navigate = useNavigate();
  const nomeUsuario = currentUser?.nome || 'Usuário';
  const perfilUsuario = currentUser?.perfil || 'desconhecido';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              {/* Botão Voltar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800"
                aria-label="Voltar"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="bg-blue-600 p-2 rounded-full">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Bem-vindo(a), {nomeUsuario}!</h1>
                <p className="text-sm text-blue-600 font-medium">
                  Perfil: {perfilUsuario.charAt(0).toUpperCase() + perfilUsuario.slice(1)}
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Início</span>
                </Button>
              </Link>
              {currentUser && currentUser.perfil === 'admin' && (
                <AdminButton />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            {/* Você pode adicionar uma descrição aqui se necessário, passada por props */}
          </div>
        )}
        <div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
