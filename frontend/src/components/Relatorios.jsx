import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_URL from '../lib/api';

const Relatorios = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dentists`);
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      // Adicionar feedback para o usuário aqui, se necessário
    } finally {
      setLoading(false);
    }
  };

  const gerarPDFPacientes = () => {
    if (pacientes.length === 0) {
      alert('Não há pacientes para gerar o relatório.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Relatório de Pacientes', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Total de pacientes: ${pacientes.length}`, 14, 30);

    const tableColumn = [
      "ID", "Nome Completo", "CPF", "Telefone Celular", "Email"
    ];
    const tableRows = [];

    pacientes.forEach(paciente => {
      const pacienteData = [
        paciente.id,
        `${paciente.nome || ''} ${paciente.sobrenome || ''}`,
        paciente.cpf || 'N/A',
        paciente.celular || 'N/A',
        paciente.email || 'N/A',
      ];
      tableRows.push(pacienteData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] }, // Cor verde azulado para o cabeçalho
      margin: { top: 10 },
    });

    doc.setFontSize(10);
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }

    doc.save('relatorio_pacientes.pdf');
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Módulo de Relatórios</h1>
        <p className="text-gray-600">Gere e visualize relatórios do sistema.</p>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Relatório de Pacientes</h2>
        <p className="text-gray-600 mb-6">
          Este relatório lista todos os pacientes cadastrados no sistema com seus principais dados de contato.
        </p>
        <Button
          onClick={gerarPDFPacientes}
          disabled={loading || pacientes.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Carregando pacientes...' : 'Gerar PDF de Pacientes'}
        </Button>
        {pacientes.length === 0 && !loading && (
          <p className="text-sm text-red-500 mt-2">Nenhum paciente encontrado para gerar o relatório.</p>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
