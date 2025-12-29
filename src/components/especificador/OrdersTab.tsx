import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Package,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingCart,
  Loader2,
  User,
  Building2,
  FileText,
  Trash2,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pedido {
  id: string;
  numero_pedido: string;
  status: string;
  cliente_nome: string;
  cliente_email: string | null;
  cliente_telefone: string | null;
  tipo_entrega: string | null;
  valor_total: number | null;
  valor_comissao: number | null;
  created_at: string;
  fabrica?: {
    id: string;
    nome: string;
    logo_url: string | null;
  };
  itens?: {
    id: string;
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
    observacoes: string | null;
    produto: {
      id: string;
      nome: string;
      tipo_produto: string | null;
    };
  }[];
}

interface OrdersTabProps {
  especificadorId: string | null;
}

const OrdersTab = ({ especificadorId }: OrdersTabProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (especificadorId) {
      fetchPedidos();
    }
  }, [especificadorId]);

  const fetchPedidos = async () => {
    if (!especificadorId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          fabrica:fabrica_id (id, nome, logo_url),
          itens:itens_pedido (
            id,
            quantidade,
            preco_unitario,
            preco_total,
            observacoes,
            produto:produto_id (id, nome, tipo_produto)
          )
        `)
        .eq('especificador_id', especificadorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus pedidos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3 w-3" /> },
      enviado: { label: 'Enviado', className: 'bg-blue-100 text-blue-700', icon: <Send className="h-3 w-3" /> },
      em_analise: { label: 'Em Análise', className: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3" /> },
      aprovado: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" /> },
      em_producao: { label: 'Em Produção', className: 'bg-purple-100 text-purple-700', icon: <Package className="h-3 w-3" /> },
      enviado_cliente: { label: 'A Caminho', className: 'bg-cyan-100 text-cyan-700', icon: <Truck className="h-3 w-3" /> },
      entregue: { label: 'Entregue', className: 'bg-green-500 text-white', icon: <CheckCircle2 className="h-3 w-3" /> },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700', icon: null };
  };

  const handleEnviarPedido = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'enviado' })
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: 'Pedido enviado!',
        description: 'O fabricante receberá seu pedido para análise.',
        className: 'bg-emerald-600 text-white',
      });

      fetchPedidos();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('itens_pedido').delete().eq('id', itemId);
      if (error) throw error;
      toast({ title: 'Item removido' });
      fetchPedidos();
      if (selectedPedido) {
        const updatedPedido = pedidos.find(p => p.id === selectedPedido.id);
        if (updatedPedido) setSelectedPedido(updatedPedido);
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeletePedido = async (pedidoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', pedidoId);
      if (error) throw error;
      toast({ title: 'Pedido excluído' });
      setDetailsOpen(false);
      fetchPedidos();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const filteredPedidos = pedidos.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        p.numero_pedido.toLowerCase().includes(query) ||
        p.cliente_nome.toLowerCase().includes(query) ||
        p.fabrica?.nome?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    if (statusFilter !== 'todos' && p.status !== statusFilter) return false;
    return true;
  });

  // Stats
  const stats = {
    total: pedidos.length,
    rascunho: pedidos.filter(p => p.status === 'rascunho').length,
    enviados: pedidos.filter(p => ['enviado', 'em_analise', 'aprovado', 'em_producao'].includes(p.status)).length,
    entregues: pedidos.filter(p => p.status === 'entregue').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-[#103927]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-white rounded-2xl">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rascunhos</p>
                <p className="text-xl font-bold">{stats.rascunho}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
                <p className="text-xl font-bold">{stats.enviados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-2xl">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entregues</p>
                <p className="text-xl font-bold">{stats.entregues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white rounded-2xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pedido, cliente ou fábrica..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="em_producao">Em Produção</SelectItem>
                <SelectItem value="enviado_cliente">A Caminho</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      {filteredPedidos.length === 0 ? (
        <div className="text-center py-16 md:py-32 bg-white/50 rounded-[2rem] md:rounded-[3rem] border border-dashed">
          <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground opacity-30 mb-4 md:mb-6" />
          <h3 className="text-xl md:text-2xl font-serif text-foreground">Nenhum pedido encontrado</h3>
          <p className="text-muted-foreground mt-2 text-sm md:text-base px-4">
            Especifique produtos na Vitrine para criar pedidos
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {filteredPedidos.map((pedido) => {
            const statusConfig = getStatusConfig(pedido.status);
            
            return (
              <AccordionItem
                key={pedido.id}
                value={pedido.id}
                className="border rounded-xl bg-white px-4 md:px-6"
              >
                <AccordionTrigger className="hover:no-underline py-3 md:py-4">
                  <div className="flex items-center justify-between w-full mr-2 md:mr-4 gap-2">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      {pedido.fabrica?.logo_url ? (
                        <img 
                          src={pedido.fabrica.logo_url} 
                          alt="" 
                          className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover flex-shrink-0" 
                        />
                      ) : (
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 md:h-6 md:w-6 text-[#103927]" />
                        </div>
                      )}
                      <div className="text-left min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm md:text-lg truncate">{pedido.numero_pedido}</h3>
                          <Badge className={`${statusConfig.className} text-xs flex items-center gap-1`}>
                            {statusConfig.icon}
                            <span className="hidden sm:inline">{statusConfig.label}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1 truncate">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{pedido.cliente_nome}</span>
                          </span>
                          <span className="hidden md:flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {pedido.fabrica?.nome}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {pedido.itens?.length || 0} {(pedido.itens?.length || 0) === 1 ? 'item' : 'itens'}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4 md:pb-6">
                  <div className="border-t pt-4 mt-2">
                    {/* Info do pedido */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Fábrica</p>
                        <p className="font-medium">{pedido.fabrica?.nome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {format(new Date(pedido.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo Entrega</p>
                        <p className="font-medium capitalize">
                          {pedido.tipo_entrega?.replace('_', ' ') || 'Normal'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="font-medium">
                          {(pedido.valor_total || 0) > 0 
                            ? (pedido.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : 'A definir'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Itens */}
                    {pedido.itens && pedido.itens.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs text-muted-foreground font-medium">Itens do pedido:</p>
                        {pedido.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{item.produto?.nome || 'Produto'}</p>
                                {item.observacoes && (
                                  <p className="text-xs text-muted-foreground truncate">{item.observacoes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">Qtd: {item.quantidade}</Badge>
                              {pedido.status === 'rascunho' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
                      {pedido.status === 'rascunho' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePedido(pedido.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#103927] hover:bg-[#103927]/90"
                            onClick={() => handleEnviarPedido(pedido.id)}
                            disabled={!pedido.itens || pedido.itens.length === 0}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Enviar para Fábrica
                          </Button>
                        </>
                      )}
                      {pedido.status !== 'rascunho' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Dialog de detalhes (opcional, para visualização expandida) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <p className="text-sm">Pedido: {selectedPedido.numero_pedido}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTab;
