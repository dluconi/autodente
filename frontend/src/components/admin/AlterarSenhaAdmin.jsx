import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

const AlterarSenhaAdmin = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="max-w-3xl mx-auto flex items-center space-x-3">
          <Lock className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Alterar Senha do Administrador</h1>
            <p className="text-sm text-gray-500">
              Mantenha a segurança da sua conta alterando sua senha regularmente.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input type="password" id="currentPassword" placeholder="********" disabled className="mt-1" />
          </div>
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input type="password" id="newPassword" placeholder="********" disabled className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
            <Input type="password" id="confirmNewPassword" placeholder="********" disabled className="mt-1" />
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md my-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-yellow-700" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Esta funcionalidade de alteração de senha ainda está em desenvolvimento. Os campos estão desabilitados.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Painel
              </Link>
            </Button>
            <Button type="submit" disabled className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
              <Lock className="h-4 w-4 mr-2" />
              Salvar Nova Senha (Desabilitado)
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AlterarSenhaAdmin;
