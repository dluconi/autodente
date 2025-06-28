import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Stethoscope, ArrowLeft, Save, Calculator, Plus, Trash2, Edit, Eye, Home } from 'lucide-react'
import API_URL from '../lib/api';

const Orcamento = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const [formData, setFormData] = useState({
    clinica: 'Dr. Lucca Spinelli',
    paciente: '',
    observacoes: '',
    procedimentos: []
  })

  const [currentProcedimento, setCurrentProcedimento] = useState({
    tabela: '',
    descricao: '',
    dente: '',
    valor: ''
  })

  const [paymentData, setPaymentData] = useState({
    valorTotal: 0,
    tipoPagamento: 'valor_total',
    formaPagamento: 'cartao_credito',
    parcelas: []
  })

  const [newParcela, setNewParcela] = useState({
    data: '',
    forma: 'cartao_credito',
    valor: ''
  })

  // Dados dos dentes para o odontograma
  const dentes = [
    // Dentes superiores
    { numero: 18, posicao: 'superior' }, { numero: 17, posicao: 'superior' }, { numero: 16, posicao: 'superior' }, 
    { numero: 15, posicao: 'superior' }, { numero: 14, posicao: 'superior' }, { numero: 13, posicao: 'superior' }, 
    { numero: 12, posicao: 'superior' }, { numero: 11, posicao: 'superior' }, { numero: 21, posicao: 'superior' }, 
    { numero: 22, posicao: 'superior' }, { numero: 23, posicao: 'superior' }, { numero: 24, posicao: 'superior' }, 
    { numero: 25, posicao: 'superior' }, { numero: 26, posicao: 'superior' }, { numero: 27, posicao: 'superior' }, 
    { numero: 28, posicao: 'superior' },
    // Dentes inferiores
    { numero: 48, posicao: 'inferior' }, { numero: 47, posicao: 'inferior' }, { numero: 46, posicao: 'inferior' }, 
    { numero: 45, posicao: 'inferior' }, { numero: 44, posicao: 'inferior' }, { numero: 43, posicao: 'inferior' }, 
    { numero: 42, posicao: 'inferior' }, { numero: 41, posicao: 'inferior' }, { numero: 31, posicao: 'inferior' }, 
    { numero: 32, posicao: 'inferior' }, { numero: 33, posicao: 'inferior' }, { numero: 34, posicao: 'inferior' }, 
    { numero: 35, posicao: 'inferior' }, { numero: 36, posicao: 'inferior' }, { numero: 37, posicao: 'inferior' }, 
    { numero: 38, posicao: 'inferior' }
  ]

  const tabelas = [
    'Particular Tempo Odontologia',
    'Amil',
    'Unimed',
    'Bradesco Saúde',
    'SulAmérica'
  ]

  const formasPagamento = [
    { value: 'a_definir', label: 'A Definir' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'multiplas', label: 'Múltiplas' },
    { value: 'pix', label: 'Pix' },
    { value: 'transferencia', label: 'Transferência' }
  ]

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    const total = formData.procedimentos.reduce((sum, proc) => sum + parseFloat(proc.valor || 0), 0)
    setPaymentData(prev => ({ ...prev, valorTotal: total }))
  }, [formData.procedimentos])

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients`)
      const data = await response.json()
      setPatients(data)
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProcedimentoChange = (field, value) => {
    setCurrentProcedimento(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addProcedimento = () => {
    if (currentProcedimento.tabela && currentProcedimento.descricao && currentProcedimento.valor) {
      const newProcedimento = { 
        ...currentProcedimento, 
        id: Date.now(),
        valor: parseFloat(currentProcedimento.valor) || 0
      };
      
      setFormData(prev => ({
        ...prev,
        procedimentos: [...prev.procedimentos, newProcedimento]
      }));
      
      setCurrentProcedimento({
        tabela: '',
        descricao: '',
        dente: '',
        valor: ''
      });
    } else {
      alert('Por favor, preencha todos os campos obrigatórios: tabela, descrição e valor.');
    }
  };

  const removeProcedimento = (id) => {
    setFormData(prev => ({
      ...prev,
      procedimentos: prev.procedimentos.filter(proc => proc.id !== id)
    }))
  }

  const addParcela = () => {
    if (newParcela.data && newParcela.valor) {
      setPaymentData(prev => ({
        ...prev,
        parcelas: [...prev.parcelas, { ...newParcela, id: Date.now() }]
      }))
      setNewParcela({
        data: '',
        forma: 'cartao_credito',
        valor: ''
      })
    }
  }

  const removeParcela = (id) => {
    setPaymentData(prev => ({
      ...prev,
      parcelas: prev.parcelas.filter(parcela => parcela.id !== id)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!formData.paciente) {
        setMessage('Por favor, selecione um paciente')
        setMessageType('error')
        return
      }

      if (formData.procedimentos.length === 0) {
        setMessage('Por favor, adicione pelo menos um procedimento')
        setMessageType('error')
        return
      }

      const budgetData = {
        patient_id: parseInt(formData.paciente),
        clinic_name: formData.clinica,
        observations: formData.observacoes,
        procedures: formData.procedimentos
      }

      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Orçamento salvo com sucesso!')
        setMessageType('success')
        
        // Limpar formulário
        setFormData({
          clinica: 'Dr. Lucca Spinelli',
          paciente: '',
          observacoes: '',
          procedimentos: []
        })
        setCurrentProcedimento({
          tabela: '',
          descricao: '',
          dente: '',
          valor: ''
        })
      } else {
        setMessage(result.message || 'Erro ao salvar orçamento')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Erro de conexão com o servidor')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!formData.paciente) {
      alert('Por favor, selecione um paciente primeiro')
      return
    }

    if (formData.procedimentos.length === 0) {
      alert('Por favor, adicione pelo menos um procedimento')
      return
    }

    try {
      // Primeiro salvar o orçamento
      const budgetData = {
        patient_id: parseInt(formData.paciente),
        clinic_name: formData.clinica,
        observations: formData.observacoes,
        procedures: formData.procedimentos
      }

      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      })

      const result = await response.json()

      if (result.success) {
        // Aprovar o orçamento
        const approveResponse = await fetch(`${API_URL}/budgets/${result.budget.id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const approveResult = await approveResponse.json()

        if (approveResult.success) {
          alert('Orçamento aprovado e salvo com sucesso!')
          setMessage('Orçamento aprovado e salvo com sucesso!')
          setMessageType('success')
        } else {
          alert('Orçamento salvo, mas houve erro na aprovação')
        }
      } else {
        alert('Erro ao salvar orçamento: ' + result.message)
      }
    } catch (error) {
      alert('Erro ao processar orçamento')
      console.error('Erro:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Orçamento</h2>
          <p className="text-gray-600">Crie orçamentos detalhados para seus pacientes</p>
        </div>

        {message && (
          <Alert className={`mb-6 ${messageType === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <AlertDescription className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Dados do Orçamento</span>
                  </CardTitle>
                  <CardDescription>
                    Preencha as informações do orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Clínica e Paciente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinica">Clínica</Label>
                      <Input
                        id="clinica"
                        value="Dr. Lucca Spinelli"
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paciente">Nome do Paciente</Label>
                      <Select value={formData.paciente} onValueChange={(value) => handleInputChange('paciente', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.nome} {patient.sobrenome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações sobre o orçamento"
                      rows={3}
                    />
                  </div>

                  {/* Tabela de Procedimentos */}
                  <div className="space-y-4">
                    <Label>Tabela</Label>
                    <Select 
                      value={currentProcedimento.tabela} 
                      onValueChange={(value) => handleProcedimentoChange('tabela', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a tabela" />
                      </SelectTrigger>
                      <SelectContent>
                        {tabelas.map((tabela) => (
                          <SelectItem key={tabela} value={tabela}>
                            {tabela}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Odontograma */}
                  <div className="space-y-4">
                    <Label>Dentição</Label>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-center mb-4">
                        <h4 className="font-semibold text-gray-700">Permanente</h4>
                      </div>
                      
                      {/* Dentes Superiores */}
                      <div className="grid grid-cols-8 gap-1 mb-2">
                        {dentes.filter(d => d.posicao === 'superior').map((dente) => (
                          <button
                            key={dente.numero}
                            type="button"
                            onClick={() => handleProcedimentoChange('dente', dente.numero.toString())}
                            className={`w-8 h-8 text-xs border rounded ${
                              currentProcedimento.dente === dente.numero.toString()
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                            }`}
                          >
                            {dente.numero}
                          </button>
                        ))}
                      </div>
                      
                      {/* Dentes Inferiores */}
                      <div className="grid grid-cols-8 gap-1">
                        {dentes.filter(d => d.posicao === 'inferior').map((dente) => (
                          <button
                            key={dente.numero}
                            type="button"
                            onClick={() => handleProcedimentoChange('dente', dente.numero.toString())}
                            className={`w-8 h-8 text-xs border rounded ${
                              currentProcedimento.dente === dente.numero.toString()
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                            }`}
                          >
                            {dente.numero}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Adicionar Procedimento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Dentista</Label>
                      <Select 
                        value={currentProcedimento.dentista} 
                        onValueChange={(value) => handleProcedimentoChange('dentista', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lucca">Lucca de Almeida Spinelli</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentProcedimento.valor}
                          onChange={(e) => handleProcedimentoChange('valor', e.target.value)}
                          placeholder="0,00"
                        />
                        <Button
                          type="button"
                          onClick={addProcedimento}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={currentProcedimento.descricao}
                      onChange={(e) => handleProcedimentoChange('descricao', e.target.value)}
                      placeholder="Descrição do procedimento"
                    />
                  </div>

                  {/* Lista de Procedimentos */}
                  {formData.procedimentos.length > 0 && (
                    <div className="space-y-2">
                      <Label>Procedimentos Adicionados</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descrição</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dente</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.procedimentos.map((proc) => (
                              <tr key={proc.id} className="border-t">
                                <td className="px-4 py-2 text-sm">{proc.descricao}</td>
                                <td className="px-4 py-2 text-sm">{proc.dente || '-'}</td>
                                <td className="px-4 py-2 text-sm">{formatCurrency(parseFloat(proc.valor))}</td>
                                <td className="px-4 py-2 text-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeProcedimento(proc.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPaymentForm(true)}
                      className="flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Definir Forma de Pagamento</span>
                    </Button>
                    <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Resumo do Orçamento */}
          <div>
            <Card className="shadow-lg sticky top-8">
              <CardHeader className="bg-gray-800 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span>Orçamento</span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="bg-orange-100 p-3 rounded">
                    <div className="text-sm text-orange-800">
                      <div className="flex justify-between">
                        <span>Dr. Lucca Spinelli</span>
                      </div>
                      <div className="font-semibold">
                        {patients.find(p => p.id.toString() === formData.paciente)?.nome || 'Paciente'} {patients.find(p => p.id.toString() === formData.paciente)?.sobrenome || ''}
                      </div>
                      <div className="text-xs">Arcada Completa</div>
                    </div>
                    <div className="text-right mt-2">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(paymentData.valorTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total Particular</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(paymentData.valorTotal)}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Definir Forma de Pagamento
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleApprove}
                      >
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Forma de Pagamento */}
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Forma de Pagamento</DialogTitle>
              <DialogDescription>
                Configure as opções de pagamento para este orçamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <RadioGroup 
                value={paymentData.tipoPagamento} 
                onValueChange={(value) => setPaymentData(prev => ({ ...prev, tipoPagamento: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="valor_total" id="valor_total" />
                  <Label htmlFor="valor_total">Valor Total</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="por_procedimento" id="por_procedimento" />
                  <Label htmlFor="por_procedimento">Por procedimento executado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="a_vista" id="a_vista" />
                  <Label htmlFor="a_vista">À vista</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parcelado" id="parcelado" />
                  <Label htmlFor="parcelado">Parcelado/à prazo</Label>
                </div>
              </RadioGroup>

              {paymentData.tipoPagamento === 'parcelado' && (
                <div className="space-y-4">
                  <Label>Parcelas</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Parcela</Label>
                      <Input value="À vista" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={newParcela.data}
                        onChange={(e) => setNewParcela(prev => ({ ...prev, data: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Forma</Label>
                      <Select 
                        value={newParcela.forma} 
                        onValueChange={(value) => setNewParcela(prev => ({ ...prev, forma: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formasPagamento.map((forma) => (
                            <SelectItem key={forma.value} value={forma.value}>
                              {forma.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={newParcela.valor}
                          onChange={(e) => setNewParcela(prev => ({ ...prev, valor: e.target.value }))}
                          placeholder="0,00"
                        />
                        <Button type="button" onClick={addParcela} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {paymentData.parcelas.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Parcela</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Data</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Forma</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentData.parcelas.map((parcela, index) => (
                            <tr key={parcela.id} className="border-t">
                              <td className="px-4 py-2 text-sm">À vista</td>
                              <td className="px-4 py-2 text-sm">{new Date(parcela.data).toLocaleDateString('pt-BR')}</td>
                              <td className="px-4 py-2 text-sm">
                                {formasPagamento.find(f => f.value === parcela.forma)?.label}
                              </td>
                              <td className="px-4 py-2 text-sm">{formatCurrency(parseFloat(parcela.valor))}</td>
                              <td className="px-4 py-2 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeParcela(parcela.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Fechar
                </Button>
                <Button onClick={() => setShowPaymentForm(false)}>
                  OK
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default Orcamento

