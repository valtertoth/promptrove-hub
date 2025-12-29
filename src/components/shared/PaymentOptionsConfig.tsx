import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, Receipt, Calendar } from 'lucide-react';

export const PAYMENT_OPTIONS = [
  {
    id: 'vista_100',
    label: 'À vista (100%)',
    description: 'Pagamento integral no ato do pedido',
    requiresProof: true,
    icon: CreditCard,
  },
  {
    id: 'vista_50_50',
    label: 'À vista (50/50%)',
    description: '50% no ato do pedido e 50% na expedição',
    requiresProof: true,
    icon: CreditCard,
  },
  {
    id: 'boleto_30d',
    label: 'Boleto 30D',
    description: 'Boleto para 30 dias após emissão da NF',
    requiresProof: false,
    icon: Receipt,
  },
  {
    id: 'boleto_30_60d',
    label: 'Boleto 30/60D',
    description: 'Boleto parcelado 30/60 dias após NF',
    requiresProof: false,
    icon: Calendar,
  },
  {
    id: 'boleto_30_60_90d',
    label: 'Boleto 30/60/90D',
    description: 'Boleto parcelado 30/60/90 dias após NF',
    requiresProof: false,
    icon: Calendar,
  },
];

interface PaymentOptionsConfigProps {
  selectedOptions: string[];
  onOptionsChange: (options: string[]) => void;
  readonly?: boolean;
}

export const PaymentOptionsConfig = ({
  selectedOptions,
  onOptionsChange,
  readonly = false,
}: PaymentOptionsConfigProps) => {
  const handleToggle = (optionId: string) => {
    if (readonly) return;
    
    if (selectedOptions.includes(optionId)) {
      onOptionsChange(selectedOptions.filter((id) => id !== optionId));
    } else {
      onOptionsChange([...selectedOptions, optionId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Opções de Pagamento
        </CardTitle>
        <CardDescription>
          Selecione quais formas de pagamento você aceita
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PAYMENT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                selectedOptions.includes(option.id)
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-muted/30 border-transparent'
              } ${readonly ? '' : 'cursor-pointer hover:bg-muted/50'}`}
              onClick={() => handleToggle(option.id)}
            >
              <Checkbox
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                disabled={readonly}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <div className="flex-1">
                <Label
                  htmlFor={option.id}
                  className="font-medium cursor-pointer flex items-center gap-2"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                {option.requiresProof && (
                  <span className="text-xs text-amber-600 mt-1 inline-block">
                    Requer comprovante de pagamento
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const getPaymentOptionById = (id: string) => {
  return PAYMENT_OPTIONS.find((opt) => opt.id === id);
};
