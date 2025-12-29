import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, FolderOpen, Truck, AlertCircle } from 'lucide-react';

interface Pedido {
  id: string;
  numero_pedido: string;
  cliente_nome: string;
  created_at: string;
  fabrica_id: string;
}

interface EspecificarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: {
    id: string;
    nome: string;
    fabrica_id: string;
  } | null;
}

const TIPOS_ENTREGA = [
  { value: 'transporte_normal', label: 'Transporte Normal', description: 'Transportadora entrega até o Lojista e o Lojista faz a Entrega Local' },
  { value: 'dropshipping', label: 'Dropshipping', description: 'O Fabricante envia direto para o Consumidor Final com NF do Especificador' },
];

const EspecificarDialog = ({ open, onOpenChange, produto }: EspecificarDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [especificadorId, setEspecificadorId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [hasConnection, setHasConnection] = useState(false);
  
  // Para novo pedido
  const [novoCliente, setNovoCliente] = useState('');
  
  // Para pedido existente
  const [pedidoSelecionado, setPedidoSelecionado] = useState<string>('');
  
  // Dados do item
  const [quantidade, setQuantidade] = useState('1');
  const [tipoEntrega, setTipoEntrega] = useState('transporte_normal');

  useEffect(() => {
    if (open && user && produto) {
      fetchEspecificadorAndPedidos();
    }
  }, [open, user, produto]);

  const fetchEspecificadorAndPedidos = async () => {
    if (!user || !produto) return;
    
    setLoading(true);
    try {
      // Buscar especificador do usuário
      const { data: especData, error: especError } = await supabase
        .from('especificador')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (especError) throw especError;

      if (!especData) {
        toast({
          title: 'Perfil não encontrado',
          description: 'Você precisa ter um perfil de especificador para usar esta funcionalidade.',
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      setEspecificadorId(especData.id);

      // Verificar se existe conexão aprovada com a fábrica deste produto
      const { data: connData, error: connError } = await supabase
        .from('commercial_connections')
        .select('id')
        .eq('specifier_id', especData.id)
        .eq('factory_id', produto.fabrica_id)
        .eq('status', 'approved')
        .maybeSingle();

      if (connError) throw connError;

      if (!connData) {
        setHasConnection(false);
        setConnectionId(null);
      } else {
        setHasConnection(true);
        setConnectionId(connData.id);

        // Buscar pedidos existentes do especificador para esta fábrica
        const { data: pedidosData, error: pedidosError } = await supabase
          .from('pedidos')
          .select('id, numero_pedido, cliente_nome, created_at, fabrica_id')
          .eq('especificador_id', especData.id)
          .eq('fabrica_id', produto.fabrica_id)
          .in('status', ['rascunho', 'enviado']) // Só pedidos que ainda podem receber itens
          .order('created_at', { ascending: false });

        if (pedidosError) throw pedidosError;

        setPedidos(pedidosData || []);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNovoPedido = async () => {
    if (!especificadorId || !produto || !connectionId) return;
    
    if (!novoCliente.trim()) {
      toast({
        title: 'Cliente obrigatório',
        description: 'Digite o nome do cliente para criar o pedido.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Criar novo pedido (numero_pedido é gerado automaticamente pelo trigger)
      const { data: novoPedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          cliente_nome: novoCliente.trim(),
          especificador_id: especificadorId,
          fabrica_id: produto.fabrica_id,
          connection_id: connectionId,
          tipo_entrega: tipoEntrega,
          status: 'rascunho',
          numero_pedido: 'TEMP', // Será substituído pelo trigger
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Adicionar item ao pedido
      const { error: itemError } = await supabase
        .from('itens_pedido')
        .insert({
          pedido_id: novoPedido.id,
          produto_id: produto.id,
          quantidade: parseInt(quantidade) || 1,
          preco_unitario: 0, // Será definido posteriormente
          preco_total: 0,
          observacoes: `Tipo de entrega: ${tipoEntrega}`,
        });

      if (itemError) throw itemError;

      toast({
        title: 'Produto especificado!',
        description: `"${produto.nome}" foi adicionado ao pedido ${novoPedido.numero_pedido}.`,
        className: 'bg-emerald-600 text-white',
      });

      // Limpar e fechar
      resetAndClose();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o produto.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePedidoExistente = async () => {
    if (!especificadorId || !produto || !pedidoSelecionado) {
      toast({
        title: 'Pedido não selecionado',
        description: 'Selecione um pedido existente.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Adicionar item ao pedido existente
      const { error: itemError } = await supabase
        .from('itens_pedido')
        .insert({
          pedido_id: pedidoSelecionado,
          produto_id: produto.id,
          quantidade: parseInt(quantidade) || 1,
          preco_unitario: 0,
          preco_total: 0,
          observacoes: `Tipo de entrega: ${tipoEntrega}`,
        });

      if (itemError) throw itemError;

      const pedidoNome = pedidos.find(p => p.id === pedidoSelecionado)?.numero_pedido;

      toast({
        title: 'Produto especificado!',
        description: `"${produto.nome}" foi adicionado ao pedido ${pedidoNome}.`,
        className: 'bg-emerald-600 text-white',
      });

      resetAndClose();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o produto.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setNovoCliente('');
    setPedidoSelecionado('');
    setQuantidade('1');
    setTipoEntrega('transporte_normal');
    onOpenChange(false);
  };

  if (!produto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Especificar Produto</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasConnection ? (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
            <div>
              <h3 className="font-semibold text-lg">Credenciamento Necessário</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Você precisa estar credenciado com a fábrica deste produto para fazer especificações.
                Solicite acesso na Vitrine.
              </p>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Produto selecionado:</p>
              <p className="font-semibold">{produto.nome}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tipo de Entrega
                </Label>
                <Select value={tipoEntrega} onValueChange={setTipoEntrega}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ENTREGA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info sobre tipo de entrega selecionado */}
            <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
              <strong>{TIPOS_ENTREGA.find(t => t.value === tipoEntrega)?.label}:</strong>{' '}
              {TIPOS_ENTREGA.find(t => t.value === tipoEntrega)?.description}
            </div>

            <Tabs defaultValue={pedidos.length > 0 ? "existente" : "novo"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existente" disabled={pedidos.length === 0}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Pedido</span> Existente
                </TabsTrigger>
                <TabsTrigger value="novo">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Novo</span> Pedido
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existente" className="space-y-4 mt-4">
                {pedidos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Você ainda não tem pedidos em rascunho. Crie um novo!
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Selecione um pedido</Label>
                      <Select value={pedidoSelecionado} onValueChange={setPedidoSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um pedido..." />
                        </SelectTrigger>
                        <SelectContent>
                          {pedidos.map((pedido) => (
                            <SelectItem key={pedido.id} value={pedido.id}>
                              {pedido.numero_pedido} - {pedido.cliente_nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSavePedidoExistente}
                      disabled={saving || !pedidoSelecionado}
                      className="w-full"
                    >
                      {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                      Adicionar ao Pedido
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="novo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={novoCliente}
                    onChange={(e) => setNovoCliente(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    O número do pedido será gerado automaticamente
                  </p>
                </div>

                <Button
                  onClick={handleSaveNovoPedido}
                  disabled={saving || !novoCliente.trim()}
                  className="w-full"
                >
                  {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                  Criar Pedido
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EspecificarDialog;
