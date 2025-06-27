import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, PlusCircle, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import DentistaForm from './DentistaForm'; // Importar o formulário
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner"; // Importar toast
import API_URL from '../../lib/api';


const GerenciarDentistas = () => {
  const [dentistas, setDentistas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false); // Estado para controlar o modal
  const [selectedDentista, setSelectedDentista] = useState(null); // Dentista para edição
  const [showDeleteAlert, setShowDeleteAlert] = useState(false); // Estado para alerta de exclusão
  const [dentistaToDelete, setDentistaToDelete] = useState(null); // Dentista para excluir

  useEffect(() => {
    fetchDentistas();
  }, []);

  const fetchDentistas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dentists`);
      if (!response.ok) {
        throw new Error('Falha ao buscar dentistas');
      }
      const data = await response.json();
      // Assumindo que a API retorna todos os 'dentists' e precisamos filtrar ou adicionar um campo 'tipo' se for misto
      // Por enquanto, vamos assumir que todos são dentistas profissionais ou que a API faz essa distinção
      setDentistas(data.map(d => ({...d, nome_completo: `${d.nome || ''} ${d.sobrenome || ''}`.trim()})));
    } catch (error) {
      console.error("Erro ao buscar dentistas:", error);
      // toast.error(error.message || "Erro ao buscar dentistas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredDentistas = dentistas.filter(dentista =>
    (dentista.nome_completo?.toLowerCase() || '').includes(searchTerm) ||
    (dentista.cro?.toLowerCase() || '').includes(searchTerm) ||
    (dentista.especialidade?.toLowerCase() || '').includes(searchTerm)
  );

  const handleAddDentista = () => {
    setSelectedDentista(null); // Limpa qualquer seleção anterior
    setShowFormModal(true);
  };

  const handleEditDentista = (dentista) => {
    setSelectedDentista(dentista);
    setShowFormModal(true);
  };

  const handleDeleteDentista = (dentista) => {
    setDentistaToDelete(dentista);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!dentistaToDelete) return;
    setLoading(true); // Para feedback visual, pode ser um loading específico para a linha
    try {
      const response = await fetch(`${API_URL}/api/dentists/${dentistaToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.'}));
        throw new Error(errorData.message || 'Falha ao excluir dentista');
      }
      toast.success(`Dentista "${dentistaToDelete.nome_completo}" excluído com sucesso!`);
      fetchDentistas(); // Re-fetch para atualizar a lista
    } catch (error) {
      console.error("Erro ao excluir dentista:", error);
      toast.error(error.message || "Erro ao excluir dentista.");
    } finally {
      setShowDeleteAlert(false);
      setDentistaToDelete(null);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (dentista) => {
    const newStatus = dentista.status_dentista === 'ativo' ? 'inativo' : 'ativo';
    // Otimistic update (opcional, mas melhora UX)
    // const originalDentistas = [...dentistas];
    // setDentistas(dentistas.map(d => d.id === dentista.id ? {...d, status_dentista: newStatus} : d));

    try {
      const response = await fetch(`${API_URL}/api/dentists/${dentista.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Enviar apenas o campo status para atualização parcial, se o backend suportar
        // Ou enviar o objeto dentista completo com o novo status
        body: JSON.stringify({ ...dentista, nome: dentista.nome, sobrenome: dentista.sobrenome, status_dentista: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.'}));
        // Reverter optimistic update em caso de erro
        // setDentistas(originalDentistas);
        throw new Error(errorData.message ||'Falha ao atualizar status do dentista');
      }
      toast.success(`Status do dentista ${dentista.nome_completo} atualizado para ${newStatus}.`);
      fetchDentistas(); // Re-fetch para garantir consistência, ou atualizar localmente de forma mais inteligente
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      // Reverter optimistic update em caso de erro
      // setDentistas(originalDentistas);
      toast.error(error.message || "Erro ao atualizar status.");
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowFormModal(false);
    fetchDentistas(); // Re-fetch dados após submissão bem-sucedida
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Dentistas</h1>
              <p className="text-sm text-gray-500">
                Adicione, edite ou desative dentistas no sistema.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild size="sm">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <Button size="sm" onClick={handleAddDentista}> {/* Chama handleAddDentista */}
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Dentista
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Buscar por nome, CRO ou especialidade..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Carregando dentistas...</p>
        ) : filteredDentistas.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum Dentista Encontrado
            </h2>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "Nenhum dentista corresponde à sua busca." : "Ainda não há dentistas cadastrados."}
            </p>
            <Button onClick={handleAddDentista}> {/* Chama handleAddDentista */}
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Primeiro Dentista
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>CRO</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDentistas.map((dentista) => (
                  <TableRow key={dentista.id}>
                    <TableCell className="font-medium">{dentista.nome_completo}</TableCell>
                    <TableCell>{dentista.cro || 'N/A'}</TableCell>
                    <TableCell>{dentista.especialidade || 'N/A'}</TableCell>
                    <TableCell>{dentista.celular || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={dentista.status_dentista === 'ativo' ? 'default' : 'outline'}
                             className={dentista.status_dentista === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {dentista.status_dentista ? dentista.status_dentista.charAt(0).toUpperCase() + dentista.status_dentista.slice(1) : 'Indefinido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditDentista(dentista)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(dentista)}>
                            {dentista.status_dentista === 'ativo' ? <ToggleLeft className="mr-2 h-4 w-4 text-red-500" /> : <ToggleRight className="mr-2 h-4 w-4 text-green-500" />}
                            {dentista.status_dentista === 'ativo' ? 'Inativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:!text-red-600 hover:!bg-red-50 focus:!text-red-600 focus:!bg-red-50"
                                            onClick={() => handleDeleteDentista(dentista)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Modal para Adicionar/Editar Dentista */}
      {showFormModal && (
        <DentistaForm
          open={showFormModal}
          onOpenChange={setShowFormModal}
          dentista={selectedDentista}
          onSubmitSuccess={handleFormSubmitSuccess}
        />
      )}

      {/* AlertDialog para Confirmação de Exclusão */}
      {showDeleteAlert && dentistaToDelete && (
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o dentista "{dentistaToDelete.nome_completo}"? Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {setShowDeleteAlert(false); setDentistaToDelete(null);}}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default GerenciarDentistas;
