import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PAYMENT_OPTIONS, getPaymentOptionById } from './PaymentOptionsConfig';
import { Upload, Loader2, Check, CreditCard, FileText, AlertCircle } from 'lucide-react';

interface PaymentStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoId: string;
  pedidoNumero: string;
  availableOptions: string[];
  onSuccess: () => void;
  mode: 'select' | 'confirm';
  currentPaymentType?: string | null;
  currentProofUrl?: string | null;
}

export const PaymentStepDialog = ({
  open,
  onOpenChange,
  pedidoId,
  pedidoNumero,
  availableOptions,
  onSuccess,
  mode,
  currentPaymentType,
  currentProofUrl,
}: PaymentStepDialogProps) => {
  const [selectedPayment, setSelectedPayment] = useState<string>(currentPaymentType || '');
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(currentProofUrl || null);
  const [saving, setSaving] = useState(false);

  const filteredOptions = PAYMENT_OPTIONS.filter((opt) =>
    availableOptions.includes(opt.id)
  );

  const selectedOption = getPaymentOptionById(selectedPayment);
  const requiresProof = selectedOption?.requiresProof ?? false;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `comprovante-${pedidoId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('comprovantes').getPublicUrl(fileName);
      setProofUrl(data.publicUrl);
      
      toast({
        title: 'Comprovante enviado',
        description: 'O arquivo foi carregado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSavePaymentSelection = async () => {
    if (!selectedPayment) {
      toast({
        title: 'Selecione uma opção',
        description: 'Escolha uma forma de pagamento.',
        variant: 'destructive',
      });
      return;
    }

    if (requiresProof && !proofUrl) {
      toast({
        title: 'Comprovante necessário',
        description: 'Envie o comprovante de pagamento.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          tipo_pagamento: selectedPayment,
          comprovante_pagamento_url: proofUrl,
        })
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: 'Pagamento registrado',
        description: 'A forma de pagamento foi salva com sucesso.',
        className: 'bg-emerald-600 text-white',
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          etapa_pagamento: new Date().toISOString(),
          status: 'em_producao',
        })
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: 'Pagamento confirmado',
        description: 'O pedido avançou para fabricação.',
        className: 'bg-emerald-600 text-white',
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {mode === 'select' ? 'Escolher Forma de Pagamento' : 'Confirmar Pagamento'}
          </DialogTitle>
          <DialogDescription>
            Pedido {pedidoNumero}
          </DialogDescription>
        </DialogHeader>

        {mode === 'select' ? (
          <div className="space-y-6">
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {filteredOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                      selectedPayment === option.id
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/30 border-transparent hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPayment(option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="font-medium flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Upload de comprovante se necessário */}
            {requiresProof && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        Comprovante de pagamento necessário
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Envie o comprovante para validar o pagamento
                      </p>
                      
                      <div className="mt-4">
                        {proofUrl ? (
                          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-emerald-700">Comprovante enviado</span>
                            <a 
                              href={proofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline ml-auto"
                            >
                              Ver arquivo
                            </a>
                          </div>
                        ) : (
                          <Label
                            htmlFor="proof-upload"
                            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-100/50 transition-colors"
                          >
                            {uploading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                            ) : (
                              <>
                                <Upload className="h-5 w-5 text-amber-600" />
                                <span className="text-sm text-amber-700">
                                  Clique para enviar comprovante
                                </span>
                              </>
                            )}
                          </Label>
                        )}
                        <Input
                          id="proof-upload"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleUpload}
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentPaymentType && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Forma de pagamento</p>
                      <p className="font-medium">{getPaymentOptionById(currentPaymentType)?.label}</p>
                    </div>
                    {currentProofUrl && (
                      <a
                        href={currentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Ver comprovante
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            <p className="text-sm text-muted-foreground">
              Ao confirmar o pagamento, o pedido avançará para a etapa de fabricação.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={mode === 'select' ? handleSavePaymentSelection : handleConfirmPayment}
            disabled={saving || (mode === 'select' && (!selectedPayment || (requiresProof && !proofUrl)))}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {mode === 'select' ? 'Confirmar Pagamento' : 'Validar Pagamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
