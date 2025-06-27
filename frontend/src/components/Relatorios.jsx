import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react'; // Adicionado FileText
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import API_URL from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Removido pois o trigger é manual via estado
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Relatorios = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAtestadoModalOpen, setIsAtestadoModalOpen] = useState(false);

  // Estados para os campos do formulário de Atestado
  const [atestadoForm, setAtestadoForm] = useState({
    hora: '',
    dentista: '',
    afinsConsulta: '',
    periodo: '',
    tempoRepouso: '',
    unidadeTempoRepouso: 'dias', // 'dias' ou 'horas'
  });

  const handleAtestadoFormChange = (field, value) => {
    setAtestadoForm(prev => ({ ...prev, [field]: value }));
  };

  // Mock de dentistas e horários
  const dentistasMock = [
    { id: '1', nome: 'Dr. Carlos Alberto' },
    { id: '2', nome: 'Dra. Ana Beatriz' },
    { id: '3', nome: 'Dr. Lucca Spinelli' },
  ];

  const horariosConsulta = Array.from({ length: 12 }, (_, i) => { // 08:00 to 19:00
    const hour = String(i + 8).padStart(2, '0');
    return `${hour}:00`;
  });


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

  const handleAtestadoOk = () => {
    console.log("Dados do atestado:", atestadoForm);
    // Resetar o formulário após o envio (opcional, mas boa prática)
    setAtestadoForm({
        hora: '',
        dentista: '',
        afinsConsulta: '',
        periodo: '',
        tempoRepouso: '',
        unidadeTempoRepouso: 'dias',
    });
    setIsAtestadoModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Módulo de Relatórios</h1>
        <p className="text-gray-600">Gere e visualize relatórios do sistema.</p>
      </header>

      {/* Seção de Relatório de Pacientes */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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

      {/* Seção de Atestados */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Atestados</h2>
        <p className="text-gray-600 mb-6">
          Gere atestados para pacientes com base nas informações da consulta.
        </p>
        <Button
          onClick={() => setIsAtestadoModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <FileText className="mr-2 h-4 w-4" />
          Gerar Atestado
        </Button>
      </div>

      {/* Modal de Atestados */}
      <Dialog open={isAtestadoModalOpen} onOpenChange={setIsAtestadoModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerar Atestado</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para gerar o atestado.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="horaAtestado" className="text-right">
                Hora
              </Label>
              <Select
                value={atestadoForm.hora}
                onValueChange={(value) => handleAtestadoFormChange('hora', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a hora" />
                </SelectTrigger>
                <SelectContent>
                  {horariosConsulta.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dentistaAtestado" className="text-right">
                Dentista
              </Label>
              <Select
                value={atestadoForm.dentista}
                onValueChange={(value) => handleAtestadoFormChange('dentista', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o dentista" />
                </SelectTrigger>
                <SelectContent>
                  {dentistasMock.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="afinsConsultaAtestado" className="text-right">
                Afins da Consulta
              </Label>
              <Input
                id="afinsConsultaAtestado"
                value={atestadoForm.afinsConsulta}
                onChange={(e) => handleAtestadoFormChange('afinsConsulta', e.target.value)}
                className="col-span-3"
                placeholder="Motivo da consulta/atestado"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="periodoAtestado" className="text-right">
                Período
              </Label>
              <Select
                value={atestadoForm.periodo}
                onValueChange={(value) => handleAtestadoFormChange('periodo', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                  <SelectItem value="integral">Dia Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tempoRepousoAtestado" className="text-right">
                Tempo de Repouso
              </Label>
              <Input
                id="tempoRepousoAtestado"
                type="number"
                value={atestadoForm.tempoRepouso}
                onChange={(e) => handleAtestadoFormChange('tempoRepouso', e.target.value)}
                className="col-span-2"
                placeholder="Ex: 1, 2, 3..."
              />
              <Select
                value={atestadoForm.unidadeTempoRepouso}
                onValueChange={(value) => handleAtestadoFormChange('unidadeTempoRepouso', value)}
              >
                <SelectTrigger className="col-span-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dias">Dia(s)</SelectItem>
                  <SelectItem value="horas">Hora(s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleAtestadoOk}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
