import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface SugestaoTipo {
  id: string;
  nome_sugerido: string;
  descricao: string | null;
  status: string | null;
  mensagem_admin: string | null;
  created_at: string | null;
  fabrica: {
    nome: string;
  };
}

interface SugestaoCampo {
  id: string;
  nome_campo: string;
  valor_sugerido: string;
  descricao: string | null;
  status: string | null;
  mensagem_admin: string | null;
  created_at: string | null;
  fabrica: {
    nome: string;
  };
  tipos_produto: {
    nome: string;
  };
}

export default function SugestoesManager() {
  const [sugestoesTipo, setSugestoesTipo] = useState<SugestaoTipo[]>([]);
  const [sugestoesCampo, setSugestoesCampo] = useState<SugestaoCampo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagensAdmin, setMensagensAdmin] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSugestoes();
  }, []);

  const fetchSugestoes = async () => {
    try {
      const [tipoResult, campoResult] = await Promise.all([
        supabase
          .from('sugestoes_tipo_produto')
          .select('*, fabrica:fabrica_id(nome)')
          .order('created_at', { ascending: false }),
        supabase
          .from('sugestoes_campo_produto')
          .select('*, fabrica:fabrica_id(nome), tipos_produto:tipo_produto_id(nome)')
          .order('created_at', { ascending: false })
      ]);

      if (tipoResult.error) throw tipoResult.error;
      if (campoResult.error) throw campoResult.error;

      setSugestoesTipo(tipoResult.data || []);
      setSugestoesCampo(campoResult.data || []);
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as sugestões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const aprovarTipo = async (sugestao: SugestaoTipo) => {
    try {
      // Inserir novo tipo de produto
      const { error: insertError } = await supabase
        .from('tipos_produto')
        .insert({
          nome: sugestao.nome_sugerido,
          descricao: sugestao.descricao,
          ativo: true,
        });

      if (insertError) throw insertError;

      // Atualizar status da sugestão
      const { error: updateError } = await supabase
        .from('sugestoes_tipo_produto')
        .update({
          status: 'aprovado',
          mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão aprovada e tipo de produto criado.',
        })
        .eq('id', sugestao.id);

      if (updateError) throw updateError;

      toast({
        title: 'Sugestão aprovada',
        description: `O tipo "${sugestao.nome_sugerido}" foi adicionado ao sistema.`,
      });

      fetchSugestoes();
    } catch (error: any) {
      console.error('Error approving suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a sugestão.',
        variant: 'destructive',
      });
    }
  };

  const rejeitarTipo = async (sugestao: SugestaoTipo) => {
    try {
      const { error } = await supabase
        .from('sugestoes_tipo_produto')
        .update({
          status: 'rejeitado',
          mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão rejeitada.',
        })
        .eq('id', sugestao.id);

      if (error) throw error;

      toast({
        title: 'Sugestão rejeitada',
        description: 'A fábrica será notificada sobre a rejeição.',
      });

      fetchSugestoes();
    } catch (error: any) {
      console.error('Error rejecting suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a sugestão.',
        variant: 'destructive',
      });
    }
  };

  const aprovarCampo = async (sugestao: SugestaoCampo) => {
    try {
      if (sugestao.nome_campo === 'ambiente') {
        // Inserir novo ambiente
        const { error: insertError } = await supabase
          .from('ambientes')
          .insert({
            nome: sugestao.valor_sugerido,
            descricao: sugestao.descricao,
            ativo: true,
          });

        if (insertError) throw insertError;
      }

      // Atualizar status da sugestão
      const { error: updateError } = await supabase
        .from('sugestoes_campo_produto')
        .update({
          status: 'aprovado',
          mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão aprovada e campo adicionado.',
        })
        .eq('id', sugestao.id);

      if (updateError) throw updateError;

      toast({
        title: 'Sugestão aprovada',
        description: `O ${sugestao.nome_campo} "${sugestao.valor_sugerido}" foi adicionado ao sistema.`,
      });

      fetchSugestoes();
    } catch (error: any) {
      console.error('Error approving field suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a sugestão.',
        variant: 'destructive',
      });
    }
  };

  const rejeitarCampo = async (sugestao: SugestaoCampo) => {
    try {
      const { error } = await supabase
        .from('sugestoes_campo_produto')
        .update({
          status: 'rejeitado',
          mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão rejeitada.',
        })
        .eq('id', sugestao.id);

      if (error) throw error;

      toast({
        title: 'Sugestão rejeitada',
        description: 'A fábrica será notificada sobre a rejeição.',
      });

      fetchSugestoes();
    } catch (error: any) {
      console.error('Error rejecting field suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a sugestão.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'aprovado') {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
    }
    if (status === 'rejeitado') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  if (loading) {
    return <div className="text-center p-8">Carregando sugestões...</div>;
  }

  const sugestoesTipoPendentes = sugestoesTipo.filter(s => s.status === 'pendente' || !s.status);
  const sugestoesCampoPendentes = sugestoesCampo.filter(s => s.status === 'pendente' || !s.status);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Gerenciar Sugestões</h2>
        <p className="text-muted-foreground">Aprove ou rejeite sugestões de melhorias dos fabricantes</p>
      </div>

      <Tabs defaultValue="tipos">
        <TabsList>
          <TabsTrigger value="tipos">
            Tipos de Produto ({sugestoesTipoPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="campos">
            Campos/Ambientes ({sugestoesCampoPendentes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tipos" className="space-y-4">
          {sugestoesTipoPendentes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Nenhuma sugestão pendente</p>
              </CardContent>
            </Card>
          ) : (
            sugestoesTipoPendentes.map((sugestao) => (
              <Card key={sugestao.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{sugestao.nome_sugerido}</CardTitle>
                      <CardDescription>
                        Sugerido por: {sugestao.fabrica?.nome || 'N/A'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(sugestao.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sugestao.descricao && (
                    <div>
                      <Label>Descrição</Label>
                      <p className="text-sm text-muted-foreground">{sugestao.descricao}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`msg-${sugestao.id}`}>Mensagem para a fábrica (opcional)</Label>
                    <Textarea
                      id={`msg-${sugestao.id}`}
                      placeholder="Adicione uma mensagem explicando a decisão..."
                      value={mensagensAdmin[sugestao.id] || ''}
                      onChange={(e) => setMensagensAdmin({ ...mensagensAdmin, [sugestao.id]: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => aprovarTipo(sugestao)} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar e Criar
                    </Button>
                    <Button onClick={() => rejeitarTipo(sugestao)} variant="destructive" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="campos" className="space-y-4">
          {sugestoesCampoPendentes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Nenhuma sugestão pendente</p>
              </CardContent>
            </Card>
          ) : (
            sugestoesCampoPendentes.map((sugestao) => (
              <Card key={sugestao.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{sugestao.valor_sugerido}</CardTitle>
                      <CardDescription>
                        Campo: {sugestao.nome_campo} | Tipo: {sugestao.tipos_produto?.nome || 'N/A'} | Por: {sugestao.fabrica?.nome || 'N/A'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(sugestao.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sugestao.descricao && (
                    <div>
                      <Label>Descrição</Label>
                      <p className="text-sm text-muted-foreground">{sugestao.descricao}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`msg-${sugestao.id}`}>Mensagem para a fábrica (opcional)</Label>
                    <Textarea
                      id={`msg-${sugestao.id}`}
                      placeholder="Adicione uma mensagem explicando a decisão..."
                      value={mensagensAdmin[sugestao.id] || ''}
                      onChange={(e) => setMensagensAdmin({ ...mensagensAdmin, [sugestao.id]: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => aprovarCampo(sugestao)} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar e Criar
                    </Button>
                    <Button onClick={() => rejeitarCampo(sugestao)} variant="destructive" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
