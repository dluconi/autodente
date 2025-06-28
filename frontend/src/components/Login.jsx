import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, Mail, Lock } from 'lucide-react'; // Alterado User para Mail
import API_URL from '../lib/api';

const Login = ({ onLoginSuccess }) => { // Renomeado onLogin para onLoginSuccess
  const [email, setEmail] = useState(''); // Alterado username para email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email e senha são obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Alterado username para email
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.token, data.user); // Passa token e dados do usuário
      } else {
        setError(data.message || `Erro ${response.status}: Falha ao fazer login`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Erro de conexão ou ao processar a resposta do servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Dr. Lucca Spinelli
          </CardTitle>
          <CardDescription className="text-lg text-blue-600 font-medium">
            Endodontista
          </CardDescription>
          <CardDescription className="text-sm text-gray-600">
            Sistema de Gerenciamento Odontológico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email" // Alterado type para email
                  placeholder="seuemail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          {/* Comentado ou removido, pois o admin padrão agora é criado no backend
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Usuário padrão: admin@example.com</p>
            <p>Senha padrão: admin123</p>
          </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

