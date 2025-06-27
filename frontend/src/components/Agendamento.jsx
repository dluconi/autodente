import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Stethoscope, ArrowLeft, Calendar as CalendarIcon, Search, Home } from 'lucide-react'; // Renomeado Calendar para CalendarIcon
import API_URL from '../lib/api';

// Helper para converter duração em minutos para string HH:mm
const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Helper para calcular data final
const calculateEndDate = (startDate, startTime, durationMinutes) => {
  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
  return endDateTime;
};


const Agendamento = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');

  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState(null); // Para armazenar dados do evento clicado/arrastado
  const [dataSelecionada, setDataSelecionada] = useState(''); // Data para o modal
  const [horaSelecionada, setHoraSelecionada] = useState(''); // Hora para o modal
  const [duracao, setDuracao] = useState('30'); // Duração em minutos
  const [observacao, setObservacao] = useState('');

  const [loading, setLoading] = useState(false);
  const [showBuscaPaciente, setShowBuscaPaciente] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Carregar pacientes
  useEffect(() => {
    fetch(`${API_URL}/api/patients`)
      .then(response => response.json())
      .then(data => {
        setPacientes(data);
        setPacientesFiltrados(data);
      })
      .catch(error => console.error('Erro ao carregar pacientes:', error));
  }, []);

  // Filtrar pacientes
  useEffect(() => {
    if (buscaPaciente.trim() === '') {
      setPacientesFiltrados(pacientes);
    } else {
      const filtrados = pacientes.filter(p =>
        p.nome.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
        p.sobrenome?.toLowerCase().includes(buscaPaciente.toLowerCase()) ||
        p.cpf?.includes(buscaPaciente)
      );
      setPacientesFiltrados(filtrados);
    }
  }, [buscaPaciente, pacientes]);

  // Carregar agendamentos para o FullCalendar
  const fetchCalendarAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/appointments`);
      const data = await response.json();
      const formattedEvents = data.map(app => ({
        id: app.id.toString(),
        title: app.patient_name,
        start: `${app.appointment_date}T${app.appointment_time}`,
        end: calculateEndDate(app.appointment_date, app.appointment_time, app.duration_minutes).toISOString(),
        extendedProps: {
          patientId: app.patient_id,
          isFullyRegistered: app.patient_is_fully_registered,
          observacao: app.observacao,
          durationMinutes: app.duration_minutes,
        }
      }));
      setCalendarEvents(formattedEvents);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  useEffect(() => {
    fetchCalendarAppointments();
  }, []);


  const handleDateClick = (arg) => {
    setDataSelecionada(arg.dateStr.split('T')[0]);
    setHoraSelecionada(arg.dateStr.split('T')[1]?.substring(0, 5) || '09:00'); // Default se não houver hora
    setDuracao('30');
    setObservacao('');
    setPacienteSelecionado('');
    setBuscaPaciente('');
    setAgendamentoParaEditar(null); // Certificar que é um novo agendamento
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    // Navegar para visualização ou cadastro
     if (clickInfo.event.extendedProps.isFullyRegistered === false) {
        navigate(`/cadastro/${clickInfo.event.extendedProps.patientId}`);
      } else {
        navigate(`/visualizar/${clickInfo.event.extendedProps.patientId}`);
      }
  };

  const handleEventDrop = async (dropInfo) => {
    const { event, oldEvent, delta } = dropInfo;
    const newStart = event.start;
    const newEnd = event.end;

    if (!newStart) {
        console.error("Drop event has no start date", dropInfo);
        dropInfo.revert();
        return;
    }

    const newDate = newStart.toISOString().split('T')[0];
    const newTime = newStart.toTimeString().substring(0,5);

    // Calcular nova duração se o evento foi apenas arrastado (sem redimensionar explicitamente)
    // Se newEnd não estiver disponível ou for igual a newStart (improvável para timeGrid),
    // usamos a duração original.
    let newDurationMinutes = event.extendedProps.durationMinutes;
    if (newEnd) {
        const diffMs = newEnd.getTime() - newStart.getTime();
        newDurationMinutes = Math.round(diffMs / 60000);
    }


    const updatedAppointment = {
      appointment_date: newDate,
      appointment_time: newTime,
      duration_minutes: newDurationMinutes,
      // patient_id e patient_name não mudam ao arrastar/soltar
      // observacao também não muda
    };

    try {
      const response = await fetch(`${API_URL}/api/appointments/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAppointment),
      });
      if (!response.ok) throw new Error('Falha ao atualizar agendamento');
      await response.json();
      alert('Agendamento atualizado com sucesso!');
      fetchCalendarAppointments(); // Re-fetch para garantir consistência, FullCalendar já atualizou visualmente
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      alert('Erro ao atualizar agendamento.');
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const { event } = resizeInfo;
    const newStart = event.start;
    const newEnd = event.end;

    if (!newStart || !newEnd) {
        console.error("Resize event has no start or end date", resizeInfo);
        resizeInfo.revert();
        return;
    }

    const newDate = newStart.toISOString().split('T')[0];
    const newTime = newStart.toTimeString().substring(0,5);
    const newDurationMinutes = Math.round((newEnd.getTime() - newStart.getTime()) / 60000);

    const updatedAppointment = {
      appointment_date: newDate, // A data de início pode mudar se o resize cruzar a meia-noite, mas no timeGridWeek é menos provável.
      appointment_time: newTime,
      duration_minutes: newDurationMinutes,
    };

    try {
      const response = await fetch(`${API_URL}/api/appointments/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAppointment),
      });
      if (!response.ok) throw new Error('Falha ao redimensionar agendamento');
      await response.json();
      alert('Duração do agendamento atualizada!');
      fetchCalendarAppointments();
    } catch (error) {
      console.error('Erro ao redimensionar agendamento:', error);
      alert('Erro ao redimensionar agendamento.');
      resizeInfo.revert();
    }
  };


  const handleAgendarOuAtualizar = async () => {
    if (!pacienteSelecionado && !buscaPaciente.trim() && !agendamentoParaEditar) {
      alert('Por favor, selecione ou digite o nome do paciente.');
      return;
    }
    if (!dataSelecionada || !horaSelecionada) {
      alert('Data e hora são obrigatórias.');
      return;
    }

    setLoading(true);

    const appointmentData = {
      appointment_date: dataSelecionada,
      appointment_time: horaSelecionada,
      duration_minutes: parseInt(duracao, 10),
      observacao: observacao,
    };

    if (pacienteSelecionado) {
      const pacienteObj = pacientes.find(p => p.id.toString() === pacienteSelecionado);
      appointmentData.patient_id = parseInt(pacienteSelecionado, 10);
      appointmentData.patient_name = pacienteObj ? `${pacienteObj.nome} ${pacienteObj.sobrenome || ''}`.trim() : buscaPaciente.trim();
    } else if (buscaPaciente.trim()) {
        appointmentData.patient_name = buscaPaciente.trim();
    } else if (agendamentoParaEditar) {
        // Se editando e não mudou paciente, usa o nome existente
        appointmentData.patient_id = agendamentoParaEditar.extendedProps.patientId;
        appointmentData.patient_name = agendamentoParaEditar.title;
    }


    if (!appointmentData.patient_name && !appointmentData.patient_id) {
        alert('Nome do paciente é obrigatório.');
        setLoading(false);
        return;
    }

    const url = agendamentoParaEditar ? `${API_URL}/api/appointments/${agendamentoParaEditar.id}` : `${API_URL}/api/appointments`;
    const method = agendamentoParaEditar ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const result = await response.json();
      if (result.success || response.ok) {
        alert(`Agendamento ${agendamentoParaEditar ? 'atualizado' : 'realizado'} com sucesso!`);
        setIsModalOpen(false);
        fetchCalendarAppointments(); // Re-fetch events
        // Reset form fields
        setPacienteSelecionado('');
        setBuscaPaciente('');
        // Não resetar data/hora se for desejável manter para próximos agendamentos
        setDuracao('30');
        setObservacao('');
        setAgendamentoParaEditar(null);
      } else {
        alert(`Erro: ${result.message || 'Não foi possível salvar o agendamento.'}`);
      }
    } catch (error) {
      alert('Erro ao salvar agendamento. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const AgendamentoFormModal = () => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>{agendamentoParaEditar ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleAgendarOuAtualizar(); }}>
          <div className="grid w-full items-center gap-4 py-4">
            {/* Busca de Paciente */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="busca-paciente-modal">Paciente</Label>
              <div className="relative">
                <div className="flex">
                  <Input
                    id="busca-paciente-modal"
                    placeholder="Buscar ou digitar nome do paciente"
                    value={buscaPaciente}
                    onChange={(e) => {
                        setBuscaPaciente(e.target.value);
                        setShowBuscaPaciente(true);
                        if(e.target.value) setPacienteSelecionado('');
                    }}
                    onFocus={() => setShowBuscaPaciente(true)}
                  />
                   <Button type="button" variant="outline" size="sm" className="ml-2" onClick={() => setShowBuscaPaciente(!showBuscaPaciente)}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {showBuscaPaciente && buscaPaciente.trim() !== '' && pacientesFiltrados.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {pacientesFiltrados.map((p) => (
                      <div
                        key={p.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                        onClick={() => {
                          setPacienteSelecionado(p.id.toString());
                          setBuscaPaciente(`${p.nome} ${p.sobrenome || ''}`);
                          setShowBuscaPaciente(false);
                        }}
                      >
                        <div className="font-medium">{p.nome} {p.sobrenome || ''}</div>
                        <div className="text-sm text-gray-600">CPF: {p.cpf || 'Nao informado'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
               <p className="text-xs text-gray-500 mt-1">
                {pacienteSelecionado ? `ID Selecionado: ${pacienteSelecionado}` : (agendamentoParaEditar ? `Editando agendamento de: ${agendamentoParaEditar.title}` : 'Digite para buscar ou cadastrar novo.')}
              </p>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="data-modal">Data</Label>
                <Input id="data-modal" type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} readOnly={!!agendamentoParaEditar && !isModalOpen} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="hora-modal">Hora</Label>
                <Input id="hora-modal" type="time" value={horaSelecionada} onChange={(e) => setHoraSelecionada(e.target.value)} readOnly={!!agendamentoParaEditar && !isModalOpen} />
              </div>
            </div>

            {/* Duração */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="duracao-modal">Duração</Label>
              <Select value={duracao} onValueChange={setDuracao}>
                <SelectTrigger id="duracao-modal"><SelectValue placeholder="Duração" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1 hora e 30 min</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observação */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="observacao-modal">Observação</Label>
              <Textarea id="observacao-modal" placeholder="Observações adicionais" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Salvando...' : (agendamentoParaEditar ? 'Atualizar Agendamento' : 'Confirmar Agendamento')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Custom event rendering
  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1 overflow-hidden h-full">
        <b className="block text-xs truncate">{eventInfo.timeText}</b>
        <i className="block text-sm truncate">{eventInfo.event.title}</i>
        {eventInfo.event.extendedProps.observacao && (
          <p className="text-xs truncate italic">{eventInfo.event.extendedProps.observacao}</p>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Dr. Lucca Spinelli</h1>
                <p className="text-xs text-blue-600 font-medium">Endodontista</p>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs">
                  <Home className="h-3 w-3" />
                  <span>Início</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs">
                  <ArrowLeft className="h-3 w-3" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Agenda de Consultas</h2>
          <p className="text-sm text-gray-600">Arraste para mover, redimensione pela borda inferior, ou clique em um horário vago.</p>
        </div>
        
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow-xl">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale="pt-br" // Português Brasil
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            buttonText={{
                today:    'Hoje',
                week:     'Semana',
                day:      'Dia',
            }}
            allDaySlot={false} // Remover slot "o dia todo"
            slotMinTime="07:00:00" // Horário de início
            slotMaxTime="19:00:00" // Horário de término (para visualização até 18:30)
            slotDuration="00:30:00" // Intervalos de 30 minutos
            slotLabelInterval="01:00" // Mostrar rótulo de hora a cada 1 hora
            slotLabelFormat={{ // Formato do rótulo de hora
                hour: '2-digit',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: false,
                hour12: false
            }}
            height="auto" // Ajustar altura ao conteúdo, evita scrollbars desnecessárias
            events={calendarEvents}
            editable={true}
            selectable={true} // Permite selecionar slots
            selectMirror={true}
            dayMaxEvents={true}

            dateClick={handleDateClick} // Clique em um slot de data/hora
            eventClick={handleEventClick} // Clique em um evento existente
            eventDrop={handleEventDrop} // Evento arrastado e solto
            eventResize={handleEventResize} // Evento redimensionado
            eventContent={renderEventContent} // Customizar renderização do evento
            eventOverlap={false} // Prevent events from overlapping

            // Ajustes visuais para se assemelhar ao design anterior
            eventColor="#3b82f6" // Azul para eventos
            eventBorderColor="#2563eb"
            nowIndicator={true}

            // Forçar a primeira dia da semana para Domingo (0) ou Segunda (1)
            firstDay={0} // Domingo como primeiro dia
             // Título da view semanal mais conciso
            weekends={true} // Mostrar fins de semana
          />
        </div>
      </main>
      <AgendamentoFormModal />
    </div>
  );
};


// Componente do Calendario foi substituído pelo FullCalendar integrado diretamente.
// As funções helper getInicioDaSemana, getDiasDaSemana e HORARIOS_DO_DIA não são mais necessárias.

export default Agendamento;
