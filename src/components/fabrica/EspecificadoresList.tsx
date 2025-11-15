import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EspecificadoresListProps {
  fabricaId: string;
}

const EspecificadoresList = ({ fabricaId }: EspecificadoresListProps) => {
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSolicitacoes();
  }, [fabricaId]);

  const fetchSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('fabrica_especificador')
        .select(`
          *,
          especificador:especificador_id (
            id,
            nome,
            email,
            tipo,
            cidade,
            estado
          )
        `)
        .eq('fabrica_id', fabricaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitacoes(data || []);
    } catch (error: any) {
      console.error('Error fetching solicitacoes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('fabrica_especificador')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: status === 'aprovado' ? 'Especificador aprovado' : 'Solicitação recusada',
        description: 'Status atualizado com sucesso!',
      });

      fetchSolicitacoes();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <p>Carregando especificadores...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Especificadores</h2>

      {solicitacoes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma solicitação de especificador ainda.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {solicitacao.especificador?.nome}
                    </h3>
                    <Badge
                      variant={
                        solicitacao.status === 'aprovado'
                          ? 'default'
                          : solicitacao.status === 'recusado'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {solicitacao.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {solicitacao.especificador?.email}
                  </p>
                  <p className="text-sm">
                    Tipo: {solicitacao.especificador?.tipo}
                  </p>
                  {solicitacao.especificador?.cidade && (
                    <p className="text-sm">
                      {solicitacao.especificador.cidade}, {solicitacao.especificador.estado}
                    </p>
                  )}
                  {solicitacao.mensagem && (
                    <p className="text-sm mt-2 p-3 bg-muted rounded">
                      {solicitacao.mensagem}
                    </p>
                  )}
                </div>

                {solicitacao.status === 'pendente' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(solicitacao.id, 'aprovado')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(solicitacao.id, 'recusado')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EspecificadoresList;
