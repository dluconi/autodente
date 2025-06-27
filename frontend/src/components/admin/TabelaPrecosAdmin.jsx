import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowLeft, AlertTriangle } from 'lucide-react';

const TabelaPrecosAdmin = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-3">
          <ListChecks className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configurar Tabela de Preços</h1>
            <p className="text-sm text-gray-500">
              Defina e gerencie os procedimentos e seus respectivos valores.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-12">
          <ListChecks className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Funcionalidade em Desenvolvimento
          </h2>
          <p className="text-gray-500 mb-4">
            A interface para configurar a tabela de preços (adicionar, editar, remover procedimentos e valores, associar convênios) será implementada aqui.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md my-6 max-w-2xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-700" aria-hidden="true" />
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm text-blue-700">
                  <strong>Exemplo de Estrutura de Dados (a ser implementado):</strong><br />
                  - Procedimento: (ex: Consulta Inicial, Restauração Resina, Endodontia Unirradicular)<br />
                  - Valor Padrão (R$): (ex: 150.00)<br />
                  - Convênios: [&#123; nome: 'Convênio X', valor: '100.00' &#125;, &#123; nome: 'Convênio Y', valor: '120.00' &#125;]
                </p>
              </div>
            </div>
          </div>

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

export default TabelaPrecosAdmin;
