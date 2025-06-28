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
import { CSS } from '@dnd-kit/utilities'; // Revertido para utilities
import { ResizableBox } from 'react-resizable';
// CSS for react-resizable is now imported in main.jsx
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'; // Importar Dialog
import { Stethoscope, ArrowLeft, Calendar, Search, Home, Trash2, Edit } from 'lucide-react';
import API_URL from '../lib/api';

// Helper function to check if a date string (YYYY-MM-DD) is in the past
const isPastDate = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dateString.split('-').map(Number);
  // Ensure parts are valid before creating a date
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    console.warn("Invalid date string provided to isPastDate:", dateString);
    return false;
  }
  const appointmentDate = new Date(parts[0], parts[1] - 1, parts[2]);
  appointmentDate.setHours(0, 0, 0, 0);

  return appointmentDate < today;
};

const Agendamento = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('30');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBusca, setShowBusca] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

  // Efeito para carregar pacientes
  useEffect(() => {
    fetch(`${API_URL}/patients`)
      .then(response => response.json())
      .then(data => {
        setPacientes(data);
        setPacientesFiltrados(data);
      })
      .catch(error => console.error('Erro ao carregar pacientes:', error));
  }, []);

  // Efeito para filtrar pacientes
  useEffect(() => {
    if (buscaPaciente.trim() === '') {
      setPacientesFiltrados(pacientes);
    } else {
      const filtrados = pacientes.filter(paciente =>
        paciente.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
        paciente.sobrenome?.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
        paciente.cpf?.includes(buscaPaciente)
      );
      setPacientesFiltrados(filtrados);
    }
  }, [buscaPaciente, pacientes]);

  const handleAgendar = async () => {
    if (!pacienteSelecionado && !buscaPaciente.trim()) { // Permitir agendar sem paciente selecionado se nome foi digitado
      alert('Por favor, selecione ou digite o nome do paciente.');
      return;
    }

    if (!data || !hora) {
      alert('Por favor, preencha a data e hora do agendamento.');
      return;
    }

    setLoading(true);

    let agendamentoData = {
      appointment_date: data,
      appointment_time: hora,
      observacao: observacao,
      duration_minutes: parseInt(duracao, 10)
    };

    if (pacienteSelecionado) {
      const pacienteObj = pacientes.find(p => p.id.toString() === pacienteSelecionado);
      agendamentoData.patient_id = parseInt(pacienteSelecionado, 10);
      agendamentoData.patient_name = pacienteObj ? `${pacienteObj.nome} ${pacienteObj.sobrenome || ''}`.trim() : buscaPaciente;
    } else {
      agendamentoData.patient_name = buscaPaciente.trim(); // Usar o nome digitado se nenhum paciente foi selecionado
    }
    
    if (!agendamentoData.patient_name && !agendamentoData.patient_id) {
        alert('Por favor, selecione ou digite o nome do paciente.');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamentoData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Agendamento realizado com sucesso!');
        setPacienteSelecionado('');
        // setData(''); // Não limpar data e hora para permitir agendamentos sequenciais no mesmo slot
        // setHora('');
        setDuracao('30');
        setObservacao('');
        setBuscaPaciente('');
        setShowBusca(false);
        setIsModalOpen(false); // Fechar modal após agendamento
        // Atualizar calendário (a lógica de atualização do calendário deve ser chamada aqui se existir)
        // Ex: fetchCalendarAppointments(); // Supondo que CalendarioAgendamentos exponha ou receba essa função
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (error) {
      alert('Erro ao realizar agendamento. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePacienteChange = (value) => {
    setPacienteSelecionado(value);
    if (value) {
      const paciente = pacientes.find(p => p.id.toString() === value);
      setBuscaPaciente(paciente ? `${paciente.nome} ${paciente.sobrenome || ''}` : '');
      setShowBusca(false);
    }
  };

  const handleBuscaChange = (e) => {
    setBuscaPaciente(e.target.value);
    setShowBusca(true);
    if (e.target.value) { // Se algo for digitado, deselecionar paciente da lista
      setPacienteSelecionado('');
    }
  };

  const selecionarPacienteBusca = (paciente) => {
    setPacienteSelecionado(paciente.id.toString());
    setBuscaPaciente(`${paciente.nome} ${paciente.sobrenome || ''}`);
    setShowBusca(false);
  };

  // Função para abrir o modal com data e hora preenchidas
  const abrirModalAgendamento = (dia, horario) => {
    setData(dia.toISOString().split('T')[0]);
    setHora(horario);
    setPacienteSelecionado(''); // Limpar seleção anterior
    setBuscaPaciente(''); // Limpar busca anterior
    setObservacao(''); // Limpar observação anterior
    setDuracao('30'); // Resetar duração
    setIsModalOpen(true);
  };

  const AgendamentoForm = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAgendar(); }}>
      <div className="grid w-full items-center gap-6">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="busca-paciente-modal">Buscar Paciente Existente</Label>
          <div className="relative">
            <div className="flex">
              <Input
                id="busca-paciente-modal"
                placeholder="Digite nome ou CPF"
                value={buscaPaciente}
                onChange={handleBuscaChange}
                onFocus={() => setShowBusca(true)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => setShowBusca(!showBusca)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {showBusca && buscaPaciente.trim() !== '' && pacientesFiltrados.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {pacientesFiltrados.map((paciente) => (
                  <div
                    key={paciente.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => selecionarPacienteBusca(paciente)}
                  >
                    <div className="font-medium">{paciente.nome} {paciente.sobrenome || ''}</div>
                    <div className="text-sm text-gray-600">CPF: {paciente.cpf || 'Nao informado'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm font-medium">
          {pacienteSelecionado ? `Paciente selecionado: ${buscaPaciente}` : "Ou digite o nome do novo paciente acima."}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="data-modal">Data</Label>
            <Input
              id="data-modal"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              readOnly // Data e hora vêm do clique no calendário
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="hora-modal">Hora</Label>
            <Input
              id="hora-modal"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              readOnly // Data e hora vêm do clique no calendário
            />
          </div>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="duracao-modal">Duracao</Label>
          <Select value={duracao} onValueChange={setDuracao}>
            <SelectTrigger id="duracao-modal">
              <SelectValue placeholder="Selecione a duracao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 hora e 30 min</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="observacao-modal">Observacao</Label>
          <Textarea
            id="observacao-modal"
            placeholder="Digite alguma observacao para o agendamento"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
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
              <div className="bg-blue-600 p-2 rounded-full">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dr. Lucca Spinelli</h1>
                <p className="text-sm text-blue-600 font-medium">Endodontista</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Agenda de Consultas</h2>
          <p className="text-gray-600">Clique em um horário vago para agendar uma nova consulta.</p>
        </div>
        
        {/* Calendario de Agendamentos ocupará toda a largura */}
        <div> {/* Removed lg:col-span-3 as main is not a grid container and this div will take full width by default */}
          <CalendarioAgendamentos onSlotClick={abrirModalAgendamento} />
        </div>
      </main>

      {/* Modal de Agendamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Novo Agendamento</span>
            </DialogTitle>
          </DialogHeader>
          <AgendamentoForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Funções helper para manipulação de datas da semana
const getInicioDaSemana = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
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
  for (let i = 0; i < 24; i++) {
    const totalMinutes = (7 * 60) + (i * 30);
    if (totalMinutes > (18 * 60 + 30)) break;
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    horarios.push(`${hours}:${minutes}`);
  }
  return horarios;
})();

// Placeholder for API call
const updateAppointmentOnBackend = async (id, newDate, newTime, durationMinutes, patientId, observacao) => {
  console.log(`Updating appointment ${id} to ${newDate} ${newTime}, duration ${durationMinutes} min`);
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_date: newDate,
        appointment_time: newTime,
        duration_minutes: durationMinutes,
        patient_id: patientId,
        observacao: observacao
      }),
    });
    const result = await response.json();
    if (result.success) {
      toast.success('Agendamento atualizado com sucesso!');
      return true;
    } else {
      toast.error(`Erro ao atualizar: ${result.message || 'Erro desconhecido'}`);
      console.error("Error updating appointment:", result.message);
      return false;
    }
  } catch (error) {
    toast.error('Erro de conexão ao atualizar agendamento.');
    console.error("Network error updating appointment:", error);
    return false;
  }
};

// New Component: AppointmentCard (for rendering the visual of an appointment)
// It will now handle resizing internally.
const AppointmentCard = React.forwardRef(
  // `style` prop from dnd-kit is no longer passed here. `...props` might contain onClick from DraggableAppointmentItem if we decide to.
  ({ agendamento, isDragging, navigate, excluirAgendamento, onAppointmentUpdate, isOverlay, ...otherProps }, ref) => {
    if (!agendamento) return null;
    const appointmentIsPast = isPastDate(agendamento.appointment_date);

    // Calculate initial height in pixels for ResizableBox
    // Assuming 1rem = 16px (common browser default)
    // h-8 for a slot = 2rem = 32px. This is one 30-min slot.
    const slotHeightPx = 32;
    const initialHeightPx = (agendamento.duration_minutes / 30) * slotHeightPx;

    const [resizableHeight, setResizableHeight] = useState(initialHeightPx);

    useEffect(() => {
      setResizableHeight((agendamento.duration_minutes / 30) * slotHeightPx);
    }, [agendamento.duration_minutes, slotHeightPx]);

    // Base style for the inner content of the card.
    // Positioning and transforms are handled by the DraggableAppointmentItem wrapper.
    // Cursor for dragging is also handled by the wrapper's listeners.
    const innerCardStyle = {
      height: '100%',
      opacity: isDragging && !isOverlay ? 0.7 : 1, // Dim original item if dragging, but not overlay
    };

    const handleButtonAction = (e, actionFn) => {
      e.stopPropagation();
      actionFn();
    };

    const onResize = (event, { size }) => {
      // While resizing, update visual height.
      // No backend call yet, only onResizeStop.
      // Prevent drag from starting if resize is active.
      event.stopPropagation();
      setResizableHeight(size.height);
    };

    const onResizeStop = async (event, { size }) => {
      event.stopPropagation();
      const newHeightPx = size.height;
      // Snap to nearest slot height (30 min increments)
      const numSlots = Math.max(1, Math.round(newHeightPx / slotHeightPx));
      const newDurationMinutes = numSlots * 30;
      const finalHeightPx = numSlots * slotHeightPx;
      setResizableHeight(finalHeightPx); // Snap visual

      if (newDurationMinutes !== agendamento.duration_minutes) {
        onAppointmentUpdate(agendamento.id, { duration_minutes: newDurationMinutes });
      }
    };

    const resizableBoxProps = {
      height: resizableHeight,
      width: Infinity, // Takes full width of parent slot normally
      onResize: onResize,
      onResizeStop: onResizeStop,
      draggableOpts: { enableUserSelectHack: false }, // Important for dnd-kit compatibility
      minConstraints: [Infinity, slotHeightPx],
      maxConstraints: [Infinity, slotHeightPx * 8],
      axis: appointmentIsPast ? "none" : "s",
      className: `w-full h-full rounded border group text-xs flex items-center space-x-1.5 overflow-hidden bg-white ${isDragging ? 'shadow-md' : 'hover:bg-gray-50'} ${
        agendamento.patient_is_fully_registered === false ? 'border-red-400' : 'border-blue-400'
      } ${appointmentIsPast ? 'opacity-75' : ''}`, // Add slight opacity for past items
      handle: appointmentIsPast ? null : <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-slate-500 opacity-50 group-hover:opacity-100 cursor-s-resize rounded-t-sm z-30" onPointerDown={(e) => e.stopPropagation()} />,
    };

    const coreContent = (
      <div
        style={innerCardStyle}
        className={`w-full h-full flex items-center space-x-1.5 overflow-hidden p-0.5`}
        // No generic onClick here for navigation. Internal button clicks are handled.
      >
        <div className="flex items-center h-full space-x-1 w-full overflow-hidden">
          <span className={`w-2 h-2 rounded-full ${
            agendamento.patient_is_fully_registered === false ? 'bg-red-600' : 'bg-blue-600'
          } flex-shrink-0`}></span>
          <span className="font-medium truncate flex-1 text-sm text-gray-700">
            {agendamento.patient_name}
          </span>
          {!(isDragging || isOverlay) && (
            <div className="absolute top-0.5 right-0.5 flex flex-col space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-blue-100 rounded-sm" title="Editar agendamento" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => handleButtonAction(e, () => navigate(`/agendamentos/editar/${agendamento.id}`))} >
                <Edit className="h-2.5 w-2.5 text-blue-700" />
              </Button>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-red-100 rounded-sm" title="Excluir agendamento" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => handleButtonAction(e, () => excluirAgendamento(agendamento.id))} >
                <Trash2 className="h-2.5 w-2.5 text-red-700" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );

    if (isOverlay) {
      // The overlay uses the `ref` (forwardedRef) from DragOverlay.
      // Its style for height is based on the original item's duration.
      // `otherProps` from DragOverlay might include transform if not using `modifiers`.
      const overlayStyle = {
         height: `${initialHeightPx}px`,
         opacity: 0.7,
         // width: '100%' // Should fill the DragOverlay's wrapper if DragOverlay applies good dimensions
      };
      // The className here is for the visual representation of the card in the overlay.
      return (
        <div
          ref={ref} // This is the ref from DragOverlay
          style={overlayStyle}
          className={`w-full rounded border group text-xs flex items-center space-x-1.5 overflow-hidden bg-white shadow-xl ${ agendamento.patient_is_fully_registered === false ? 'border-red-400' : 'border-blue-400' }`}
          // {...otherProps} // Spread otherProps from DragOverlay if any (e.g., style for position)
        >
           {/* Render a simplified version of coreContent or the full one if interactions are needed (usually not) */}
           <div className="w-full h-full flex items-center space-x-1.5 overflow-hidden p-0.5">
              <span className={`w-2 h-2 rounded-full ${ agendamento.patient_is_fully_registered === false ? 'bg-red-600' : 'bg-blue-600' } flex-shrink-0`}></span>
              <span className="font-medium truncate flex-1 text-sm text-gray-700">{agendamento.patient_name}</span>
          </div>
        </div>
      );
    }

    // For the actual draggable item, ResizableBox handles its own ref internally if needed.
    // The `ref` (forwardedRef) passed to AppointmentCard is not used by ResizableBox here.
    // `otherProps` are not spread onto ResizableBox as they are not meant for it.
    return (
      <ResizableBox {...resizableBoxProps}>
        {coreContent}
      </ResizableBox>
    );
  }
);

// New Component: DraggableAppointmentItem
const DraggableAppointmentItem = ({ agendamento, navigate, excluirAgendamento, onAppointmentUpdate }) => {
  const appointmentIsPast = isPastDate(agendamento.appointment_date);

  const { attributes, listeners, setNodeRef, transform, active } = useDraggable({
    id: `appointment_${agendamento.id}`,
    disabled: appointmentIsPast, // Disable dragging for past appointments
    data: {
      type: 'appointment',
      appointmentData: agendamento,
    }
  });

  const isBeingDragged = active?.id === `appointment_${agendamento.id}`;

  const draggableWrapperStyle = {
    transform: CSS.Translate.toString(transform),
    visibility: isBeingDragged ? 'hidden' : 'visible',
    position: 'absolute',
    left: '0.125rem',
    right: '0.125rem',
    zIndex: isBeingDragged ? 1001 : (appointmentIsPast ? 99 : 100),
    cursor: appointmentIsPast ? 'default' : (isBeingDragged ? 'grabbing' : 'grab'),
  };

  return (
    <div
      ref={setNodeRef}
      style={draggableWrapperStyle}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // This click is on the main draggable wrapper.
        // If a drag just happened (transform is not null), or if a drag is active, prevent navigation.
        // ResizableBox handles should use e.stopPropagation() on pointerdown.
        if (transform || active) {
          e.stopPropagation();
          return;
        }
        // If not dragging, proceed with navigation.
        e.stopPropagation();
        if (agendamento.patient_is_fully_registered === false) {
            navigate(`/cadastro/${agendamento.patient_id}`);
        } else {
            navigate(`/visualizar/${agendamento.patient_id}`);
        }
      }}
      // className="draggable-appointment-item" // For debugging if needed
    >
      <AppointmentCard
        agendamento={agendamento}
        isDragging={isBeingDragged} // For internal styling of AppointmentCard (e.g. opacity)
        navigate={navigate}
        excluirAgendamento={excluirAgendamento}
        onAppointmentUpdate={onAppointmentUpdate}
        // No draggable listeners or style here, they are on the parent div.
        // The AppointmentCard's own onClick for its internal buttons will still work due to event bubbling if not stopped.
        // The main navigation click is now handled by the wrapper div.
      />
    </div>
  );
};


// New Component: DroppableSlot
const DroppableSlot = ({ id, children, className, onSlotClick, isOver }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-green-200' : ''}`}
      onClick={onSlotClick}
    >
      {children}
    </div>
  );
};


