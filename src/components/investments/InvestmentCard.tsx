
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { InvestmentForm } from "./InvestmentForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number;
  purchase_date: string;
}

interface InvestmentCardProps {
  investment: Investment;
  cat: { label: string; bg: string; text: string };
  editingInvestment: Investment | null;
  setEditingInvestment: (inv: Investment | null) => void;
  deleteInvestment: (id: string) => void;
  fetchInvestments: () => void;
}

export function InvestmentCard({
  investment,
  cat,
  editingInvestment,
  setEditingInvestment,
  deleteInvestment,
  fetchInvestments
}: InvestmentCardProps) {
  return (
    <Card
      key={investment.id}
      className="group border-none hover:ring-2 hover:ring-[#003f5c]/30 transition-all shadow-[0_4px_24px_0_rgba(0,63,92,0.13)] bg-gradient-to-tr from-[#f4f4f4] via-white to-[#eaf6ee]"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-[#003f5c] font-display">{investment.name}</CardTitle>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm mt-1
                ${cat.bg} ${cat.text} font-display`}
            >
              {cat.label}
            </div>
          </div>
          <div className="flex gap-1">
            <Dialog open={!!editingInvestment && editingInvestment.id === investment.id} onOpenChange={(open) => !open && setEditingInvestment(null)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Editar investimento"
                  onClick={() => setEditingInvestment(investment)}
                  className="hover:bg-[#f8961e]/20 hover:text-[#f8961e]"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#f4f4f4] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-[#003f5c] font-display">Editar Investimento</DialogTitle>
                </DialogHeader>
                {editingInvestment && editingInvestment.id === investment.id && (
                  <InvestmentForm
                    investment={editingInvestment}
                    onSuccess={() => {
                      setEditingInvestment(null);
                      fetchInvestments();
                    }}
                    onCancel={() => setEditingInvestment(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Excluir investimento"
              onClick={() => deleteInvestment(investment.id)}
              className="hover:bg-[#d62828]/20"
            >
              <Trash2 className="w-4 h-4 text-[#d62828]" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-[#2b2b2b]">Valor Investido</span>
          <span className="font-bold text-[#003f5c]">
            R$ {investment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {investment.expected_return && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#2b2b2b]">Retorno Esperado</span>
            <div className="flex items-center gap-1">
              {investment.expected_return > 0 ? (
                <TrendingUp className="w-4 h-4 text-[#2f9e44]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#d62828]" />
              )}
              <span className={`font-bold ${investment.expected_return > 0 ? 'text-[#2f9e44]' : 'text-[#d62828]'}`}>
                {investment.expected_return}%
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sm text-[#2b2b2b]">Data da Compra</span>
          <span className="text-sm text-[#2b2b2b] font-mono">
            {format(new Date(investment.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
