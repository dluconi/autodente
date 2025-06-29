import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card"; // Removido CardHeader, CardTitle, CardDescription
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import API_URL from '../../lib/api';

const CadastroUsuario = () => {
  const [username, setUsername] = useState(''); // Novo estado para username
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('comum');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !nome || !email || !password || !perfil) { // Adicionado username na validação
      setError('Todos os campos são obrigatórios.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      // Removido /api/ assumindo que API_URL já contém /api
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({ username, nome, email, password, perfil }), // Incluído username
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
    // O div container pode ser removido se o AppLayout já fornecer padding suficiente,
    // mas vamos mantê-lo por enquanto para garantir que o max-w-lg funcione como esperado dentro do main do AppLayout.
    // Se o AppLayout já tiver padding, e o <main> for o container direto, este div pode ser redundante.
    // Por agora, a principal mudança é remover o CardHeader.
    // O `container mx-auto` aqui pode estar em conflito ou ser redundante com o `max-w-7xl mx-auto` do AppLayout.
    // O card em si já tem `mx-auto`, então ele se centralizará no seu container pai.
    // Se o pai (do AppLayout) já tem padding e max-width, este container pode não ser necessário.
    // Vamos simplificar removendo o div container e o padding, confiando no AppLayout.
    // <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-lg mx-auto">
        {/* CardHeader removido pois o título agora vem do AppLayout */}
        <CardContent className="pt-6"> {/* Adicionado padding superior ao CardContent já que não há CardHeader */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário (para login)</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ex: dr.lucca, admin_sistema"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo (para exibição)</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Nome completo do usuário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (para contato/recuperação)</Label>
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
    // </div>
  );
};

export default CadastroUsuario;
