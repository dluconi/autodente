import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'; // Importar Dialog
import { Stethoscope, ArrowLeft, Calendar, Search, Home, Trash2, Edit } from 'lucide-react';
import API_URL from '../lib/api';

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
    fetch(`${API_URL}/api/patients`)
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
      const response = await fetch(`${API_URL}/api/appointments`, {
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
        <div className="lg:col-span-3"> {/* Alterado para ocupar toda a largura */}
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

// Componente do Calendario
const CalendarioAgendamentos = ({ onSlotClick }) => { // Adicionado onSlotClick como prop
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [diaReferencia, setDiaReferencia] = useState(new Date());
  const [calendarLoading, setCalendarLoading] = useState(true);
  const navigate = useNavigate();

  // Função para buscar/atualizar agendamentos, pode ser chamada após um novo agendamento
  const fetchCalendarAppointments = async () => {
    try {
      setCalendarLoading(true);
      const response = await fetch(`${API_URL}/api/appointments`);
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
  }, [diaReferencia]); // Recarregar quando a semana de referência muda


  const agendamentosPorDiaEHora = useMemo(() => {
    const grouped = {};
    if (!calendarAppointments || calendarAppointments.length === 0) {
      return grouped;
    }
    calendarAppointments.forEach(app => {
      const dateStr = app.appointment_date;
      const timeStr = app.appointment_time.substring(0, 5);
      if (!grouped[dateStr]) grouped[dateStr] = {};
      if (!grouped[dateStr][timeStr]) grouped[dateStr][timeStr] = [];
      grouped[dateStr][timeStr].push(app);
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
        const response = await fetch(`${API_URL}/api/appointments/${agendamentoId}`, {
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
          <div className="w-16 flex-shrink-0 border-r border-gray-300 bg-gray-50"></div>
          <div className="flex-1 grid grid-cols-7">
            {semanaAtualVisivel.map((dia, index) => (
              <div key={index} className="p-2 text-center border-r h-10 flex items-center justify-center">
                <span className="text-lg font-medium">{dia.getDate()}</span>
                <span className="text-xs text-gray-600 ml-1">- {diasDaSemanaNomes[dia.getDay()]}</span>
              </div>
            ))}
          </div>
        </div>

        {calendarLoading ? (
          <div className="p-8 text-center text-gray-500 flex-1">
            Carregando agendamentos...
          </div>
        ) : (
          <div className="flex flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-16 sticky left-0 bg-gray-50 z-20 border-r border-gray-300 flex-shrink-0">
              {HORARIOS_DO_DIA.map(horario => (
                <div key={horario} className="h-8 flex items-center justify-start px-2 text-xs text-gray-600 border-b border-gray-200">
                  {horario}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7">
              {semanaAtualVisivel.map((dia, indexDia) => (
                <div key={indexDia} className="border-r border-gray-300 flex flex-col">
                  {HORARIOS_DO_DIA.map(horario => {
                    const agendamentosNoSlot = agendamentosPorDiaEHora[dia.toISOString().split('T')[0]]?.[horario] || [];
                    return (
                      <div
                        key={`${dia.toISOString()}-${horario}`}
                        className="h-8 border-b border-gray-200 relative cursor-pointer hover:bg-blue-50 transition-colors" // Adicionado cursor e hover
                        onClick={() => onSlotClick(dia, horario)} // Chamar onSlotClick
                      >
                        {agendamentosNoSlot.map((agendamento, idxAg) => (
                          idxAg === 0 && (
                            <div
                              key={agendamento.id}
                              className={`absolute inset-x-0 mx-0.5 p-0.5 rounded border group text-xs flex items-center space-x-1.5 overflow-hidden bg-white hover:bg-gray-50 ${
                                agendamento.patient_is_fully_registered === false ? 'border-red-400' : 'border-blue-400'
                              }`}
                              style={{
                                height: `calc(${agendamento.duration_minutes / 30 * 2}rem - 1px)`,
                                zIndex: 10
                              }}
                              onClick={(e) => { // Modificado para não propagar e abrir visualização/cadastro
                                e.stopPropagation(); // Impedir que o clique no agendamento abra o modal de novo agendamento
                                if (agendamento.patient_is_fully_registered === false) {
                                  navigate(`/cadastro/${agendamento.patient_id}`);
                                } else {
                                  navigate(`/visualizar/${agendamento.patient_id}`);
                                }
                              }}
                            >
                              <div className="flex items-center h-full space-x-1 w-full overflow-hidden">
                                <span className={`w-2 h-2 rounded-full ${
                                  agendamento.patient_is_fully_registered === false ? 'bg-red-600' : 'bg-blue-600'
                                } flex-shrink-0`}></span>
                                <span className="font-medium truncate flex-1 text-sm text-gray-700">
                                  {agendamento.patient_name}
                                </span>
                                <div className="absolute top-0.5 right-0.5 flex flex-col space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-blue-100 rounded-sm"
                                    title="Editar agendamento"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/agendamentos/editar/${agendamento.id}`);
                                    }}
                                  >
                                    <Edit className="h-2.5 w-2.5 text-blue-700" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-red-100 rounded-sm"
                                    title="Excluir agendamento"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      excluirAgendamento(agendamento.id);
                                    }}
                                  >
                                    <Trash2 className="h-2.5 w-2.5 text-red-700" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Agendamento;