// Componente do Calendario
const CalendarioAgendamentos = ({ onSlotClick }) => {
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [diaReferencia, setDiaReferencia] = useState(new Date());
  const [calendarLoading, setCalendarLoading] = useState(true);
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null); // For DndContext
  const [draggedAppointmentData, setDraggedAppointmentData] = useState(null); // For DragOverlay

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after 5px movement
      },
    }),
    useSensor(KeyboardSensor, {
      // coordinateGetter: sortableKeyboardCoordinates, // Not using sortable for now
    })
  );

  const fetchCalendarAppointments = async () => {
    try {
      setCalendarLoading(true);
      const response = await fetch(`${API_URL}/appointments`);
      const data = await response.json();
      setCalendarAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setCalendarAppointments([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarAppointments();
  }, [diaReferencia]);


  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const appointmentData = event.active.data.current?.appointmentData;
    if (appointmentData) {
      setDraggedAppointmentData(appointmentData);
    }
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    setDraggedAppointmentData(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const draggedAppointmentIdStr = active.id.toString().replace('appointment_', '');
      const draggedAppointmentId = parseInt(draggedAppointmentIdStr, 10);

      const [newDateStr, newTimeStr] = over.id.toString().split('_');

      // === New Check: Prevent dropping onto a past date ===
      if (isPastDate(newDateStr)) {
        toast.error("Não é permitido mover agendamentos para datas passadas.");
        // No UI change needed as optimistic update hasn't happened yet for the drop.
        return;
      }
      // === End of New Check ===

      const originalAppointment = calendarAppointments.find(app => app.id === draggedAppointmentId);

      if (!originalAppointment) {
        console.error("Original appointment not found:", draggedAppointmentId);
        toast.error("Erro: Agendamento original não encontrado.");
        return;
      }

      // Optimistic UI Update
      const originalAppointmentsState = [...calendarAppointments]; // Save for potential revert
      setCalendarAppointments(prevApps =>
        prevApps.map(app =>
          app.id === draggedAppointmentId
            ? { ...app, appointment_date: newDateStr, appointment_time: newTimeStr }
            : app
        )
      );

      const success = await updateAppointmentOnBackend(
        draggedAppointmentId,
        newDateStr,
        newTimeStr,
        originalAppointment.duration_minutes,
        originalAppointment.patient_id,
        originalAppointment.observacao
      );

      if (success) {
        // UI already updated optimistically, fetch to ensure consistency if backend made further changes (e.g. ID)
        // or if there are other listeners for calendarAppointments
        fetchCalendarAppointments();
      } else {
        // Revert UI
        setCalendarAppointments(originalAppointmentsState);
        // Error toast is handled by updateAppointmentOnBackend
      }
    }
  };

  const [currentOverSlot, setCurrentOverSlot] = useState(null);
  const calendarGridRef = React.useRef(null);
  const [lastAutoScrollTime, setLastAutoScrollTime] = useState(0);
  const AUTO_SCROLL_COOLDOWN = 700; // milliseconds

  const handleDragMove = (event) => {
    const { active, over } = event;

    setCurrentOverSlot(over ? over.id : null);

    if (!active || !active.id.startsWith('appointment_') || !calendarGridRef.current || !event.active.rect.current.translated) {
      return;
    }

    const now = Date.now();
    if (now - lastAutoScrollTime < AUTO_SCROLL_COOLDOWN) {
      return;
    }

    const calendarRect = calendarGridRef.current.getBoundingClientRect();
    const draggedItemRect = event.active.rect.current.translated;
    // Use the center of the dragged item for determining position relative to edges
    const draggedItemCenterX = draggedItemRect.left + draggedItemRect.width / 2;

    const scrollZoneThreshold = 60; // Pixels from edge

    if (draggedItemCenterX < calendarRect.left + scrollZoneThreshold) {
      semanaAnterior();
      setLastAutoScrollTime(now);
      // When week changes, dnd-kit might need to recalculate droppable elements.
      // This usually happens if the DOM structure changes or if explicitly told.
      // For now, relying on existing state updates to trigger re-renders.
    } else if (draggedItemCenterX > calendarRect.right - scrollZoneThreshold) {
      proximaSemana();
      setLastAutoScrollTime(now);
    }
  };

  const handleAppointmentUpdate = async (appointmentId, updates) => {
    const originalAppointment = calendarAppointments.find(app => app.id === appointmentId);
    if (!originalAppointment) {
      console.error("Cannot update, original appointment not found:", appointmentId);
      toast.error("Erro: Agendamento original não encontrado para atualização.");
      return;
    }

    // Ensure that appointment_date and appointment_time are strings if they exist in updates
    // The backend expects YYYY-MM-DD for date and HH:MM for time.
    let processedUpdates = { ...updates };
    if (processedUpdates.appointment_date && typeof processedUpdates.appointment_date !== 'string') {
        processedUpdates.appointment_date = processedUpdates.appointment_date.toISOString().split('T')[0];
    }
     if (processedUpdates.appointment_time && typeof processedUpdates.appointment_time !== 'string') {
        // This case should ideally not happen if time is always string HH:MM
        // but as a safeguard:
        console.warn("appointment_time in update was not a string, attempting conversion if it's a Date object");
        if (processedUpdates.appointment_time instanceof Date) {
             const hours = String(processedUpdates.appointment_time.getHours()).padStart(2, '0');
             const minutes = String(processedUpdates.appointment_time.getMinutes()).padStart(2, '0');
             processedUpdates.appointment_time = `${hours}:${minutes}`;
        }
    }


    const updatedAppointmentData = {
      ...originalAppointment,
      ...processedUpdates,
    };

    // Optimistic UI Update
    const originalAppointmentsState = [...calendarAppointments];
    setCalendarAppointments(prevApps =>
      prevApps.map(app =>
        app.id === appointmentId
          ? updatedAppointmentData
          : app
      )
    );

    const success = await updateAppointmentOnBackend(
      appointmentId,
      updatedAppointmentData.appointment_date,
      updatedAppointmentData.appointment_time,
      updatedAppointmentData.duration_minutes,
      updatedAppointmentData.patient_id,
      updatedAppointmentData.observacao
    );

    if (success) {
      // If the update involved changing date/time, it might affect the grouping
      // Fetching ensures the agendamentosPorDiaEHora memo re-runs with fresh, correctly grouped data
      fetchCalendarAppointments();
    } else {
      setCalendarAppointments(originalAppointmentsState); // Revert on failure
    }
  };


  const agendamentosPorDiaEHora = useMemo(() => {
    const grouped = {};
    if (!calendarAppointments || calendarAppointments.length === 0) {
      return grouped;
    }
    calendarAppointments.forEach(app => {
      const dateStr = app.appointment_date;
      const timeStr = app.appointment_time.substring(0, 5); // Ensure HH:MM format
      if (!grouped[dateStr]) grouped[dateStr] = {};
      if (!grouped[dateStr][timeStr]) grouped[dateStr][timeStr] = [];
      grouped[dateStr][timeStr].push(app);
      // Sort by ID or a specific order if multiple appointments can truly start at the exact same time visually
      // For now, assuming the first one is the primary one for display in a slot if overlap occurs.
      grouped[dateStr][timeStr].sort((a, b) => a.id - b.id);
    });
    return grouped;
  }, [calendarAppointments]);

  const proximaSemana = () => {
    setDiaReferencia(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 7);
      return newDate;
    });
  };

  const semanaAnterior = () => {
    setDiaReferencia(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 7);
      return newDate;
    });
  };

  const excluirAgendamento = async (agendamentoId) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        const response = await fetch(`${API_URL}/appointments/${agendamentoId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Agendamento excluido com sucesso!');
          fetchCalendarAppointments(); // Recarregar após exclusão
        } else {
          alert('Erro ao excluir agendamento');
        }
      } catch (error) {
        alert('Erro de conexao com o servidor');
        console.error('Erro:', error);
      }
    }
  };

  const diasDaSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const semanaAtualVisivel = getDiasDaSemana(getInicioDaSemana(diaReferencia));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove} // Changed from onDragOver
    >
      <Card className="shadow-lg w-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={semanaAnterior} className="text-white hover:bg-white/20">
              &larr; Anterior
            </Button>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calendar className="h-5 w-5" />
              <span>Agenda Semanal</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={proximaSemana} className="text-white hover:bg-white/20">
              Próxima &rarr;
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col flex-1">
          <div className="flex sticky top-0 bg-gray-50 z-10 border-b">
            <div className="w-16 flex-shrink-0 border-r border-gray-300 bg-gray-50"></div> {/* Time gutter */}
            <div className="flex-1 grid grid-cols-7">
              {semanaAtualVisivel.map((dia) => (
                <div key={dia.toISOString()} className="p-2 text-center border-r h-10 flex items-center justify-center">
                  <span className="text-lg font-medium">{dia.getDate()}</span>
                  <span className="text-xs text-gray-600 ml-1">- {diasDaSemanaNomes[dia.getDay()]}</span>
                </div>
              ))}
            </div>
          </div>

          {calendarLoading ? (
            <div className="p-8 text-center text-gray-500 flex-1">Carregando agendamentos...</div>
          ) : (
            <div className="flex flex-1 overflow-y-auto overflow-x-hidden"> {/* Main scrollable area */}
              <div className="w-16 sticky left-0 bg-gray-50 z-20 border-r border-gray-300 flex-shrink-0"> {/* Time labels */}
                {HORARIOS_DO_DIA.map(horario => (
                  <div key={horario} className="h-8 flex items-center justify-start px-2 text-xs text-gray-600 border-b border-gray-200">
                    {horario}
                  </div>
                ))}
              </div>
              <div ref={calendarGridRef} className="flex-1 grid grid-cols-7"> {/* Day columns - REF ADDED HERE */}
                {semanaAtualVisivel.map((dia) => (
                  <div key={dia.toISOString()} className="border-r border-gray-300 flex flex-col relative"> {/* Each Day Column */}
                    {HORARIOS_DO_DIA.map(horario => {
                      const slotId = `${dia.toISOString().split('T')[0]}_${horario}`;
                      const agendamentosNoSlot = agendamentosPorDiaEHora[dia.toISOString().split('T')[0]]?.[horario] || [];

                      return (
                        <DroppableSlot
                          key={slotId}
                          id={slotId}
                          className="h-8 border-b border-gray-200 relative hover:bg-blue-50 transition-colors"
                          onSlotClick={() => {
                            // Only allow creating new appointment if not currently dragging something
                            if (!activeId) {
                              onSlotClick(dia, horario);
                            }
                          }}
                          isOver={currentOverSlot === slotId && activeId?.startsWith('appointment_')}
                        >
                          {/* Render only the first appointment that STARTS in this slot */}
                          {agendamentosNoSlot.map((agendamento, idxAg) => (
                            idxAg === 0 && ( // Ensure we only try to render one draggable item per starting slot visually
                              <DraggableAppointmentItem
                                key={agendamento.id}
                                agendamento={agendamento}
                                navigate={navigate}
                                excluirAgendamento={excluirAgendamento}
                                onAppointmentUpdate={handleAppointmentUpdate}
                              />
                            )
                          ))}
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
      <DragOverlay dropAnimation={null}>
        {activeId && activeId.startsWith('appointment_') && draggedAppointmentData ? (
          <AppointmentCard
            agendamento={draggedAppointmentData}
            isDragging={true}
            isOverlay={true} // Mark that this is for the overlay
            navigate={navigate}
            excluirAgendamento={excluirAgendamento}
            onAppointmentUpdate={handleAppointmentUpdate} // Pass to overlay as well, though it won't be used for resizing
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Agendamento;
