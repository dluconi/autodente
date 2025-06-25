

import React, { useState, useEffect, useCallback } from 'react'; // Importado useCallback
import { Link, useNavigate } from 'react-router-dom'; 
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea'; // Importar Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, ArrowLeft, Calendar, Search, Home, Trash2 } from 'lucide-react';
import API_URL from '../lib/api';

const Agendamento = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [observacao, setObservacao] = useState(''); // Novo estado para observacao
  const [loading, setLoading] = useState(false);
  const [showBusca, setShowBusca] = useState(false);
  const [agendamentosGlobais, setAgendamentosGlobais] = useState([]); // Estado para agendamentos no pai

  const carregarAgendamentos = useCallback(async () => {
    console.log("carregarAgendamentos: Iniciando...");
    try {
      setLoading(true);
      console.log("carregarAgendamentos: setLoading(true)");
      const response = await fetch(`${API_URL}/api/appointments`);
      console.log("carregarAgendamentos: Fetch realizado, status:", response.status);
      if (!response.ok) {
        console.error("carregarAgendamentos: Resposta não OK", response);
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log("carregarAgendamentos: JSON parseado", data);
      setAgendamentosGlobais(data || []);
    } catch (error) {
      console.error('Erro detalhado ao carregar agendamentos:', error);
      setAgendamentosGlobais([]);
    } finally {
      console.log("carregarAgendamentos: Bloco finally, setLoading(false)");
      setLoading(false);
    }
  }, [setLoading, setAgendamentosGlobais]); // Dependências de useCallback

  useEffect(() => {
    // Carregar lista de pacientes
    fetch(`${API_URL}/api/patients`)
      .then(response => response.json())
      .then(data => {
        setPacientes(data);
        setPacientesFiltrados(data);
      })
      .catch(error => console.error('Erro ao carregar pacientes:', error));
    carregarAgendamentos(); // Carregar agendamentos ao iniciar
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
      observacao: observacao
    };

    if (pacienteSelecionado) { // ID do paciente selecionado da busca
      const pacienteObj = pacientes.find(p => p.id.toString() === pacienteSelecionado);
      agendamentoData.patient_id = parseInt(pacienteSelecionado, 10);
      agendamentoData.patient_name = pacienteObj ? `${pacienteObj.nome} ${pacienteObj.sobrenome || ''}`.trim() : buscaPaciente; // Nome para referência, backend usará ID
    } else { // Novo paciente ou nome digitado manualmente
      agendamentoData.patient_name = buscaPaciente.trim();
    }
    
    // Validação adicional para nome do paciente
    if (!agendamentoData.patient_name && !agendamentoData.patient_id) {
      alert('Por favor, selecione ou digite o nome do paciente.');
      setLoading(false);
      return;
    }

    console.log("handleAgendar: Iniciando...");
    setLoading(true);
    console.log("handleAgendar: setLoading(true)");

    try {
      console.log("handleAgendar: Enviando dados:", agendamentoData);
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamentoData),
      });
      console.log("handleAgendar: Resposta do POST recebida, status:", response.status);

      if (!response.ok) {
        console.error("handleAgendar: Resposta não OK do POST", response);
        // Tentar ler o corpo do erro como texto, pois pode não ser JSON
        const errorText = await response.text();
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("handleAgendar: JSON parseado do POST", result);

      if (result.success) {
        alert('Agendamento realizado com sucesso!');
        // Limpar formulário
        setPacienteSelecionado('');
        setData('');
        setHora('');
        setObservacao(''); // Limpar observacao
        setBuscaPaciente('');
        setShowBusca(false);
        console.log("handleAgendar: Chamando carregarAgendamentos() após sucesso.");
        await carregarAgendamentos(); // Recarregar a lista de agendamentos e esperar concluir
        console.log("handleAgendar: carregarAgendamentos() chamado.");
      } else {
        alert(`Erro: ${result.message}`);
        console.log("handleAgendar: Erro no resultado (success=false)", result.message);
      }
    } catch (error) {
      alert('Erro ao realizar agendamento. Tente novamente.');
      console.error('Erro detalhado ao realizar agendamento:', error);
    } finally {
      console.log("handleAgendar: Bloco finally, setLoading(false)");
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
                  <span>Início</span>
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
          <p className="text-gray-600">Agende consultas para pacientes existentes ou faça pré-cadastro</p>
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
                                <div className="text-sm text-gray-600">CPF: {paciente.cpf || 'Não informado'}</div>
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
                            // avoidCollisions={false} // Descomente para testar se a prevenção de colisão está causando o flip
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

                      {/* Campo Observação */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="observacao">Observação</Label>
                        <Textarea
                          id="observacao"
                          placeholder="Digite alguma observação para o agendamento"
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

          {/* Calendário de Agendamentos */}
          <div className="lg:col-span-2">
            <CalendarioAgendamentos 
              agendamentos={agendamentosGlobais} 
              loading={loading} 
              carregarAgendamentosDoPai={carregarAgendamentos} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente do Calendário
const CalendarioAgendamentos = ({ 
  agendamentos: agendamentosProps, // Renomeado para clareza
  loading: loadingProps, 
  carregarAgendamentosDoPai 
}) => {
  const [mesAtualLocal, setMesAtualLocal] = useState(new Date()); // Gerencia o mês localmente
  const navigate = useNavigate();

  useEffect(() => {
    // Quando o mês local muda, pede ao pai para recarregar os agendamentos.
    // O pai é quem filtra pelo mês correto ou busca todos e o filho filtra.
    // Assumindo que carregarAgendamentosDoPai() busca todos e o filtro ocorre no filho OU
    // que carregarAgendamentosDoPai() pode receber o mês como parâmetro.
    // Por simplicidade, vamos assumir que carregarAgendamentosDoPai() busca tudo
    // e o filtro getAgendamentosDoDia fará o trabalho.
    if(carregarAgendamentosDoPai) carregarAgendamentosDoPai();
  }, [mesAtualLocal, carregarAgendamentosDoPai]);

  const excluirAgendamento = async (agendamentoId) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        const response = await fetch(`${API_URL}/api/appointments/${agendamentoId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Agendamento excluído com sucesso!');
          if (carregarAgendamentosDoPai) {
            carregarAgendamentosDoPai(); // Chama a função de recarregar do pai
          }
        } else {
          alert('Erro ao excluir agendamento');
        }
      } catch (error) { // Adicionadas chaves aqui
        alert('Erro de conexão com o servidor');
        console.error('Erro:', error);
      }
    }
  };

  const getDiasDoMes = () => {
    const ano = mesAtualLocal.getFullYear(); // Usar estado local
    const mes = mesAtualLocal.getMonth();   // Usar estado local
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasDoMes = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      diasDoMes.push(null);
    }

    // Adicionar todos os dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      diasDoMes.push(new Date(ano, mes, dia));
    }

    return diasDoMes;
  };

  const getAgendamentosDoDia = (data) => {
    if (!data || !agendamentosProps) return []; // Usar agendamentosProps
    const dataStr = data.toISOString().split('T')[0];
    return agendamentosProps.filter(ag => ag.appointment_date === dataStr); // Usar agendamentosProps
  };

  const proximoMes = () => {
    setMesAtualLocal(new Date(mesAtualLocal.getFullYear(), mesAtualLocal.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtualLocal(new Date(mesAtualLocal.getFullYear(), mesAtualLocal.getMonth() - 1, 1));
  };

  const formatarMes = (data) => {
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className="shadow-lg min-h-[75vh] flex flex-col"> {/* Altura mínima e flex col para que o content possa crescer */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Calendário de Agendamentos</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={mesAnterior} // Usa a função local que atualiza mesAtualLocal
              className="text-white hover:bg-white/20"
            >
              ←
            </Button>
            <span className="font-medium capitalize min-w-[200px] text-center">
              {formatarMes(mesAtualLocal)} {/* Usa mesAtualLocal */}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={proximoMes} // Usa a função local que atualiza mesAtualLocal
              className="text-white hover:bg-white/20"
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow"> {/* flex-grow para ocupar espaço */}
        {loadingProps ? ( // Usar loadingProps
          <div className="p-8 text-center text-gray-500">
            Carregando agendamentos...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0 h-full"> {/* h-full para que o grid também tente ocupar espaço */}
            {/* Cabeçalho dos dias da semana */}
            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="p-3 text-center font-medium text-gray-700 bg-gray-50 border-b"
              >
                {dia}
              </div>
            ))}
            
            {/* Dias do mês */}
            {getDiasDoMes().map((data, index) => {
              const agendamentosDoDia = getAgendamentosDoDia(data);
              const isHoje = data && data.toDateString() === new Date().toDateString();
              const temAgendamento = agendamentosDoDia.length > 0;
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-200 ${
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
                                ? 'bg-red-100 text-red-800 border-red-400 hover:bg-red-200'
                                : 'bg-purple-100 text-purple-800 border-purple-400 hover:bg-purple-200'
                            }`}
                            onClick={() => {
                              if (agendamento.patient_is_fully_registered === false) {
                                navigate(`/pacientes/editar/${agendamento.patient_id}`);
                              } else {
                                // Navegar para o histórico do paciente se ele estiver totalmente registrado
                                // Certifique-se de que a rota '/pacientes/historico/:id' existe e está configurada
                                navigate(`/pacientes/historico/${agendamento.patient_id}`);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {agendamento.patient_name}
                                </div>
                                <div className="text-purple-600">
                                  {agendamento.appointment_time?.substring(0, 5)}
                                </div>
                                {agendamento.observacao && (
                                  <div className="text-xs text-gray-500 mt-0.5 truncate" title={agendamento.observacao}>
                                    {agendamento.observacao}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  excluirAgendamento(agendamento.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 hover:bg-red-200 rounded"
                                title="Excluir agendamento"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Removida a lógica de "+X mais" */}
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


