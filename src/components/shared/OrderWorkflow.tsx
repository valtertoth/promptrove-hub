import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorkflowStep {
  key: string;
  label: string;
  date: string | null;
  completed: boolean;
  current: boolean;
}

interface OrderWorkflowProps {
  pedido: {
    status: string;
    data_envio: string | null;
    etapa_pagamento?: string | null;
    etapa_fabricacao?: string | null;
    etapa_expedicao?: string | null;
    data_entrega: string | null;
  };
  className?: string;
}

const OrderWorkflow = ({ pedido, className }: OrderWorkflowProps) => {
  const steps: WorkflowStep[] = [
    {
      key: 'recebido',
      label: 'Recebido',
      date: pedido.data_envio,
      completed: !!pedido.data_envio,
      current: pedido.status === 'enviado' && !pedido.etapa_pagamento,
    },
    {
      key: 'pagamento',
      label: 'Pagamento',
      date: pedido.etapa_pagamento || null,
      completed: !!pedido.etapa_pagamento,
      current: !!pedido.data_envio && !pedido.etapa_pagamento && pedido.status !== 'rascunho',
    },
    {
      key: 'fabricacao',
      label: 'Fabricação',
      date: pedido.etapa_fabricacao || null,
      completed: !!pedido.etapa_fabricacao,
      current: !!pedido.etapa_pagamento && !pedido.etapa_fabricacao,
    },
    {
      key: 'expedicao',
      label: 'Expedição',
      date: pedido.etapa_expedicao || null,
      completed: !!pedido.etapa_expedicao,
      current: !!pedido.etapa_fabricacao && !pedido.etapa_expedicao,
    },
    {
      key: 'entrega',
      label: 'Entregue',
      date: pedido.data_entrega,
      completed: !!pedido.data_entrega,
      current: !!pedido.etapa_expedicao && !pedido.data_entrega,
    },
  ];

  // Se o status for rascunho, não mostrar o workflow
  if (pedido.status === 'rascunho') {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between relative">
        {/* Linha de conexão */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
          style={{
            width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`
          }}
        />
        
        {steps.map((step, index) => (
          <div
            key={step.key}
            className="flex flex-col items-center gap-1 relative"
          >
            {/* Ícone do step */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                step.completed 
                  ? 'bg-primary text-primary-foreground' 
                  : step.current 
                    ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400 ring-offset-2' 
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : step.current ? (
                <Clock className="h-4 w-4 animate-pulse" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>
            
            {/* Label e data */}
            <span
              className={cn(
                'text-xs font-medium text-center',
                step.completed 
                  ? 'text-primary' 
                  : step.current 
                    ? 'text-amber-700' 
                    : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
            {step.date && (
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(step.date), 'dd/MM', { locale: ptBR })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderWorkflow;
