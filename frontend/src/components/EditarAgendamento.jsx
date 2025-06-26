import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, ArrowLeft, Save, Calendar as CalendarIcon, Home } from 'lucide-react'; // Renomeado Calendar para CalendarIcon
import API_URL from '../lib/api';

const EditarAgendamento = () => {
  const navigate = useNavigate();
  const { idAgendamento } = useParams();

  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '', // Apenas para exibição, não será enviado na atualização se não for editável
    appointment_date: '',
    appointment_time: '',
    duration_minutes: '30', // Default string para o Select
    observacao: ''
  });

  const [originalPatientId, setOriginalPatientId] = useState(''); // Para enviar o ID original do paciente
  const [loading, setLoading] = useState(false); // Loading da submissão do formulário
  const [isFetching, setIsFetching] = useState(true); // Loading inicial dos dados do agendamento
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'

  // Futuramente, se for permitir mudar o paciente do agendamento:
  // const [pacientes, setPacientes] = useState([]); 

  // useEffect para buscar os dados do agendamento ao carregar o componente
  useEffect(() => {
    const fetchAgendamentoData = async () => {
      if (!idAgendamento) {
        setMessage('ID do agendamento não fornecido.');
        setMessageType('error');
        setIsFetching(false);
        return;
      }
      setIsFetching(true);
      setMessage('');
      try {
        const response = await fetch(`${API_URL}/api/appointments/${idAgendamento}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Erro ao buscar dados do agendamento.' }));
          throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        setFormData({
          patient_id: data.patient_id,
          patient_name: data.patient_name, // Para exibição
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          duration_minutes: String(data.duration_minutes || '30'), // Garantir que seja string para o Select
          observacao: data.observacao || ''
        });
        setOriginalPatientId(data.patient_id); // Guardar o ID original do paciente
      } catch (err) {
        setMessage(err.message || 'Erro de conexão com o servidor ao buscar agendamento.');
        setMessageType('error');
      } finally {
        setIsFetching(false);
      }
    };

    fetchAgendamentoData();
  }, [idAgendamento]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validar se data e hora foram preenchidas (campos obrigatórios para agendamento)
    if (!formData.appointment_date || !formData.appointment_time) {
      setMessage('Data e Hora são obrigatórios.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const payload = {
      patient_id: originalPatientId, // Usar o ID original do paciente, não permitir alteração por este form
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      duration_minutes: parseInt(formData.duration_minutes, 10),
      observacao: formData.observacao,
    };

    try {
      const response = await fetch(`${API_URL}/api/appointments/${idAgendamento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Agendamento atualizado com sucesso!');
        setMessageType('success');
        // Opcional: redirecionar ou atualizar dados se necessário
        // navigate('/caminho-do-calendario'); 
      } else {
        setMessage(result.message || 'Erro ao atualizar agendamento.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.message || 'Erro de conexão com o servidor.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do agendamento...</p>
        </div>
      </div>
    );
  }

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
              <Link to="/dashboard"> {/* Ou para a tela de agendamentos/calendário */}
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Button>
              </Link>
               <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center space-x-2"> {/* Botão Voltar Genérico */}
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Editar Agendamento</h2>
          <p className="text-gray-600">Modifique os detalhes do agendamento abaixo.</p>
        </div>

        {message && (
          <Alert className={`mb-6 ${messageType === 'success' ? 'border-green-500 bg-green-50 text-green-700' : messageType === 'error' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700'}`}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Detalhes do Agendamento</span>
              </CardTitle>
              <CardDescription>
                Paciente: <span className="font-semibold">{formData.patient_name || 'Carregando...'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="appointment_date">Data</Label>
                <Input
                  type="date"
                  id="appointment_date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  // min={new Date().toISOString().split('T')[0]} // Removido 'min' para edição
                />
              </div>

              <div>
                <Label htmlFor="appointment_time">Hora</Label>
                <Select 
                  name="appointment_time" 
                  value={formData.appointment_time} 
                  onValueChange={(value) => handleSelectChange('appointment_time', value)}
                >
                  <SelectTrigger id="appointment_time">
                    <SelectValue placeholder="Selecione a hora" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom">
                    {/* Gerar horários de 07:00 a 18:30 */}
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

              <div>
                <Label htmlFor="duration_minutes">Duração</Label>
                <Select 
                  name="duration_minutes" 
                  value={formData.duration_minutes} 
                  onValueChange={(value) => handleSelectChange('duration_minutes', value)}
                >
                  <SelectTrigger id="duration_minutes">
                    <SelectValue placeholder="Selecione a duracao" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom">
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora e 30 min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    {/* Adicionar mais opções se necessário */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleInputChange}
                  placeholder="Observações adicionais sobre o agendamento"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}> {/* Navega para a página anterior */}
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default EditarAgendamento;
