import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2, ToggleLeft, ToggleRight, UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import API_URL from '../../lib/api'; // Ajuste o caminho se necessário

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Função para buscar usuários, pode ser chamada para refresh
  const fetchUsuarios = async () => {
    if (!token) {
      setError("Token não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Removido /api/ assumindo que API_URL já contém /api
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'x-access-token': token,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
        throw new Error(errData.message || `Erro ao buscar usuários: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.usuarios || []); // Backend retorna {success: true, usuarios: []}
      } else {
        throw new Error(data.message || "Falha ao carregar usuários da API.");
      }
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError(err.message);
      toast.error(`Erro ao buscar usuários: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [token]); // Executa ao montar e quando o token mudar (pouco provável após login)

  const handleToggleStatusUsuario = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    try {
      // Removido /api/ assumindo que API_URL já contém /api
      const response = await fetch(`${API_URL}/usuarios/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || `Status do usuário atualizado para ${newStatus}.`);
        // Atualizar a lista de usuários para refletir a mudança
        setUsuarios(prevUsuarios =>
          prevUsuarios.map(u => u.id === userId ? { ...u, status: newStatus } : u)
        );
      } else {
        throw new Error(data.message || `Falha ao atualizar status do usuário. Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast.error(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handleEditarUsuario = (userId) => {
    // TODO: Implementar a navegação para a página/modal de edição de usuário
    //       Ex: navigate(`/admin/usuarios/editar/${userId}`);
    //       Por agora, vamos apenas logar e dar um toast.
    console.log(`Navegar para editar usuário: ${userId}`);
    toast.info(`A edição do usuário ${userId} será implementada em uma próxima etapa ou componente dedicado.`);
    // Exemplo de como seria com react-router-dom (necessário importar useNavigate)
    // const navigate = useNavigate();
    // navigate(`/admin/usuarios/editar/${userId}`);
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Carregando usuários...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Gerencie os usuários cadastrados no sistema.</CardDescription>
          </div>
          {/* TODO: Adicionar link para a página de Cadastro de Novo Usuário, se não for a mesma */}
          {/* <Button asChild size="sm">
            <Link to="/admin/usuarios/novo"><UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário</Link>
          </Button> */}
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum usuário cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Dentista Vinculado</TableHead> {/* Precisa ver como obter essa info */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome || 'N/A'}</TableCell>
                    <TableCell>{usuario.email || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{usuario.perfil || 'N/A'}</TableCell>
                    <TableCell>{usuario.perfil === 'comum' ? usuario.nome : 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        usuario.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarUsuario(usuario.id)}
                        title="Editar Usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatusUsuario(usuario.id, usuario.status)}
                        title={usuario.status === 'ativo' ? 'Desativar Usuário' : 'Ativar Usuário'}
                      >
                        {usuario.status === 'ativo' ? <ShieldAlert className="h-4 w-4 text-red-600" /> : <ShieldCheck className="h-4 w-4 text-green-600" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListaUsuarios;
