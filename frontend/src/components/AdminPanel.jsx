import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

const AdminPanel = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
        <LayoutDashboard className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Painel Administrativo</h1>
        <p className="text-gray-600 mb-8">
          Esta área é reservada para administradores do sistema.
          Funcionalidades administrativas serão implementadas aqui.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link to="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;
