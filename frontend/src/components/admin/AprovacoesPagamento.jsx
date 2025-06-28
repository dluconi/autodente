import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import API_URL from '../../lib/api';

const AprovacoesPagamento = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPagamentosPendentes = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/pagamentos/pendentes`, {
        headers: {
          'x-access-token': token,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Erro ao buscar pagamentos: ${response.status}`);
      }
      const data = await response.json();
      setPagamentos(data);
    } catch (err) {
      console.error("Erro ao buscar pagamentos pendentes:", err);
      setError(err.message || 'Não foi possível carregar os pagamentos pendentes.');
      toast.error(err.message || 'Não foi possível carregar os pagamentos pendentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPagamentosPendentes();
  }, [fetchPagamentosPendentes]);

  const handleAction = async (pagamentoId, acao) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/pagamentos/${pagamentoId}/${acao}`, {
        method: 'POST',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Erro ao ${acao} pagamento.`);
      }
      const data = await response.json();
      toast.success(`Pagamento ${data.pagamento.status} com sucesso!`);
      fetchPagamentosPendentes(); // Re-fetch a lista
    } catch (err) {
      console.error(`Erro na ação ${acao}:`, err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && pagamentos.length === 0) {
    return <div className="p-4">Carregando aprovações de pagamento...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Aprovações de Pagamento</CardTitle>
          <CardDescription>Gerencie os pagamentos pendentes de aprovação.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {pagamentos.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500">Não há pagamentos pendentes no momento.</p>
          )}
          {pagamentos.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Valor (R$)</TableHead>
                  <TableHead>Dentista Responsável</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell>{pagamento.paciente_nome}</TableCell>
                    <TableCell>{parseFloat(pagamento.valor).toFixed(2)}</TableCell>
                    <TableCell>{pagamento.dentista_nome}</TableCell>
                    <TableCell>{new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell>
                      <Badge variant={pagamento.status === 'pendente' ? 'outline' : pagamento.status === 'aprovado' ? 'default' : 'destructive'}>
                        {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {pagamento.status === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="success" // Shadcn/ui não tem variant 'success' por padrão, pode ser 'default' ou customizada
                            onClick={() => handleAction(pagamento.id, 'aprovar')}
                            disabled={loading}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(pagamento.id, 'rejeitar')}
                            disabled={loading}
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
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

export default AprovacoesPagamento;
