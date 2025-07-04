import React, { useState, useEffect, useMemo } from 'react'; // Importado useMemo
import { Link, useNavigate } from 'react-router-dom'; 
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea'; // Importar Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, ArrowLeft, Calendar, Search, Home, Trash2, Edit, Eye } from 'lucide-react'; // Adicionado Edit e Eye
import API_URL from '../lib/api';

const Agendamento = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('30'); // Novo estado para duracao, em minutos
  const [observacao, setObservacao] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [showBusca, setShowBusca] = useState(false);
  // A função carregarAgendamentos e o estado de agendamentos agora estão dentro de CalendarioAgendamentos

  useEffect(() => {
    // Carregar lista de pacientes
    fetch(`${API_URL}/patients`)
      .then(response => response.json())
      .then(data => {
        setPacientes(data);
        setPacientesFiltrados(data);
      })
      .catch(error => console.error('Erro ao carregar pacientes:', error));
    // A chamada para carregarAgendamentos foi removida daqui, pois CalendarioAgendamentos cuida disso.
  }, []);

  useEffect(() => {
    // Filtrar pacientes baseado na busca
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
    if (!pacienteSelecionado) {
      alert('Por favor, selecione um paciente.');
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
      duration_minutes: parseInt(duracao, 10) // Adicionar duracao
    };

    if (pacienteSelecionado) { // ID do paciente selecionado da busca
      const pacienteObj = pacientes.find(p => p.id.toString() === pacienteSelecionado);
      agendamentoData.patient_id = parseInt(pacienteSelecionado, 10);
      agendamentoData.patient_name = pacienteObj ? `${pacienteObj.nome} ${pacienteObj.sobrenome || ''}`.trim() : buscaPaciente; // Nome para referÃªncia, backend usarÃ¡ ID
    } else { // Novo paciente ou nome digitado manualmente
      agendamentoData.patient_name = buscaPaciente.trim();
    }
    
    // ValidaÃ§Ã£o adicional para nome do paciente
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
        // Limpar formulÃ¡rio
        setPacienteSelecionado('');
        setData('');
        setHora('');
        setDuracao('30'); // Resetar duracao para o padrão
        setObservacao(''); // Limpar observacao
        setBuscaPaciente('');
        setShowBusca(false);
        // A chamada a carregarAgendamentos() que existia aqui foi corretamente removida na ação anterior.
        // Se o erro persistir, ele deve estar em outro local ou a remoção anterior não foi efetiva.
        // Esta linha é apenas para garantir que não há uma chamada aqui.
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
    if (e.target.value) {
      setPacienteSelecionado('');
    }
  };

  const selecionarPacienteBusca = (paciente) => {
    setPacienteSelecionado(paciente.id.toString());
    setBuscaPaciente(`${paciente.nome} ${paciente.sobrenome || ''}`);
    setShowBusca(false);
  };

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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Agendamento</h2>
          <p className="text-gray-600">Agende consultas para pacientes existentes ou faca pre-cadastro</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel de Agendamento */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="bg-purple-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Novo Agendamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleAgendar(); }}>
                  <div className="grid w-full items-center gap-6">
                    
                    {/* Busca de Paciente */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="busca-paciente">Buscar Paciente Existente</Label>
                      <div className="relative">
                        <div className="flex">
                          <Input
                            id="busca-paciente"
                            placeholder="Digite o nome ou CPF do paciente"
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
                        
                        {/* Lista de resultados da busca */}
                        {showBusca && buscaPaciente.trim() !== '' && pacientesFiltrados.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                      Selecione um paciente existente para agendar
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="data">Data</Label>
                        <Input
                          id="data"
                          type="date"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="hora">Hora</Label>
                        <Select value={hora} onValueChange={setHora}>
                          <SelectTrigger id="hora">
                            <SelectValue placeholder="Selecione a hora" />
                          </SelectTrigger>
                          <SelectContent 
                            position="popper" 
                            side="bottom" 
                            sideOffset={5} 
                            align="center"
                            // avoidCollisions={false} // Descomente para testar se a prevencao de colisao esta causando o flip
                          >
                            {/* Gera horários de 07:00 a 18:30 */}
                            {Array.from({ length: ((18 - 7) * 2) + 1 }, (_, i) => { 
                              const totalMinutes = (7 * 60) + (i * 30);
                              const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
                              const minutes = String(totalMinutes % 60).padStart(2, '0');
                              return `${hours}:${minutes}`;
                            }).map(timeValue => (
                              <SelectItem key={timeValue} value={timeValue}>
                                {timeValue}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campo Duracao */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="duracao">Duracao</Label>
                        <Select value={duracao} onValueChange={setDuracao}>
                          <SelectTrigger id="duracao">
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

                      {/* Campo Observacao */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="observacao">Observacao</Label>
                        <Textarea
                          id="observacao"
                          placeholder="Digite alguma observacao para o agendamento"
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          className="min-h-[100px]" // Tornar o campo mais largo (altura)
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? 'Agendando...' : 'Agendar Consulta'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Calendario de Agendamentos */}
          <div className="lg:col-span-2">
            <CalendarioAgendamentos />
          </div>
        </div>
      </main>
    </div>
  );
};

// Funções helper para manipulação de datas da semana
const getInicioDaSemana = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = d.getDate() - day; // Ajusta para o domingo
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

// Gera horários de 07:00 a 18:30 em intervalos de 30 minutos
const HORARIOS_DO_DIA = (() => {
  const horarios = [];
  // De 7:00 (420 min) a 18:30 (1110 min). Total de 11.5 horas = 23 slots. Loop de i = 0 até 22.
  for (let i = 0; i < 24; i++) { // (18.5 - 7) * 2 = 11.5 * 2 = 23 slots
    const totalMinutes = (7 * 60) + (i * 30);
    if (totalMinutes > (18 * 60 + 30)) break; // Não passar de 18:30

    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    horarios.push(`${hours}:${minutes}`);
  }
  return horarios;
})();

// Componente do Calendario
  const CalendarioAgendamentos = () => {
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [diaReferencia, setDiaReferencia] = useState(new Date()); // Renomeado de mesAtual para clareza com a lógica semanal
  const [calendarLoading, setCalendarLoading] = useState(true);
  const navigate = useNavigate(); 

  const agendamentosPorDiaEHora = useMemo(() => {
    const grouped = {};
    if (!calendarAppointments || calendarAppointments.length === 0) {
      return grouped;
    }
    calendarAppointments.forEach(app => {
      const dateStr = app.appointment_date; 
      const timeStr = app.appointment_time.substring(0, 5);

      if (!grouped[dateStr]) {
        grouped[dateStr] = {};
      }
      if (!grouped[dateStr][timeStr]) {
        grouped[dateStr][timeStr] = [];
      }
      grouped[dateStr][timeStr].push(app);
      grouped[dateStr][timeStr].sort((a, b) => a.id - b.id); // Ordena por ID se houver múltiplos no mesmo slot
    });
    return grouped;
  }, [calendarAppointments]);

  const calcularHorarioTermino = (horaInicioString, duracaoEmMinutos) => {
    if (!horaInicioString || typeof duracaoEmMinutos !== 'number' || duracaoEmMinutos < 0) {
      return ''; // Retorna string vazia se os dados forem inválidos
    }
    const [horas, minutos] = horaInicioString.split(':').map(Number);
    const totalMinutosInicio = horas * 60 + minutos;
    const totalMinutosTermino = totalMinutosInicio + duracaoEmMinutos;

    const horasTermino = Math.floor(totalMinutosTermino / 60) % 24; // Considera virada do dia, embora incomum para agendamentos
    const minutosTermino = totalMinutosTermino % 60;

    return `${String(horasTermino).padStart(2, '0')}:${String(minutosTermino).padStart(2, '0')}`;
  };

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

  // useEffect para buscar agendamentos quando diaReferencia (semana) muda
  useEffect(() => {
    fetchCalendarAppointments();
  }, [diaReferencia]);

  const fetchCalendarAppointments = async () => {
    try {
      setCalendarLoading(true);
      // Simular carregamento de agendamentos
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

  const excluirAgendamento = async (agendamentoId) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        const response = await fetch(`${API_URL}/appointments/${agendamentoId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Agendamento excluido com sucesso!');
          fetchCalendarAppointments(); // Recarregar a lista
        } else {
          alert('Erro ao excluir agendamento');
        }
      } catch (error) {
        alert('Erro de conexao com o servidor');
        console.error('Erro:', error);
      }
    }
  };
  
  // Funções getDiasDoMes, proximoMes, mesAnterior, formatarMes e getAgendamentosParaDiaEspecifico foram removidas 
  // pois a lógica de exibição agora é por semana e os agendamentos são acessados via agendamentosPorDiaEHora.

  const diasDaSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const semanaAtualVisivel = getDiasDaSemana(getInicioDaSemana(diaReferencia));

  const formatarTituloSemana = (semana) => {
    const inicio = semana[0];
    const fim = semana[6];
    const options = { month: 'short', day: 'numeric' };
    const inicioStr = inicio.toLocaleDateString('pt-BR', options);
    const fimStr = fim.toLocaleDateString('pt-BR', options);
    if (inicio.getFullYear() !== fim.getFullYear()) {
      return `${inicioStr}, ${inicio.getFullYear()} - ${fimStr}, ${fim.getFullYear()}`;
    } else if (inicio.getMonth() !== fim.getMonth()) {
      return `${inicioStr} - ${fimStr}, ${fim.getFullYear()}`;
    } else {
      return `${inicio.toLocaleDateString('pt-BR', {day: 'numeric'})} - ${fimStr}, ${fim.getFullYear()}`;
    }
  };


  return (
    <Card className="shadow-lg w-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={semanaAnterior}
            className="text-white hover:bg-white/20"
          >
            &larr; Anterior
          </Button>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="h-5 w-5" />
            {/* O título dinâmico da semana foi removido conforme solicitado */}
            {/* Pode-se adicionar um título estático como "Agenda Semanal" se desejado */}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={proximaSemana}
            className="text-white hover:bg-white/20"
          >
            Próxima &rarr;
          </Button>
        </div>
      </CardHeader>
      {/* CardContent agora será flex-col para gerenciar o cabeçalho e o corpo da grade */}
      <CardContent className="p-0 flex flex-col flex-1"> 
        {/* Linha do Cabeçalho dos Dias (com placeholder para régua) */}
        <div className="flex sticky top-0 bg-gray-50 z-10 border-b"> {/* Container do cabeçalho inteiro */}
          <div className="w-16 flex-shrink-0 border-r border-gray-300 bg-gray-50"></div> {/* Célula vazia acima da régua, com mesma cor de fundo e borda */}
          <div className="flex-1 grid grid-cols-7"> 
            {semanaAtualVisivel.map((dia, index) => (
              <div key={index} className="p-2 text-center border-r h-10 flex items-center justify-center"> {/* Mantém h-10 para altura do cabeçalho do dia */}
                <span className="text-lg font-medium">{dia.getDate()}</span>
                <span className="text-xs text-gray-600 ml-1">- {diasDaSemanaNomes[dia.getDay()]}</span>
              </div>
            ))}
          </div>
        </div>

        {calendarLoading ? (
          <div className="p-8 text-center text-gray-500 flex-1"> {/* flex-1 para ocupar espaço se carregando */}
            Carregando agendamentos...
          </div>
        ) : (
          // Área principal do calendário (régua de tempo + colunas dos dias)
          <div className="flex flex-1 overflow-y-auto overflow-x-hidden"> {/* Alterado para overflow-y-auto overflow-x-hidden */}
            {/* Régua de Tempo */}
            <div className="w-16 sticky left-0 bg-gray-50 z-20 border-r border-gray-300 flex-shrink-0">
              {HORARIOS_DO_DIA.map(horario => (
                <div key={horario} className="h-8 flex items-center justify-start px-2 text-xs text-gray-600 border-b border-gray-200">
                  {horario}
                </div>
              ))}
            </div>

            {/* Container para as colunas dos dias */}
            <div className="flex-1 grid grid-cols-7"> {/* flex-1 para ocupar o espaço restante */}
              {semanaAtualVisivel.map((dia, indexDia) => (
                <div key={indexDia} className="border-r border-gray-300 flex flex-col"> {/* Removido min-w-[180px] */}
                  {HORARIOS_DO_DIA.map(horario => (
                    <div 
                      key={`${dia.toISOString()}-${horario}`} 
                      className="h-8 border-b border-gray-200 relative" // Altura do slot: h-8 (32px)
                    >
                      {agendamentosPorDiaEHora[dia.toISOString().split('T')[0]] && agendamentosPorDiaEHora[dia.toISOString().split('T')[0]][horario] &&
                        agendamentosPorDiaEHora[dia.toISOString().split('T')[0]][horario].map((agendamento, idxAg) => (
                          idxAg === 0 && ( // Renderiza apenas o primeiro agendamento no slot
                            <div
                              key={agendamento.id}
                              className={`absolute inset-x-0 mx-0.5 p-0.5 rounded border group cursor-pointer text-xs flex items-center space-x-1.5 overflow-hidden bg-white hover:bg-gray-50 ${
                                agendamento.patient_is_fully_registered === false
                                  ? 'border-red-400' 
                                  : 'border-blue-400' 
                              }`}
                              style={{ 
                                /* top: '1px', // Removido top para melhor alinhamento com o slot */
                                height: `calc(${agendamento.duration_minutes / 30 * 2}rem - 1px)`, 
                                zIndex: 10 
                              }}
                              onClick={() => { // onClick corrigido
                                if (agendamento.patient_is_fully_registered === false) {
                                  navigate(`/cadastro/${agendamento.patient_id}`); 
                                } else {
                                  navigate(`/visualizar/${agendamento.patient_id}`);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between w-full h-full px-0.5"> 
                                {/* Lado Esquerdo: Ponto e Nome */}
                                <div className="flex items-center space-x-1 flex-1 min-w-0"> {/* min-w-0 para truncate */}
                                  <span className={`w-2 h-2 rounded-full ${
                                    agendamento.patient_is_fully_registered === false ? 'bg-red-600' : 'bg-blue-600'
                                  } flex-shrink-0`}></span>
                                  <span className="font-medium truncate flex-1 min-w-0 text-sm text-gray-700"> {/* Adicionado flex-1 min-w-0 */}
                                    {agendamento.patient_name}
                                  </span>
                                </div>

                                {/* Lado Direito: Botões de Ação */}
                                <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"> {/* Adicionado flex-shrink-0 */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-green-100 rounded-sm" // Reduzido para h-4 w-4
                                    title="Visualizar paciente"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/visualizar/${agendamento.patient_id}`);
                                    }}
                                  >
                                    <Eye className="h-2.5 w-2.5 text-green-700" /> {/* Reduzido para h-2.5 w-2.5 */}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-blue-100 rounded-sm" // Reduzido para h-4 w-4
                                    title="Editar agendamento"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/agendamentos/editar/${agendamento.id}`);
                                    }}
                                  >
                                    <Edit className="h-2.5 w-2.5 text-blue-700" /> {/* Reduzido para h-2.5 w-2.5 */}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-red-100 rounded-sm" // Reduzido para h-4 w-4
                                    title="Excluir agendamento"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      excluirAgendamento(agendamento.id);
                                    }}
                                  >
                                    <Trash2 className="h-2.5 w-2.5 text-red-700" /> {/* Reduzido para h-2.5 w-2.5 */}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        ))
                      }
                    </div>
                  ))}
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
