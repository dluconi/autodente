import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import API_URL from '../../lib/api';

const CadastroUsuario = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('comum'); // 'comum' ou 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!nome || !email || !password || !perfil) {
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({ nome, email, password, perfil }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Usuário cadastrado com sucesso!');
        // Limpar formulário
        setNome('');
        setEmail('');
        setPassword('');
        setPerfil('comum');
      } else {
        setError(data.message || `Erro ${response.status}: Falha ao cadastrar usuário.`);
        toast.error(data.message || `Erro ${response.status}: Falha ao cadastrar usuário.`);
      }
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      setError('Erro de conexão ou ao processar a resposta do servidor.');
      toast.error('Erro de conexão ou ao processar a resposta do servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Cadastrar Novo Usuário</CardTitle>
          <CardDescription>Crie contas para dentistas ou administradores do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Nome do usuário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil de Acesso</Label>
              <Select value={perfil} onValueChange={setPerfil}>
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comum">Comum (Dentista)</SelectItem>
                  <SelectItem value="admin">Admin (Administrador)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroUsuario;
