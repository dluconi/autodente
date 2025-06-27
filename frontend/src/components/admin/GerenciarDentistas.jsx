import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';

const GerenciarDentistas = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Dentistas</h1>
            <p className="text-sm text-gray-500">
              Adicione, edite ou desative dentistas no sistema.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-12">
          <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Funcionalidade em Desenvolvimento
          </h2>
          <p className="text-gray-500 mb-6">
            A interface para gerenciar dentistas (criar, visualizar, editar, desativar) será implementada aqui.
          </p>
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel Administrativo
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GerenciarDentistas;
