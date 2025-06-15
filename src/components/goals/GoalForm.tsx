
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceSelect } from "../common/WorkspaceSelect";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { GoalNameField } from './fields/GoalNameField';
import { GoalAmountsFields } from './fields/GoalAmountsFields';
import { GoalDateAndPriorityFields } from './fields/GoalDateAndPriorityFields';
import { GoalNoteField } from './fields/GoalNoteField';

interface GoalFormProps {
  onSuccess?: () => void;
  goal?: any;
  onCancel?: () => void;
}

export function GoalForm({ onSuccess, goal, onCancel }: GoalFormProps) {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount || '');
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal?.target_date ? new Date(goal.target_date) : undefined
  );
  const [priority, setPriority] = useState(goal?.priority || 'medium');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(goal?.note || '');

  const { toast } = useToast();
  const { user } = useAuth();
  const { current, workspaces } = useWorkspace();
  const isMobile = useIsMobile();
  
  const [workspaceId, setWorkspaceId] = useState(
    goal?.workspace_id ?? current?.id ?? (workspaces.length === 1 ? workspaces[0].id : "")
  );

  useEffect(() => {
    if (!workspaceId && current?.id) setWorkspaceId(current.id);
  }, [current?.id, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !targetAmount || !user || !workspaceId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);

    try {
      const goalData = {
        user_id: user.id,
        workspace_id: workspaceId,
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        priority,
        note: note || null
      };

      if (goal) {
        const { error } = await supabase
          .from('financial_goals')
          .update(goalData)
          .eq('id', goal.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Meta atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('financial_goals')
          .insert([goalData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Meta criada com sucesso"
        });
      }

      if (onSuccess) onSuccess();

      if (!goal) {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate(undefined);
        setPriority('medium');
        setWorkspaceId(current?.id ?? "");
        setNote('');
      }

    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar meta"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", isMobile && "px-2")}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-2 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">
            {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <WorkspaceSelect
              value={workspaceId}
              onChange={setWorkspaceId}
              label="Workspace"
              disabled={workspaces.length <= 1}
            />
            <GoalNameField name={name} setName={setName} />
            <GoalAmountsFields
              targetAmount={targetAmount}
              setTargetAmount={setTargetAmount}
              currentAmount={currentAmount}
              setCurrentAmount={setCurrentAmount}
            />
            <GoalDateAndPriorityFields
              targetDate={targetDate}
              setTargetDate={setTargetDate}
              priority={priority}
              setPriority={setPriority}
            />
            <GoalNoteField note={note} setNote={setNote} />
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="h-10">
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1 h-10">
                {loading ? 'Salvando...' : (goal ? 'Atualizar' : 'Criar Meta')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
