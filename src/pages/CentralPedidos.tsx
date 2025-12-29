import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingCart,
  Loader2,
  Calendar,
  User,
  Building2,
  FileText,
  Edit,
  MoreHorizontal,
  CreditCard,
  Hammer,
  PackageCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import OrderWorkflow from '@/components/shared/OrderWorkflow';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Pedido {
  id: string;
  numero_pedido: string;
  status: string;
  cliente_nome: string;
  cliente_email: string | null;
  cliente_telefone: string | null;
  valor_total: number | null;
  valor_comissao: number | null;
  percentual_comissao: number | null;
  created_at: string;
  data_envio: string | null;
  data_aprovacao: string | null;
  data_entrega: string | null;
  etapa_pagamento: string | null;
  etapa_fabricacao: string | null;
  etapa_expedicao: string | null;
  observacoes: string | null;
  especificador?: {
    id: string;
    nome: string;
    email: string;
  };
  fabrica?: {
    id: string;
    nome: string;
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

type UserRole = 'fabrica' | 'especificador' | 'admin' | null;

const CentralPedidos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEntityId, setUserEntityId] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');

  // Detalhes do pedido
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    emProducao: 0,
    entregues: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      detectUserRole();
    }
  }, [user, authLoading, navigate]);

  const detectUserRole = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Verificar se é admin
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminRole) {
        setUserRole('admin');
        await fetchPedidos('admin');
        return;
      }

      // Verificar se é fábrica
      const { data: fabricaData } = await supabase
        .from('fabrica')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fabricaData) {
        setUserRole('fabrica');
        setUserEntityId(fabricaData.id);
        await fetchPedidos('fabrica', fabricaData.id);
        return;
      }

      // Verificar se é especificador
      const { data: especData } = await supabase
        .from('especificador')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (especData) {
        setUserRole('especificador');
        setUserEntityId(especData.id);
        await fetchPedidos('especificador', especData.id);
        return;
      }

      toast({
        title: 'Perfil não encontrado',
        description: 'Você precisa ter um perfil para acessar esta página.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao detectar role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidos = async (role: UserRole, entityId?: string) => {
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          especificador:especificador_id (id, nome, email),
          fabrica:fabrica_id (id, nome),
          itens:itens_pedido (
            id,
            quantidade,
            preco_unitario,
            preco_total,
            observacoes,
            produto:produto_id (id, nome, tipo_produto)
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'fabrica' && entityId) {
        query = query.eq('fabrica_id', entityId);
      } else if (role === 'especificador' && entityId) {
        query = query.eq('especificador_id', entityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPedidos(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    }
  };

  const calculateStats = (pedidosList: Pedido[]) => {
    const total = pedidosList.length;
    const pendentes = pedidosList.filter(p => ['rascunho', 'enviado', 'em_analise'].includes(p.status)).length;
    const emProducao = pedidosList.filter(p => ['aprovado', 'em_producao', 'enviado_cliente'].includes(p.status)).length;
    const entregues = pedidosList.filter(p => p.status === 'entregue').length;
    const valorTotal = pedidosList
      .filter(p => p.status === 'entregue')
      .reduce((sum, p) => sum + (p.valor_total || 0), 0);

    setStats({ total, pendentes, emProducao, entregues, valorTotal });
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-600', icon: <FileText className="h-3 w-3" /> },
      enviado: { label: 'Enviado', className: 'bg-blue-100 text-blue-600', icon: <Clock className="h-3 w-3" /> },
      em_analise: { label: 'Em Análise', className: 'bg-amber-100 text-amber-600', icon: <Clock className="h-3 w-3" /> },
      aprovado: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 className="h-3 w-3" /> },
      em_producao: { label: 'Em Produção', className: 'bg-purple-100 text-purple-600', icon: <Package className="h-3 w-3" /> },
      enviado_cliente: { label: 'Enviado ao Cliente', className: 'bg-cyan-100 text-cyan-600', icon: <Truck className="h-3 w-3" /> },
      entregue: { label: 'Entregue', className: 'bg-green-500 text-white', icon: <CheckCircle2 className="h-3 w-3" /> },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-600', icon: <XCircle className="h-3 w-3" /> },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-600', icon: null };
  };

  const handleUpdateStatus = async (pedidoId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'aprovado') {
        updateData.data_aprovacao = new Date().toISOString();
      } else if (newStatus === 'enviado_cliente') {
        updateData.etapa_expedicao = new Date().toISOString();
      } else if (newStatus === 'entregue') {
        updateData.data_entrega = new Date().toISOString();
      }

      const { error } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: 'Status atualizado!',
        className: 'bg-emerald-600 text-white',
      });

      fetchPedidos(userRole, userEntityId || undefined);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handler para avançar etapas do workflow
  const handleAvancarEtapa = async (pedidoId: string, etapa: 'pagamento' | 'fabricacao' | 'expedicao' | 'entrega') => {
    try {
      const updateData: any = {};
      let newStatus = '';
      
      switch (etapa) {
        case 'pagamento':
          updateData.etapa_pagamento = new Date().toISOString();
          updateData.status = 'em_producao';
          newStatus = 'Pagamento confirmado';
          break;
        case 'fabricacao':
          updateData.etapa_fabricacao = new Date().toISOString();
          newStatus = 'Fabricação iniciada';
          break;
        case 'expedicao':
          updateData.etapa_expedicao = new Date().toISOString();
          updateData.status = 'enviado_cliente';
          newStatus = 'Produto expedido';
          break;
        case 'entrega':
          updateData.data_entrega = new Date().toISOString();
          updateData.status = 'entregue';
          newStatus = 'Entrega confirmada';
          break;
      }

      const { error } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: newStatus,
        description: 'Etapa atualizada com sucesso',
        className: 'bg-emerald-600 text-white',
      });

      fetchPedidos(userRole, userEntityId || undefined);
      
      // Atualizar o pedido selecionado se o dialog estiver aberto
      if (selectedPedido?.id === pedidoId) {
        const { data } = await supabase
          .from('pedidos')
          .select(`
            *,
            especificador:especificador_id (id, nome, email),
            fabrica:fabrica_id (id, nome),
            itens:itens_pedido (
              id,
              quantidade,
              preco_unitario,
              preco_total,
              observacoes,
              produto:produto_id (id, nome, tipo_produto)
            )
          `)
          .eq('id', pedidoId)
          .maybeSingle();
        
        if (data) setSelectedPedido(data);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredPedidos = pedidos.filter(p => {
    // Busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        p.numero_pedido.toLowerCase().includes(query) ||
        p.cliente_nome.toLowerCase().includes(query) ||
        p.especificador?.nome?.toLowerCase().includes(query) ||
        p.fabrica?.nome?.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Status
    if (statusFilter !== 'todos' && p.status !== statusFilter) return false;

    // Data
    if (dateFilter !== 'todos') {
      const pedidoDate = new Date(p.created_at);
      const now = new Date();
      if (dateFilter === 'hoje') {
        if (pedidoDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (pedidoDate < weekAgo) return false;
      } else if (dateFilter === 'mes') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (pedidoDate < monthAgo) return false;
      }
    }

    return true;
  });

  const openDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setDetailsOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Central de Pedidos
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'admin' && 'Visão administrativa de todos os pedidos'}
                  {userRole === 'fabrica' && 'Gerencie os pedidos recebidos'}
                  {userRole === 'especificador' && 'Acompanhe seus pedidos'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {userRole}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Produção</p>
                  <p className="text-2xl font-bold">{stats.emProducao}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendas</p>
                  <p className="text-lg font-bold">
                    {stats.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nº pedido, cliente, especificador..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="em_producao">Em Produção</SelectItem>
                  <SelectItem value="enviado_cliente">Enviado ao Cliente</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo período</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedidos ({filteredPedidos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPedidos.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      {userRole !== 'especificador' && <TableHead>Especificador</TableHead>}
                      {userRole !== 'fabrica' && <TableHead>Fábrica</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPedidos.map((pedido) => {
                      const statusConfig = getStatusConfig(pedido.status);
                      return (
                        <TableRow key={pedido.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-mono font-medium" onClick={() => openDetails(pedido)}>
                            {pedido.numero_pedido}
                          </TableCell>
                          <TableCell onClick={() => openDetails(pedido)}>
                            <div>
                              <p className="font-medium">{pedido.cliente_nome}</p>
                              {pedido.cliente_email && (
                                <p className="text-xs text-muted-foreground">{pedido.cliente_email}</p>
                              )}
                            </div>
                          </TableCell>
                          {userRole !== 'especificador' && (
                            <TableCell onClick={() => openDetails(pedido)}>
                              {pedido.especificador?.nome || '-'}
                            </TableCell>
                          )}
                          {userRole !== 'fabrica' && (
                            <TableCell onClick={() => openDetails(pedido)}>
                              {pedido.fabrica?.nome || '-'}
                            </TableCell>
                          )}
                          <TableCell onClick={() => openDetails(pedido)}>
                            <Badge className={statusConfig.className}>
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => openDetails(pedido)}>
                            {pedido.valor_total
                              ? pedido.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : '-'}
                          </TableCell>
                          <TableCell onClick={() => openDetails(pedido)}>
                            {format(new Date(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDetails(pedido)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                {userRole === 'fabrica' && pedido.status === 'enviado' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'aprovado')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Aprovar Pedido
                                  </DropdownMenuItem>
                                )}
                                {userRole === 'fabrica' && pedido.status === 'aprovado' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'em_producao')}>
                                    <Package className="h-4 w-4 mr-2" />
                                    Iniciar Produção
                                  </DropdownMenuItem>
                                )}
                                {userRole === 'fabrica' && pedido.status === 'em_producao' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'enviado_cliente')}>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Marcar como Enviado
                                  </DropdownMenuItem>
                                )}
                                {pedido.status === 'enviado_cliente' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'entregue')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirmar Entrega
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog de detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pedido {selectedPedido?.numero_pedido}
            </DialogTitle>
          </DialogHeader>

          {selectedPedido && (
            <div className="space-y-6">
              {/* Status e datas */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusConfig(selectedPedido.status).className}>
                  {getStatusConfig(selectedPedido.status).icon}
                  <span className="ml-1">{getStatusConfig(selectedPedido.status).label}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Criado em {format(new Date(selectedPedido.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>

              {/* Workflow de etapas */}
              {selectedPedido.status !== 'rascunho' && selectedPedido.status !== 'cancelado' && (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Acompanhamento do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderWorkflow pedido={selectedPedido} />
                    
                    {/* Botões de ação para fábrica */}
                    {userRole === 'fabrica' && (
                      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                        {selectedPedido.status === 'enviado' && !selectedPedido.etapa_pagamento && (
                          <Button
                            onClick={() => handleAvancarEtapa(selectedPedido.id, 'pagamento')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Confirmar Pagamento
                          </Button>
                        )}
                        {selectedPedido.etapa_pagamento && !selectedPedido.etapa_fabricacao && (
                          <Button
                            onClick={() => handleAvancarEtapa(selectedPedido.id, 'fabricacao')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Hammer className="h-4 w-4 mr-2" />
                            Iniciar Fabricação
                          </Button>
                        )}
                        {selectedPedido.etapa_fabricacao && !selectedPedido.etapa_expedicao && (
                          <Button
                            onClick={() => handleAvancarEtapa(selectedPedido.id, 'expedicao')}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Confirmar Expedição
                          </Button>
                        )}
                        {selectedPedido.etapa_expedicao && !selectedPedido.data_entrega && (
                          <Button
                            onClick={() => handleAvancarEtapa(selectedPedido.id, 'entrega')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <PackageCheck className="h-4 w-4 mr-2" />
                            Confirmar Entrega
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Informações do cliente */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-medium">{selectedPedido.cliente_nome}</p>
                  {selectedPedido.cliente_email && <p className="text-sm text-muted-foreground">{selectedPedido.cliente_email}</p>}
                  {selectedPedido.cliente_telefone && <p className="text-sm text-muted-foreground">{selectedPedido.cliente_telefone}</p>}
                </CardContent>
              </Card>

              {/* Especificador e Fábrica */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Especificador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedPedido.especificador?.nome || '-'}</p>
                    {selectedPedido.especificador?.email && (
                      <p className="text-sm text-muted-foreground">{selectedPedido.especificador.email}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Fábrica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedPedido.fabrica?.nome || '-'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Itens do pedido */}
              {selectedPedido.itens && selectedPedido.itens.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Itens ({selectedPedido.itens.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPedido.itens.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{item.produto?.nome || 'Produto não encontrado'}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.produto?.tipo_produto} • Qtd: {item.quantidade}
                            </p>
                          </div>
                          <p className="font-medium">
                            {item.preco_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Valores */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor Total</span>
                      <span className="font-bold text-lg">
                        {selectedPedido.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '-'}
                      </span>
                    </div>
                    {selectedPedido.percentual_comissao && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Comissão ({selectedPedido.percentual_comissao}%)</span>
                        <span>
                          {selectedPedido.valor_comissao?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '-'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              {selectedPedido.observacoes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedPedido.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CentralPedidos;
