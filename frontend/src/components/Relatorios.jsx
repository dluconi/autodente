import React, { useState, useEffect, useRef } from 'react'; // Adicionado useRef
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
import { Textarea } from "@/components/ui/textarea"; // Adicionado Textarea

const Relatorios = () => {
  const [pacientes, setPacientes] = useState([]); // Este estado já armazena os pacientes buscados
  const [loading, setLoading] = useState(false); // Loading para a lista de pacientes da página
  const [isAtestadoModalOpen, setIsAtestadoModalOpen] = useState(false);
  const [atestadoGeradoTexto, setAtestadoGeradoTexto] = useState('');
  const [mostrarVisualizacaoAtestado, setMostrarVisualizacaoAtestado] = useState(false);
  const atestadoEditavelRef = useRef(null); // Ref para a div contentEditable

  const initialAtestadoFormState = {
    hora: '',
    dentista: '', // Manterá o ID do dentista selecionado
    afinsConsulta: '',
    periodo: '',
    tempoRepouso: '',
    unidadeTempoRepouso: 'dias', // 'dias' ou 'horas'
    pacienteId: '',
    pacienteNome: '', // Para exibição e uso no texto do atestado
    pacienteRG: '',
    cid: '',
    observacoes: '',
  };

  // Estados para os campos do formulário de Atestado
  const [atestadoForm, setAtestadoForm] = useState(initialAtestadoFormState);

  const handleAtestadoFormChange = (field, value) => {
    if (field === 'pacienteId') {
      const pacienteSelecionado = pacientes.find(p => p.id.toString() === value);
      if (pacienteSelecionado) {
        setAtestadoForm(prev => ({
          ...prev,
          [field]: value,
          pacienteNome: `${pacienteSelecionado.nome || ''} ${pacienteSelecionado.sobrenome || ''}`.trim(),
          pacienteRG: pacienteSelecionado.rg || '', // Assumindo que o paciente tem um campo 'rg'
        }));
      } else {
        // Paciente não encontrado ou valor de placeholder selecionado
        setAtestadoForm(prev => ({
          ...prev,
          [field]: value,
          pacienteNome: '',
          pacienteRG: '',
        }));
      }
    } else {
      setAtestadoForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Mock de dentistas e horários (dentistas será substituído ou virá do usuário logado)
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
    const {
      afinsConsulta,
      pacienteNome,
      pacienteRG,
      periodo,
      hora,
      tempoRepouso,
      unidadeTempoRepouso,
      observacoes,
      cid,
      dentista: dentistaId, // ID do dentista selecionado
    } = atestadoForm;

    // Obter data atual
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexed
    const ano = hoje.getFullYear();
    const dataAtualFormatada = `${dia}/${mes}/${ano}`;

    // Obter nome do dentista
    const dentistaSelecionado = dentistasMock.find(d => d.id === dentistaId);
    const nomeDentista = dentistaSelecionado ? dentistaSelecionado.nome : "Nome do Dentista Não Encontrado";

    // Mapear período para texto
    const periodoMap = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
      integral: "Integral" // Assumindo que "Dia Integral" se traduz para "Integral" no texto
    };
    const periodoTexto = periodoMap[periodo] || periodo;

    // Formatar tipo de repouso
    const tipoRepousoTexto = unidadeTempoRepouso === 'dias' ? 'Dia(s)' : 'Hora(s)';

    const texto = `Tempo Odontologia

ATESTADO

Atestado para fins ${afinsConsulta || '__________________'}, a pedido, que ${pacienteNome || '__________________'}, R.G. ${pacienteRG || '__________________'}, esteve sob tratamento odontológico neste consultório, no período da ${periodoTexto || '__________________'} às ${hora || '__:__'} do dia ${dataAtualFormatada}, necessitando o(a) mesmo(a) de ${tempoRepouso || '__'} ${tipoRepousoTexto} de repouso.

Observações:
${observacoes || ''}

C.I.D: ${cid || '__________________'}

<br/><br/><br/>

Assinatura do paciente ou representante legal.

${nomeDentista}
`;

    setAtestadoGeradoTexto(texto);
    setMostrarVisualizacaoAtestado(true);
    setIsAtestadoModalOpen(false);
    setAtestadoForm(initialAtestadoFormState); // Resetar formulário
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

      {/* Modal de Formulário de Atestados */}
      <Dialog open={isAtestadoModalOpen} onOpenChange={setIsAtestadoModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

            {/* Campo Paciente */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pacienteAtestado" className="text-right">
                Paciente
              </Label>
              <Select
                value={atestadoForm.pacienteId}
                onValueChange={(value) => handleAtestadoFormChange('pacienteId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.length > 0 ? (
                    pacientes.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {`${p.nome || ''} ${p.sobrenome || ''}`.trim()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>Nenhum paciente carregado</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Campo RG do Paciente */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rgPacienteAtestado" className="text-right">
                RG do Paciente
              </Label>
              <Input
                id="rgPacienteAtestado"
                value={atestadoForm.pacienteRG}
                onChange={(e) => handleAtestadoFormChange('pacienteRG', e.target.value)}
                className="col-span-3"
                placeholder="RG do paciente"
              />
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

            {/* Campo C.I.D */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cidAtestado" className="text-right">
                C.I.D (Opcional)
              </Label>
              <Input
                id="cidAtestado"
                value={atestadoForm.cid}
                onChange={(e) => handleAtestadoFormChange('cid', e.target.value)}
                className="col-span-3"
                placeholder="Código C.I.D"
              />
            </div>

            {/* Campo Observações */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacoesAtestado" className="text-right">
                Observações
              </Label>
              <Textarea
                id="observacoesAtestado"
                value={atestadoForm.observacoes}
                onChange={(e) => handleAtestadoFormChange('observacoes', e.target.value)}
                className="col-span-3"
                placeholder="Observações adicionais"
                rows={3}
              />
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

      {/* Modal de Visualização do Atestado Gerado */}
      <Dialog open={mostrarVisualizacaoAtestado} onOpenChange={setMostrarVisualizacaoAtestado}>
        <DialogContent className="sm:max-w-2xl"> {/* Um pouco maior para melhor visualização */}
          <DialogHeader>
            <DialogTitle>Atestado Gerado</DialogTitle>
            <DialogDescription>
              Revise o atestado abaixo. Você pode imprimi-lo ou fechá-lo.
            </DialogDescription>
          </DialogHeader>

          <div
            id="atestadoParaImpressao"
            ref={atestadoEditavelRef}
            contentEditable="true"
            suppressContentEditableWarning={true} // Necessário para evitar warning do React com dangerouslySetInnerHTML e contentEditable
            className="py-4 px-2 border rounded-md bg-gray-50 min-h-[300px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ whiteSpace: "pre-line", fontFamily: "serif" }} // Estilo conforme exemplo e para preservar quebras de linha
            dangerouslySetInnerHTML={{ __html: atestadoGeradoTexto.replace(/\n<br\/>\n<br\/>\n<br\/>\n/g, '<br/><br/><br/>').replace(/\n/g, '<br/>') }}
          />
          {/*
            Nota sobre suppressContentEditableWarning:
            Idealmente, para uma div contentEditable gerenciada pelo React, o conteúdo seria controlado via estado
            e atualizado por eventos como onInput. Como estamos inicializando com dangerouslySetInnerHTML
            e permitindo edição livre, este warning é suprimido. Se precisarmos sincronizar o conteúdo editado
            de volta para o estado React, uma abordagem mais robusta com onInput/onBlur seria necessária.
          */}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMostrarVisualizacaoAtestado(false)}
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (atestadoEditavelRef.current) {
                  const printContents = atestadoEditavelRef.current.innerHTML;
                  const originalContents = document.body.innerHTML;

                  // Adiciona uma div wrapper para aplicar estilos de impressão apenas ao conteúdo do atestado
                  // E os estilos para centralizar e formatar a página de impressão
                  document.body.innerHTML = `
                    <html>
                      <head>
                        <title>Atestado Odontológico</title>
                        <style>
                          @media print {
                            body {
                              margin: 0;
                              padding: 20mm; /* Margens da página de impressão */
                              font-family: serif;
                              font-size: 12pt;
                              line-height: 1.5;
                            }
                            #printable-wrapper {
                              width: 100%;
                              max-width: 180mm; /* Largura A4 menos margens */
                              margin: 0 auto; /* Centralizar */
                            }
                            /* Ocultar tudo que não seja o wrapper do atestado */
                            body > *:not(#printable-wrapper) {
                              display: none !important;
                            }
                            /* Estilos específicos para o conteúdo do atestado, se necessário */
                            #printable-wrapper strong { font-weight: bold; }
                          }
                        </style>
                      </head>
                      <body>
                        <div id="printable-wrapper">
                          ${printContents}
                        </div>
                      </body>
                    </html>
                  `;
                  window.print();
                  document.body.innerHTML = originalContents;
                  // Considerar recarregar para garantir a restauração completa do estado da SPA
                  // window.location.reload();
                } else {
                  console.error("Ref do atestado editável não encontrada.");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
