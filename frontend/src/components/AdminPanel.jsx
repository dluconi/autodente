import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Lock, ListChecks, ArrowLeft } from 'lucide-react'; // Ícones adicionados

const AdminPanel = () => {
  const adminModules = [
    {
      path: '/admin/dentistas',
      icon: <Users className="h-5 w-5 mr-2" />,
      title: 'Gerenciar Dentistas',
      description: 'Adicione, edite ou remova dentistas do sistema.',
    },
    {
      path: '/admin/alterar-senha',
      icon: <Lock className="h-5 w-5 mr-2" />,
      title: 'Alterar Senha',
      description: 'Modifique a senha de acesso do administrador.',
    },
    {
      path: '/admin/tabela-precos',
      icon: <ListChecks className="h-5 w-5 mr-2" />,
      title: 'Tabela de Preços',
      description: 'Configure os procedimentos e valores praticados.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <LayoutDashboard className="h-16 w-16 text-blue-700 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold text-gray-800">Painel Administrativo</h1>
        <p className="text-lg text-gray-600 mt-2">
          Gerencie as configurações e dados mestres do sistema.
        </p>
      </header>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-6">
        {adminModules.map((module) => (
          <Link to={module.path} key={module.path} className="block group">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-blue-600 hover:border-blue-700">
              <div className="flex items-center text-blue-700 group-hover:text-blue-800">
                {module.icon}
                <h2 className="text-xl font-semibold ">{module.title}</h2>
              </div>
              <p className="text-gray-600 mt-2 text-sm">{module.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button variant="outline" asChild className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;
