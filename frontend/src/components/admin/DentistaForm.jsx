import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import API_URL from '../../lib/api';

// Esquema de validação Zod
const dentistaSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  sobrenome: z.string().min(2, { message: "Sobrenome deve ter pelo menos 2 caracteres." }),
  cro: z.string().min(3, { message: "CRO é obrigatório." }),
  especialidade: z.string().min(3, { message: "Especialidade é obrigatória." }),
  cpf: z.string().length(11, { message: "CPF deve ter 11 dígitos." }).regex(/^\d+$/, "CPF deve conter apenas números."),
  rg: z.string().min(5, { message: "RG é obrigatório." }),
  celular: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos." }).regex(/^\d+$/, "Telefone deve conter apenas números."),
  status_dentista: z.enum(['ativo', 'inativo'], { message: "Status é obrigatório." }),
});

const DentistaForm = ({ open, onOpenChange, dentista, onSubmitSuccess }) => {
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(dentistaSchema),
    defaultValues: {
      nome: '',
      sobrenome: '',
      cro: '',
      especialidade: '',
      cpf: '',
      rg: '',
      celular: '',
      status_dentista: 'ativo',
    }
  });

  useEffect(() => {
    if (dentista) {
      reset({
        nome: dentista.nome || '',
        sobrenome: dentista.sobrenome || '',
        cro: dentista.cro || '',
        especialidade: dentista.especialidade || '',
        cpf: dentista.cpf || '',
        rg: dentista.rg || '',
        celular: dentista.celular || '',
        status_dentista: dentista.status_dentista || 'ativo',
      });
    } else {
      reset({ // Valores padrão para novo dentista
        nome: '',
        sobrenome: '',
        cro: '',
        especialidade: '',
        cpf: '',
        rg: '',
        celular: '',
        status_dentista: 'ativo',
      });
    }
  }, [dentista, reset, open]); // Adicionado 'open' para resetar quando o modal abre

  const processSubmit = async (data) => {
    try {
      const url = dentista ? `${API_URL}/dentists/${dentista.id}` : `${API_URL}/dentists`;
      const method = dentista ? 'PUT' : 'POST';

      // Garantir que todos os campos do schema sejam enviados, mesmo que vazios (se permitido pelo backend)
      // ou omiti-los se o backend os tratar como opcionais e não gostar de null/undefined.
      // Para este exemplo, enviamos o que o Zod validou.
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao salvar dentista.' }));
        throw new Error(errorData.message || `Falha ao ${dentista ? 'atualizar' : 'criar'} dentista`);
      }

      toast.success(`Dentista ${dentista ? 'atualizado' : 'adicionado'} com sucesso!`);
      onSubmitSuccess(); // Chama a função para fechar modal e re-fetch lista
    } catch (error) {
      console.error("Erro ao salvar dentista:", error);
      toast.error(error.message || "Erro ao salvar dentista. Verifique os dados e tente novamente.");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{dentista ? 'Editar Dentista' : 'Adicionar Novo Dentista'}</DialogTitle>
          <DialogDescription>
            {dentista ? 'Modifique os dados do dentista abaixo.' : 'Preencha os dados para cadastrar um novo dentista.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" {...register('nome')} className={errors.nome ? 'border-red-500' : ''} />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <Label htmlFor="sobrenome">Sobrenome</Label>
              <Input id="sobrenome" {...register('sobrenome')} className={errors.sobrenome ? 'border-red-500' : ''} />
              {errors.sobrenome && <p className="text-xs text-red-500 mt-1">{errors.sobrenome.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cro">CRO</Label>
              <Input id="cro" {...register('cro')} className={errors.cro ? 'border-red-500' : ''} />
              {errors.cro && <p className="text-xs text-red-500 mt-1">{errors.cro.message}</p>}
            </div>
            <div>
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input id="especialidade" {...register('especialidade')} className={errors.especialidade ? 'border-red-500' : ''} />
              {errors.especialidade && <p className="text-xs text-red-500 mt-1">{errors.especialidade.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register('cpf')} placeholder="Apenas números" className={errors.cpf ? 'border-red-500' : ''} />
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>}
            </div>
            <div>
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" {...register('rg')} className={errors.rg ? 'border-red-500' : ''} />
              {errors.rg && <p className="text-xs text-red-500 mt-1">{errors.rg.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="celular">Telefone Celular</Label>
            <Input id="celular" {...register('celular')} placeholder="Apenas números" className={errors.celular ? 'border-red-500' : ''} />
            {errors.celular && <p className="text-xs text-red-500 mt-1">{errors.celular.message}</p>}
          </div>
          <div>
            <Label htmlFor="status_dentista">Status</Label>
            <Select
              onValueChange={(value) => reset({ ...control._formValues, status_dentista: value })}
              defaultValue={control._defaultValues.status_dentista} // Use defaultValues from control
              value={control._formValues.status_dentista} // Controlled component
            >
              <SelectTrigger id="status_dentista" className={errors.status_dentista ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            {errors.status_dentista && <p className="text-xs text-red-500 mt-1">{errors.status_dentista.message}</p>}
          </div>
          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (dentista ? 'Salvar Alterações' : 'Adicionar Dentista')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DentistaForm;
