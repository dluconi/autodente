import { useOutletContext } from "react-router-dom";
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ResizableBox } from 'react-resizable';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Stethoscope, ArrowLeft, Calendar, Search, Home, Trash2, Edit } from 'lucide-react';
import API_URL from '../lib/api';

export default function Agendamento() {
  const isPastDate = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      console.warn("Invalid date string provided to isPastDate:", dateString);
      return false;
    }
    const appointmentDate = new Date(parts[0], parts[1] - 1, parts[2]);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Renomeado de buscaPacienteInput
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');
  const [duracao, setDuracao] = useState('30');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBuscaResultados, setShowBuscaResultados] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dentistas, setDentistas] = useState([]);
  // Para o dropdown de seleção de dentista na visualização da agenda (APENAS ADMIN)
  const [adminVisualizandoDentistaId, setAdminVisualizandoDentistaId] = useState('');
  // Para o formulário de agendamento (usado por admin para definir quem realiza, ou por dentista para si mesmo)
  const [dentistaAgendamentoFormId, setDentistaAgendamentoFormId] = useState('');
  const { currentUser, token } = useOutletContext();

  useEffect(() => {
    if (currentUser?.perfil === "admin" && token) {
      // Carrega a lista de dentistas para o admin poder selecionar qual agenda visualizar ou para quem agendar.
      // Removido /api/ assumindo que API_URL já contém /api
      fetch(`${API_URL}/dentistas`, {
        headers: { "x-access-token": token }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Falha ao buscar dentistas: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Dentistas recebidos:", data); // Para depuração
          setDentistas(Array.isArray(data) ? data : []);
          if (!Array.isArray(data)) {
            console.warn("/api/dentistas não retornou um array. Dados:", data);
            toast.error("Formato inesperado de dados dos dentistas.");
          }
        })
        .catch(error => {
          console.error("Erro ao carregar dentistas:", error);
          toast.error(`Erro ao carregar dentistas: ${error.message}`);
          setDentistas([]); // Garante que seja um array vazio em caso de erro
        });
    }
  }, [currentUser, token]);

  useEffect(() => {
    const carregarPacientes = async () => {
      if (!token) return;
        try {
            // Removido /api/ assumindo que API_URL já contém /api
            const response = await fetch(`${API_URL}/pacientes`, { headers: { "x-access-token": token } });
            if (!response.ok) throw new Error('Falha ao buscar pacientes');
            const data = await response.json();
            // O backend GET /api/pacientes retorna diretamente um array.
            // Ajuste anterior para data.pacientes era por precaução, mas o backend atual não o usa.
            setPacientes(Array.isArray(data) ? data : []);
            setPacientesFiltrados(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
            toast.error("Falha ao carregar lista de pacientes.");
            setPacientes([]);
            setPacientesFiltrados([]);
        }
    };
    carregarPacientes();
  }, [token]);

  // Normalizador de CPF
  const normalizeCpf = (cpf) => {
    return cpf ? cpf.replace(/[^\d]/g, '') : '';
  };

  // useEffect para debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const termoBusca = debouncedSearchTerm.trim();

    if (termoBusca === '') {
      // Mostra todos os pacientes se o termo de busca debounced (e o visual) estiverem vazios
      setPacientesFiltrados(searchTerm.trim() === '' ? pacientes : []);
      return;
    }

    const lowerBusca = termoBusca.toLowerCase();
    const cpfBuscaNormalizado = normalizeCpf(termoBusca);

    const filtrados = pacientes.filter(p => {
      const nomeCompleto = `${p.nome} ${p.sobrenome || ''}`.toLowerCase();
      const cpfPacienteNormalizado = normalizeCpf(p.cpf);
      const nomeIndividual = p.nome.toLowerCase();
      const sobrenomeIndividual = p.sobrenome ? p.sobrenome.toLowerCase() : '';

      return (
        nomeCompleto.includes(lowerBusca) ||
        nomeIndividual.includes(lowerBusca) ||
        (sobrenomeIndividual && sobrenomeIndividual.includes(lowerBusca)) ||
        (cpfPacienteNormalizado && cpfBuscaNormalizado && cpfPacienteNormalizado.includes(cpfBuscaNormalizado))
      );
    });
    setPacientesFiltrados(filtrados);
  }, [debouncedSearchTerm, pacientes, searchTerm]);

  const handleAgendar = async () => {
    if (!pacienteSelecionadoId && !searchTerm.trim()) { // Usa searchTerm aqui
      toast.error('Por favor, selecione ou digite o nome do paciente.');
      return;
    }
    if (!dataAgendamento || !horaAgendamento) {
      toast.error('Por favor, preencha a data e hora do agendamento.');
      return;
    }
    // No formulário de agendamento, o admin DEVE selecionar um dentista.
    // O dentista comum sempre agenda para si mesmo.
    let dentistaIdParaAgendar;
    if (currentUser?.perfil === 'admin') {
      if (!dentistaAgendamentoFormId) {
        toast.error('Admin, por favor selecione o dentista para o agendamento.');
        return;
      }
      dentistaIdParaAgendar = parseInt(dentistaAgendamentoFormId, 10);
    } else {
      dentistaIdParaAgendar = currentUser?.id;
    }

    if (!dentistaIdParaAgendar) {
      toast.error('Não foi possível identificar o dentista para este agendamento.');
      setLoading(false);
      return;
    }

    setLoading(true);
    let agendamentoPayload = {
      appointment_date: dataAgendamento,
      appointment_time: horaAgendamento,
      observacao: observacao,
      duration_minutes: parseInt(duracao, 10),
      dentista_id: dentistaIdParaAgendar,
    };

    if (!agendamentoPayload.dentista_id) { // Dupla verificação, mas útil.
        toast.error("Usuário ou dentista não identificado. Não é possível agendar.");
        setLoading(false);
        return;
    }

    if (pacienteSelecionadoId) {
      agendamentoPayload.patient_id = parseInt(pacienteSelecionadoId, 10);
    } else {
      agendamentoPayload.patient_name = searchTerm.trim(); // Usa searchTerm aqui
    }

    if (!agendamentoPayload.patient_id && !agendamentoPayload.patient_name) {
        toast.error('Nome do paciente ou ID é necessário.');
        setLoading(false);
        return;
    }

    try {
      // Removido /api/ assumindo que API_URL já contém /api
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(agendamentoPayload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Agendamento realizado com sucesso!');
        setPacienteSelecionadoId('');
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setObservacao('');
        setDuracao('30');
        setDentistaAgendamentoFormId('');
        setShowBuscaResultados(false);
        setIsModalOpen(false);
        // Atualizar o calendário para o dentista cuja agenda está sendo visualizada (se admin) ou para o dentista logado
        // A função fetchCalendarAppointments no CalendarioAgendamentos usará adminVisualizandoDentistaId
        // Disparar um evento ou chamar uma função de refresh aqui, se necessário, ou confiar no useEffect do CalendarioAgendamentos.
        // Disparar atualização do calendário (ex: chamando fetchCalendarAppointments se estiver acessível)
      } else {
        toast.error(`Erro: ${result.message || 'Falha ao agendar.'}`);
      }
    } catch (error) {
      toast.error('Erro de conexão ao realizar agendamento.');
      console.error('Erro no agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscaInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowBuscaResultados(true);
    if (e.target.value) {
      setPacienteSelecionadoId('');
    }
  };

  const selecionarPacienteDaLista = (paciente) => {
    setPacienteSelecionadoId(paciente.id.toString());
    const nomeExibicao = `${paciente.nome} ${paciente.sobrenome || ''}`.trim();
    setSearchTerm(nomeExibicao);
    setDebouncedSearchTerm(nomeExibicao);
    setShowBuscaResultados(false);
  };

  const abrirModalAgendamento = (dia, horario) => {
    setDataAgendamento(dia.toISOString().split('T')[0]);
    setHoraAgendamento(horario);
    setPacienteSelecionadoId('');
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setObservacao('');
    setDuracao('30');
    // Ao abrir o modal, se for admin, ele pode selecionar para qual dentista agendar.
    // Se for um dentista comum, o dentistaAgendamentoFormId não é usado (agendará para si mesmo).
    setDentistaAgendamentoFormId(currentUser?.perfil === 'admin' ? adminVisualizandoDentistaId : ''); // Pre-seleciona o dentista que o admin está visualizando, ou vazio
    setIsModalOpen(true);
  };

  const AgendamentoForm = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAgendar(); }}>
      <div className="grid w-full items-center gap-6">
        {currentUser?.perfil === 'admin' && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="dentista-select-modal">Dentista Responsável</Label>
            {/* Admin seleciona para qual dentista COMUM o agendamento será feito */}
            <Select value={dentistaAgendamentoFormId} onValueChange={setDentistaAgendamentoFormId} required>
              <SelectTrigger id="dentista-select-modal">
                <SelectValue placeholder="Selecione o dentista para o agendamento" />
              </SelectTrigger>
              <SelectContent>
                {dentistas.filter(d => d.perfil === 'comum').map(dentista => (
                  <SelectItem key={dentista.id} value={dentista.id.toString()}>
                    Dr. {dentista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="busca-paciente-modal">Buscar Paciente Existente</Label>
          <div className="relative">
            <div className="flex">
              <Input id="busca-paciente-modal" placeholder="Digite nome ou CPF do paciente" value={searchTerm} onChange={handleBuscaInputChange} onFocus={() => setShowBuscaResultados(true)} className="pr-10"/>
              <Button type="button" variant="outline" size="sm" className="ml-2" onClick={() => setShowBuscaResultados(!showBuscaResultados)}><Search className="h-4 w-4" /></Button>
            </div>
            {showBuscaResultados && searchTerm.trim() !== '' && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {pacientesFiltrados.length > 0 ? pacientesFiltrados.map((paciente) => (
                  <div key={paciente.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b" onClick={() => selecionarPacienteDaLista(paciente)}>
                    <div className="font-medium">{paciente.nome} {paciente.sobrenome || ''}</div>
                    <div className="text-sm text-gray-600">CPF: {paciente.cpf || 'Não informado'}</div>
                  </div>
                )) : (
                  <div className="p-2 text-sm text-gray-500">Nenhum paciente encontrado.</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm font-medium">
          {pacienteSelecionadoId ? `Paciente selecionado: ${searchTerm}` : "Ou digite o nome do novo paciente acima para pré-cadastro."}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="data-modal">Data</Label>
            <Input id="data-modal" type="date" value={dataAgendamento} onChange={(e) => setDataAgendamento(e.target.value)} min={new Date().toISOString().split('T')[0]} readOnly/>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="hora-modal">Hora</Label>
            <Input id="hora-modal" type="time" value={horaAgendamento} onChange={(e) => setHoraAgendamento(e.target.value)} readOnly/>
          </div>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="duracao-modal">Duração</Label>
          <Select value={duracao} onValueChange={setDuracao}>
            <SelectTrigger id="duracao-modal"><SelectValue placeholder="Selecione a duração" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 hora e 30 min</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="observacao-modal">Observação</Label>
          <Textarea id="observacao-modal" placeholder="Digite alguma observação para o agendamento" value={observacao} onChange={(e) => setObservacao(e.target.value)} className="min-h-[80px]"/>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">{loading ? 'Agendando...' : 'Confirmar Agendamento'}</Button>
        </DialogFooter>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full"><Stethoscope className="h-6 w-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dr. Lucca Spinelli</h1>
                <p className="text-sm text-blue-600 font-medium">Endodontista</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard"><Button variant="ghost" size="sm" className="flex items-center space-x-2"><Home className="h-4 w-4" /><span>Inicio</span></Button></Link>
              <Link to="/dashboard"><Button variant="ghost" size="sm" className="flex items-center space-x-2"><ArrowLeft className="h-4 w-4" /><span>Voltar</span></Button></Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Título removido conforme solicitado */}
        </div>

        {/* Seletor de Dentista para Admin */}
        {currentUser?.perfil === 'admin' && (
          <div className="mb-6 max-w-md">
            <Label htmlFor="admin-dentista-select-agenda" className="text-sm font-medium text-gray-700">
              Visualizar Agenda do Dentista:
            </Label>
            <Select value={adminVisualizandoDentistaId} onValueChange={(value) => {
              setAdminVisualizandoDentistaId(value);
              // A alteração aqui vai disparar o useEffect no CalendarioAgendamentos para recarregar os dados.
            }}>
              <SelectTrigger id="admin-dentista-select-agenda" className="mt-1">
                <SelectValue placeholder="Selecione um dentista para ver a agenda" />
              </SelectTrigger>
              <SelectContent>
                {/* Corrigido: Usar um valor não vazio para a opção "Todos" */}
                <SelectItem value="all">Todos os Dentistas (Visão Geral)</SelectItem>
                {dentistas.filter(d => d.perfil === 'comum').map(dentista => (
                  <SelectItem key={dentista.id} value={dentista.id.toString()}>
                    {dentista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {adminVisualizandoDentistaId && adminVisualizandoDentistaId !== "all" && (
                <p className="text-sm text-gray-600 mt-2">
                    Visualizando agenda de: <strong>{dentistas.find(d => d.id.toString() === adminVisualizandoDentistaId)?.nome || ''}</strong>
                </p>
            )}
            {adminVisualizandoDentistaId === "all" && (
              <p className="text-sm text-gray-600 mt-2">
                  Visualizando agenda de: <strong>Todos os Dentistas</strong>
              </p>
            )}
          </div>
        )}

        <div><CalendarioAgendamentos
              onSlotClick={abrirModalAgendamento}
              // Passa 'null' ou um valor que o backend entenda como "todos" se 'all' for selecionado.
              // Ou modifica fetchCalendarAppointments para tratar 'all' e não enviar dentista_id.
              dentistaIdParaVisualizacao={
                currentUser?.perfil === 'admin'
                  ? (adminVisualizandoDentistaId === "all" ? "" : adminVisualizandoDentistaId)
                  : currentUser?.id
              }
            />
        </div>
      </main>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center space-x-2"><Calendar className="h-5 w-5" /><span>Novo Agendamento</span></DialogTitle></DialogHeader>
          <AgendamentoForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const getInicioDaSemana = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getDiasDaSemana = (startDate) => {
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    week.push(d);
  }
  return week;
};

const HORARIOS_DO_DIA = (() => {
  const horarios = [];
  for (let h = 7; h <= 18; h++) { // Das 07:00 às 18:00
    horarios.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 18) horarios.push(`${String(h).padStart(2, '0')}:30`);
  }
  return horarios;
})();

const updateAppointmentOnBackend = async (id, newDate, newTime, durationMinutes, patientId, observacao) => {
  const token = localStorage.getItem("token");
  try {
    // Removido /api/ assumindo que API_URL já contém /api
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      body: JSON.stringify({ appointment_date: newDate, appointment_time: newTime, duration_minutes: durationMinutes, patient_id: patientId, observacao: observacao }),
    });
    const result = await response.json();
    if (result.success) {
      toast.success('Agendamento atualizado!');
      return true;
    } else {
      toast.error(`Erro: ${result.message}`);
      return false;
    }
  } catch (error) {
    toast.error('Erro de conexão.');
    return false;
  }
};

const AppointmentCard = React.forwardRef(
  ({ agendamento, isDragging, navigate, excluirAgendamento, onAppointmentUpdate, isOverlay }, ref) => {
    if (!agendamento) return null;
    const isPastDateFn = (dateString) => {
        if (!dateString) return false; const today = new Date(); today.setHours(0,0,0,0);
        const parts = dateString.split('-').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return false;
        const d = new Date(parts[0], parts[1]-1, parts[2]); d.setHours(0,0,0,0); return d < today;
    };
    const appointmentIsPast = isPastDateFn(agendamento.appointment_date);
    const slotHeightPx = 32; // h-8 (2rem = 32px)
    const initialHeightPx = (agendamento.duration_minutes / 30) * slotHeightPx;
    const [resizableHeight, setResizableHeight] = useState(initialHeightPx);

    useEffect(() => { setResizableHeight((agendamento.duration_minutes / 30) * slotHeightPx); }, [agendamento.duration_minutes, slotHeightPx]);

    const handleButtonAction = (e, actionFn) => { e.stopPropagation(); actionFn(); };
    const onResize = (event, { size }) => { event.stopPropagation(); setResizableHeight(size.height); };
    const onResizeStop = async (event, { size }) => {
      event.stopPropagation();
      const numSlots = Math.max(1, Math.round(size.height / slotHeightPx));
      const newDurationMinutes = numSlots * 30;
      setResizableHeight(numSlots * slotHeightPx);
      if (newDurationMinutes !== agendamento.duration_minutes) {
        onAppointmentUpdate(agendamento.id, { duration_minutes: newDurationMinutes });
      }
    };

    const coreContent = (
      <div style={{ height: '100%', opacity: isDragging && !isOverlay ? 0.5 : 1 }} className="w-full h-full flex flex-col justify-between items-start overflow-hidden p-1">
        <div>
          <div className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${agendamento.patient_is_fully_registered === false ? 'bg-red-600' : 'bg-blue-600'} flex-shrink-0`}></span>
            <span className="font-semibold truncate text-sm text-gray-800">{agendamento.patient_name}</span>
          </div>
          <div className="text-xs text-gray-600 pl-3">
            {agendamento.appointment_time?.substring(0,5)} - {new Date(new Date(`1970-01-01T${agendamento.appointment_time || "00:00"}`).getTime() + agendamento.duration_minutes * 60000).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', hour12: false})}
          </div>
        </div>
        {agendamento.observacao && <div className="text-xs text-gray-500 mt-0.5 truncate w-full pl-3" title={agendamento.observacao}>Obs: {agendamento.observacao}</div>}
        {!(isDragging || isOverlay) && !appointmentIsPast && (
          <div className="absolute top-0.5 right-0.5 flex flex-col space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0.5 hover:bg-blue-100 rounded-sm" title="Editar" onClick={(e) => handleButtonAction(e, () => navigate(`/agendamentos/editar/${agendamento.id}`))}><Edit className="h-3 w-3 text-blue-700" /></Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0.5 hover:bg-red-100 rounded-sm" title="Excluir" onClick={(e) => handleButtonAction(e, () => excluirAgendamento(agendamento.id))}><Trash2 className="h-3 w-3 text-red-700" /></Button>
          </div>
        )}
      </div>
    );

    if (isOverlay) {
      return (
        <div ref={ref} style={{ height: `${initialHeightPx}px`, opacity: 0.75 }} className={`w-full rounded border-2 group text-xs flex items-center space-x-1.5 overflow-hidden bg-white shadow-2xl ${agendamento.patient_is_fully_registered === false ? 'border-red-500' : 'border-blue-500'}`}>
          <div className="w-full h-full flex items-center space-x-1.5 overflow-hidden p-1">
            <span className={`w-2 h-2 rounded-full ${agendamento.patient_is_fully_registered === false ? 'bg-red-600' : 'bg-blue-600'} flex-shrink-0`}></span>
            <span className="font-semibold truncate text-sm text-gray-800">{agendamento.patient_name}</span>
          </div>
        </div>
      );
    }
    return <ResizableBox height={resizableHeight} width={Infinity} onResize={onResize} onResizeStop={onResizeStop} draggableOpts={{ enableUserSelectHack: false }} minConstraints={[Infinity, slotHeightPx]} maxConstraints={[Infinity, slotHeightPx * 8]} axis={appointmentIsPast ? "none" : "s"} className={`w-full h-full rounded border group text-xs flex items-center space-x-1.5 overflow-hidden bg-white ${isDragging ? 'shadow-lg' : 'hover:bg-gray-50'} ${agendamento.patient_is_fully_registered === false ? 'border-red-400 bg-red-50' : 'border-blue-400 bg-blue-50'} ${appointmentIsPast ? 'opacity-60 cursor-not-allowed' : ''}`} handle={appointmentIsPast ? null : <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-slate-400 hover:bg-slate-500 opacity-50 group-hover:opacity-100 cursor-s-resize rounded-t-sm z-30" onPointerDown={(e) => e.stopPropagation()} />}>{coreContent}</ResizableBox>;
  }
);

const DraggableAppointmentItem = ({ agendamento, navigate, excluirAgendamento, onAppointmentUpdate }) => {
  const isPastDateFn = (d) => { if(!d) return false; const t = new Date(); t.setHours(0,0,0,0); const p = d.split('-').map(Number); if(p.length!==3||p.some(isNaN)) return false; const a = new Date(p[0],p[1]-1,p[2]); a.setHours(0,0,0,0); return a < t;};
  const appointmentIsPast = isPastDateFn(agendamento.appointment_date);
  const { attributes, listeners, setNodeRef, transform, active } = useDraggable({ id: `appointment_${agendamento.id}`, disabled: appointmentIsPast, data: { type: 'appointment', appointmentData: agendamento }});
  const isBeingDragged = active?.id === `appointment_${agendamento.id}`;
  const style = { transform: CSS.Translate.toString(transform), visibility: isBeingDragged ? 'hidden' : 'visible', position: 'absolute', left: '0.125rem', right: '0.125rem', top: '0px', zIndex: isBeingDragged ? 1001 : (appointmentIsPast ? 50 : 100), cursor: appointmentIsPast ? 'not-allowed' : (isBeingDragged ? 'grabbing' : 'grab') };
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={(e) => { if (transform || active || appointmentIsPast) { e.stopPropagation(); return; } e.stopPropagation(); if (agendamento.patient_is_fully_registered === false) navigate(`/cadastro/${agendamento.patient_id}?returnUrl=/agendamentos`); else navigate(`/visualizar/${agendamento.patient_id}`);}}><AppointmentCard agendamento={agendamento} isDragging={isBeingDragged} navigate={navigate} excluirAgendamento={excluirAgendamento} onAppointmentUpdate={onAppointmentUpdate} /></div>;
};

const DroppableSlot = ({ id, children, className, onSlotClick, isOver }) => {
  const { setNodeRef } = useDroppable({ id: id });
  return <div ref={setNodeRef} className={`${className} ${isOver ? 'bg-green-200 opacity-70' : ''}`} onClick={onSlotClick}>{children}</div>;
};

// O componente CalendarioAgendamentos agora recebe dentistaIdParaVisualizacao
const CalendarioAgendamentos = ({ onSlotClick, dentistaIdParaVisualizacao }) => {
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [diaReferencia, setDiaReferencia] = useState(new Date());
  const [calendarLoading, setCalendarLoading] = useState(true);
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const [draggedAppointmentData, setDraggedAppointmentData] = useState(null);
  const { currentUser, token } = useOutletContext();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, {}));
  const isPastDateFn = (dStr) => { if(!dStr) return false; const t = new Date(); t.setHours(0,0,0,0); const p = dStr.split('-').map(Number); if(p.length!==3||p.some(isNaN)) return false; const d = new Date(p[0],p[1]-1,p[2]); d.setHours(0,0,0,0); return d < t; };

  const fetchCalendarAppointments = async () => {
    if (!token) { setCalendarLoading(false); return; }
    try {
      setCalendarLoading(true);
      // Removido /api/ assumindo que API_URL já contém /api
      let url = `${API_URL}/appointments`;
      const params = new URLSearchParams();

      if (currentUser?.perfil === 'admin') {
        // dentistaIdParaVisualizacao pode ser um ID numérico ou uma string vazia "" (para "todos" vindo do seletor)
        if (dentistaIdParaVisualizacao && dentistaIdParaVisualizacao !== "") {
          params.append('dentista_id', dentistaIdParaVisualizacao);
        }
        // Se dentistaIdParaVisualizacao for "" (string vazia), não adiciona o parâmetro 'dentista_id'.
        // O backend já foi ajustado para retornar todos os agendamentos se for admin e nenhum dentista_id for fornecido.
      } else if (currentUser?.perfil === 'comum') {
        // Para usuário comum, sempre filtra pela sua própria ID.
        // O backend já faz isso se nenhum dentista_id é passado e o perfil não é admin,
        // mas podemos ser explícitos ou confiar na lógica do backend que já modificamos.
        // A rota /api/appointments já foi ajustada para isso.
        // Não é mais necessário /api/appointments/dentista/${currentUser.id}
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, { headers: { "x-access-token": token } });
      const data = await response.json();
      if (response.ok && data.success) {
        setCalendarAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } else {
        setCalendarAppointments([]);
        toast.error(data.message || `Falha ao carregar agendamentos (${response.statusText})`);
      }
    } catch (error) {
      setCalendarAppointments([]);
      toast.error("Erro de conexão ao carregar agendamentos.");
    } finally {
      setCalendarLoading(false);
    }
  };

  // Atualiza o calendário quando o dentistaIdParaVisualizacao (para admins) ou o usuário logado mudar.
  useEffect(() => {
    fetchCalendarAppointments();
  }, [diaReferencia, currentUser, token, dentistaIdParaVisualizacao]);

  const handleDragStart = (event) => { setActiveId(event.active.id); if(event.active.data.current?.appointmentData) setDraggedAppointmentData(event.active.data.current.appointmentData); };
  const handleDragEnd = async (event) => {
    setActiveId(null); setDraggedAppointmentData(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const draggedId = parseInt(active.id.toString().replace('appointment_', ''), 10);
      const [newDateStr, newTimeStr] = over.id.toString().split('_');
      if (isPastDateFn(newDateStr)) { toast.error("Não mover para datas passadas."); return; }
      const originalApp = calendarAppointments.find(app => app.id === draggedId);
      if (!originalApp) { toast.error("Agendamento original não encontrado."); return; }
      const oldApps = [...calendarAppointments];
      setCalendarAppointments(prev => prev.map(app => app.id === draggedId ? { ...app, appointment_date: newDateStr, appointment_time: newTimeStr } : app));
      const success = await updateAppointmentOnBackend(draggedId, newDateStr, newTimeStr, originalApp.duration_minutes, originalApp.patient_id, originalApp.observacao);
      if (!success) setCalendarAppointments(oldApps); else fetchCalendarAppointments(); // Re-fetch for consistency if backend changes more data
    }
  };

  const [currentOverSlot, setCurrentOverSlot] = useState(null);
  const calendarGridRef = React.useRef(null);
  const [lastAutoScrollTime, setLastAutoScrollTime] = useState(0);
  const AUTO_SCROLL_COOLDOWN = 700;

  const handleDragMove = (event) => {
    const { active, over } = event; setCurrentOverSlot(over ? over.id : null);
    if (!active || !active.id.startsWith('appointment_') || !calendarGridRef.current || !event.active.rect.current.translated) return;
    const now = Date.now(); if (now - lastAutoScrollTime < AUTO_SCROLL_COOLDOWN) return;
    const calRect = calendarGridRef.current.getBoundingClientRect();
    const itemRect = event.active.rect.current.translated;
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const scrollZone = 80;
    if (itemCenterX < calRect.left + scrollZone) { semanaAnterior(); setLastAutoScrollTime(now); }
    else if (itemCenterX > calRect.right - scrollZone) { proximaSemana(); setLastAutoScrollTime(now); }
  };

  const handleAppointmentUpdate = async (id, updates) => {
    const originalApp = calendarAppointments.find(app => app.id === id);
    if (!originalApp) { toast.error("Agendamento não encontrado para atualizar."); return; }
    const oldApps = [...calendarAppointments];
    setCalendarAppointments(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
    const { appointment_date, appointment_time, duration_minutes, patient_id, observacao } = { ...originalApp, ...updates };
    const success = await updateAppointmentOnBackend(id, appointment_date, appointment_time, duration_minutes, patient_id, observacao);
    if (!success) setCalendarAppointments(oldApps); else fetchCalendarAppointments(); // Re-fetch
  };

  const agendamentosPorDiaEHora = useMemo(() => {
    const grouped = {};
    calendarAppointments.forEach(app => {
      const dateStr = app.appointment_date;
      const timeStr = app.appointment_time ? app.appointment_time.substring(0, 5) : "00:00";
      if (!grouped[dateStr]) grouped[dateStr] = {};
      if (!grouped[dateStr][timeStr]) grouped[dateStr][timeStr] = [];
      grouped[dateStr][timeStr].push(app);
      grouped[dateStr][timeStr].sort((a,b) => a.id - b.id);
    });
    return grouped;
  }, [calendarAppointments]);

  const proximaSemana = () => setDiaReferencia(prev => new Date(new Date(prev).setDate(prev.getDate() + 7)));
  const semanaAnterior = () => setDiaReferencia(prev => new Date(new Date(prev).setDate(prev.getDate() - 7)));

  const excluirAgendamento = async (id) => {
    if (window.confirm('Excluir este agendamento?')) {
      const token = localStorage.getItem("token");
      try {
        // Removido /api/ assumindo que API_URL já contém /api
        const res = await fetch(`${API_URL}/appointments/${id}`, { method: 'DELETE', headers: { "x-access-token": token }});
        if (res.ok) { toast.success('Excluído!'); fetchCalendarAppointments(); }
        else { const err = await res.json().catch(()=>({})); toast.error(`Erro: ${err.message || 'Falha ao excluir'}`); }
      } catch (e) { toast.error('Erro de conexão.'); }
    }
  };

  const diasSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const semanaAtualVisivel = getDiasDaSemana(getInicioDaSemana(diaReferencia));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragMove={handleDragMove}>
      <Card className="shadow-lg w-full flex flex-col min-h-[70vh]">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={semanaAnterior} className="text-white hover:bg-white/20">&larr; Anterior</Button>
            <CardTitle className="flex items-center space-x-2 text-lg"><Calendar className="h-5 w-5" /><span>Agenda Semanal - {diaReferencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span></CardTitle>
            <Button variant="ghost" size="sm" onClick={proximaSemana} className="text-white hover:bg-white/20">Próxima &rarr;</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col flex-1">
          <div className="flex sticky top-0 bg-gray-100 z-10 border-b border-gray-300">
            <div className="w-16 flex-shrink-0 border-r border-gray-300 bg-gray-100"></div>
            <div className="flex-1 grid grid-cols-7">
              {semanaAtualVisivel.map((dia) => (
                <div key={dia.toISOString()} className="p-2 text-center border-r border-gray-300 h-12 flex flex-col items-center justify-center bg-gray-50 last:border-r-0">
                  <span className="text-sm font-medium text-gray-700">{diasSemanaNomes[dia.getDay()]}</span>
                  <span className="text-xl font-bold text-gray-800">{dia.getDate()}</span>
                </div>
              ))}
            </div>
          </div>
          {calendarLoading ? <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center">Carregando...</div> : (
            <div className="flex flex-1 overflow-hidden">
              <div className="w-16 sticky left-0 bg-gray-50 z-10 border-r border-gray-300 flex-shrink-0 overflow-y-auto no-scrollbar"> {/* no-scrollbar se precisar */}
                {HORARIOS_DO_DIA.map(horario => <div key={horario} className="h-8 flex items-center justify-center text-xs text-gray-500 border-b border-gray-200">{horario}</div>)}
              </div>
              <div ref={calendarGridRef} className="flex-1 grid grid-cols-7 overflow-auto">
                {semanaAtualVisivel.map((dia) => (
                  <div key={dia.toISOString()} className="border-r border-gray-300 flex flex-col relative last:border-r-0">
                    {HORARIOS_DO_DIA.map(horario => {
                      const slotId = `${dia.toISOString().split('T')[0]}_${horario}`;
                      const agsNoSlot = agendamentosPorDiaEHora[dia.toISOString().split('T')[0]]?.[horario] || [];
                      const slotIsPast = isPastDateFn(dia.toISOString().split('T')[0]);
                      return (
                        <DroppableSlot key={slotId} id={slotId} className={`h-8 border-b border-gray-200 relative transition-colors ${slotIsPast && !agsNoSlot.length ? 'bg-gray-100' : 'hover:bg-blue-50'}`} onSlotClick={() => { if (!activeId && !slotIsPast) onSlotClick(dia, horario);}} isOver={currentOverSlot === slotId && activeId?.startsWith('appointment_')}>
                          {agsNoSlot.map((ag, idx) => idx === 0 && <DraggableAppointmentItem key={ag.id} agendamento={ag} navigate={navigate} excluirAgendamento={excluirAgendamento} onAppointmentUpdate={handleAppointmentUpdate} />)}
                        </DroppableSlot>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <DragOverlay dropAnimation={null}>{activeId?.startsWith('appointment_') && draggedAppointmentData && <AppointmentCard agendamento={draggedAppointmentData} isDragging={true} isOverlay={true} navigate={navigate} excluirAgendamento={excluirAgendamento} onAppointmentUpdate={handleAppointmentUpdate} />}</DragOverlay>
    </DndContext>
  );
};
