import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea'; // Importar Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, ArrowLeft, Calendar, Search, Home, Trash2, Edit } from 'lucide-react'; // Adicionado Edit
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
                            {Array.from({ length: (23 - 6 + 1) * 2 -1 }, (_, i) => { // De 06:00 a 23:30
                              const totalMinutes = (6 * 60) + (i * 30);
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

// Componente do Calendario
  const CalendarioAgendamentos = () => {
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [calendarLoading, setCalendarLoading] = useState(true);
  const navigate = useNavigate(); // Hook para navegacao

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

  useEffect(() => {
    fetchCalendarAppointments();
  }, [mesAtual]);

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

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasDoMes = [];

    // Adicionar dias vazios do inÃ­cio
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      diasDoMes.push(null);
    }

    // Adicionar todos os dias do mÃªs
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      diasDoMes.push(new Date(ano, mes, dia));
    }

    return diasDoMes;
  };

  const getAgendamentosDoDia = (data) => {
    if (!data) return [];
    const dataStr = data.toISOString().split('T')[0];
    const agendamentosFiltrados = calendarAppointments.filter(ag => ag.appointment_date === dataStr);
    // Ordenar pelo horário (appointment_time é string "HH:MM")
    return agendamentosFiltrados.sort((a, b) => {
      if (a.appointment_time < b.appointment_time) return -1;
      if (a.appointment_time > b.appointment_time) return 1;
      return 0;
    });
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const formatarMes = (data) => {
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']; // Sabado sem acento

  return (
    <Card className="shadow-lg"> {/* Removido w-full e flex flex-col, min-h-[75vh] já tinha sido removido antes ou não estava nesta versão */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Calendario de Agendamentos</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={mesAnterior}
              className="text-white hover:bg-white/20"
            >
              &larr; {/* Seta para esquerda */}
            </Button>
            <span className="font-medium capitalize min-w-[200px] text-center">
              {formatarMes(mesAtual)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={proximoMes}
              className="text-white hover:bg-white/20"
            >
              &rarr; {/* Seta para direita */}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {calendarLoading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando agendamentos...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0">
            {/* Cabecalho dos dias da semana */}
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="p-3 text-center font-medium text-gray-700 bg-gray-50 border-b"
              >
                {dia}
              </div>
            ))}
            
            {/* Dias do mes */}
            {getDiasDoMes().map((data, index) => {
              const agendamentosDoDia = getAgendamentosDoDia(data);
              const isHoje = data && data.toDateString() === new Date().toDateString();
              const temAgendamento = agendamentosDoDia.length > 0;
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-200 ${ // Revertido min-h e padding
                    data ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
                  } ${isHoje ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  {data && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isHoje ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {data.getDate()}
                        {isHoje && (
                          <span className="ml-1 text-xs bg-blue-600 text-white px-1 rounded">
                            Hoje
                          </span>
                        )}
                      </div>
                      
                      {/* Agendamentos do dia */}
                      <div className="space-y-1">
                        {agendamentosDoDia.map((agendamento, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-1 rounded border-l-2 group relative cursor-pointer ${
                              agendamento.patient_is_fully_registered === false
                                ? 'bg-red-200 text-red-900 border-red-500 hover:bg-red-300' // Estilo mais destacado para vermelho
                                : 'bg-purple-100 text-purple-800 border-purple-400 hover:bg-purple-200'
                            }`}
                            onClick={() => {
                              if (agendamento.patient_is_fully_registered === false) {
                                navigate(`/cadastro/${agendamento.patient_id}`); 
                              } else {
                                // Navegar para a visualização do paciente se ele estiver totalmente registrado
                                navigate(`/visualizar/${agendamento.patient_id}`); // Rota corrigida para visualizar
                              }
                            }}
                          >
                            <div className="flex justify-between items-start"> {/* Removido h-full */}
                              <div className="flex-1 min-w-0"> {/* Removido flex flex-col justify-between h-full */}
                                <div className="font-medium truncate"> {/* Restaurado truncate */}
                                  {agendamento.patient_name}
                                </div>
                                {agendamento.observacao && (
                                  <div className="text-xs text-gray-500 mt-0.5 truncate" title={agendamento.observacao}> {/* Restaurado truncate, removido line-clamp-2 e break-words */}
                                    {agendamento.observacao}
                                  </div>
                                )}
                                <div className="text-purple-600 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis text-[10px]"> {/* Reduzida a fonte e restaurado overflow-hidden text-ellipsis */}
                                  {agendamento.appointment_time?.substring(0, 5)} - {calcularHorarioTermino(agendamento.appointment_time, agendamento.duration_minutes)}
                                </div>
                              </div>
                              <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity"> {/* Mantém botões de ação como estavam */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Editar agendamento"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/agendamentos/editar/${agendamento.id}`);
                                  }}
                                >
                                  <Edit className="h-3 w-3 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                  title="Excluir agendamento"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    excluirAgendamento(agendamento.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Removida a logica de "+X mais" */}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Agendamento;
