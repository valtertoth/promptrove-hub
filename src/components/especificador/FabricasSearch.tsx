import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Building2, MapPin, Send, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FabricasSearchProps {
  especificadorId: string;
  onUpdate: () => void;
}

const FabricasSearch = ({ especificadorId, onUpdate }: FabricasSearchProps) => {
  const [fabricas, setFabricas] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFabrica, setSelectedFabrica] = useState<any>(null);
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [especificadorId]);

  const fetchData = async () => {
    try {
      const [fabricasRes, solicitacoesRes] = await Promise.all([
        supabase
          .from('fabrica')
          .select('*')
          .eq('ativo', true),
        supabase
          .from('fabrica_especificador')
          .select('fabrica_id, status')
          .eq('especificador_id', especificadorId),
      ]);

      if (fabricasRes.error) throw fabricasRes.error;
      if (solicitacoesRes.error) throw solicitacoesRes.error;

      setFabricas(fabricasRes.data || []);
      setSolicitacoes(solicitacoesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar fábricas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSolicitacaoStatus = (fabricaId: string) => {
    return solicitacoes.find((s) => s.fabrica_id === fabricaId);
  };

  const handleSolicitar = async () => {
    if (!selectedFabrica) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('fabrica_especificador')
        .insert({
          fabrica_id: selectedFabrica.id,
          especificador_id: especificadorId,
          mensagem: mensagem || null,
          status: 'pendente',
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: 'A fábrica receberá sua solicitação.',
      });

      setSelectedFabrica(null);
      setMensagem('');
      fetchData();
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const filteredFabricas = fabricas.filter((fabrica) =>
    fabrica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabrica.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fabrica.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fábricas por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredFabricas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma fábrica encontrada.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredFabricas.map((fabrica) => {
            const solicitacao = getSolicitacaoStatus(fabrica.id);

            return (
              <Card key={fabrica.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{fabrica.nome}</CardTitle>
                        {fabrica.cidade && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{fabrica.cidade}, {fabrica.estado}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {solicitacao && (
                      <Badge
                        variant={
                          solicitacao.status === 'aprovado'
                            ? 'default'
                            : solicitacao.status === 'recusado'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="gap-1"
                      >
                        {solicitacao.status === 'aprovado' && <CheckCircle2 className="h-3 w-3" />}
                        {solicitacao.status === 'pendente' && <Clock className="h-3 w-3" />}
                        {solicitacao.status === 'recusado' && <XCircle className="h-3 w-3" />}
                        {solicitacao.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {fabrica.descricao && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {fabrica.descricao}
                    </p>
                  )}

                  {!solicitacao ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedFabrica(fabrica)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Solicitar Acesso
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Solicitar Acesso a {fabrica.nome}</DialogTitle>
                          <DialogDescription>
                            Envie uma mensagem apresentando-se para a fábrica
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Olá! Sou especificador e gostaria de ter acesso aos seus produtos..."
                            rows={5}
                            value={mensagem}
                            onChange={(e) => setMensagem(e.target.value)}
                          />
                          <Button
                            onClick={handleSolicitar}
                            disabled={sending}
                            className="w-full"
                          >
                            {sending ? 'Enviando...' : 'Enviar Solicitação'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : solicitacao.status === 'aprovado' ? (
                    <Button variant="outline" className="w-full" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Acesso Aprovado
                    </Button>
                  ) : solicitacao.status === 'pendente' ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Aguardando Aprovação
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <XCircle className="h-4 w-4 mr-2" />
                      Acesso Recusado
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FabricasSearch;
