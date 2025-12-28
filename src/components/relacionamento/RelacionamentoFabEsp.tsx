import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Building2,
  Handshake,
  Percent,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  ShoppingCart,
  TrendingUp,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GerenciadorCidadesAutorizadas from "@/components/fabrica/GerenciadorCidadesAutorizadas";

interface RelacionamentoFabEspProps {
  connectionId: string;
  userRole: "fabrica" | "especificador";
  onBack: () => void;
}

interface ConnectionData {
  id: string;
  factory_id: string;
  specifier_id: string;
  status: string;
  commission_rate: number | null;
  authorized_regions: string[] | null;
  authorized_cities: Record<string, { all: boolean; cities: string[] }>;
  created_at: string;
  fabrica?: {
    id: string;
    nome: string;
    cidade: string | null;
    estado: string | null;
    logo_url: string | null;
  };
  especificador?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    cidade: string | null;
    estado: string | null;
  };
}

interface AcordoComissao {
  id: string;
  connection_id: string;
  percentual_solicitado: number;
  percentual_aprovado: number | null;
  status: string;
  data_solicitacao: string;
  data_resposta: string | null;
  data_vigencia_inicio: string | null;
  data_vigencia_fim: string | null;
  observacoes_especificador: string | null;
  observacoes_fabricante: string | null;
}

interface Pedido {
  id: string;
  numero_pedido: string;
  status: string;
  cliente_nome: string;
  valor_total: number;
  valor_comissao: number;
  percentual_comissao: number | null;
  created_at: string;
  data_envio: string | null;
}

const RelacionamentoFabEsp = ({ connectionId, userRole, onBack }: RelacionamentoFabEspProps) => {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [acordos, setAcordos] = useState<AcordoComissao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeTab, setActiveTab] = useState("visao-geral");

  // Modal de solicitação de comissão
  const [showSolicitarComissao, setShowSolicitarComissao] = useState(false);
  const [solicitacaoLoading, setSolicitacaoLoading] = useState(false);
  const [novaComissao, setNovaComissao] = useState({
    percentual: "",
    observacoes: "",
  });

  // Modal de resposta de comissão (fábrica)
  const [showResponderComissao, setShowResponderComissao] = useState(false);
  const [acordoSelecionado, setAcordoSelecionado] = useState<AcordoComissao | null>(null);
  const [respostaComissao, setRespostaComissao] = useState({
    percentual: "",
    observacoes: "",
  });

  // Modal de cidades
  const [showCidades, setShowCidades] = useState(false);

  useEffect(() => {
    fetchData();
  }, [connectionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar dados da conexão
      const { data: connData, error: connError } = await supabase
        .from("commercial_connections")
        .select(`
          *,
          fabrica:factory_id (
            id, nome, cidade, estado, logo_url
          ),
          especificador:specifier_id (
            id, nome, email, tipo, cidade, estado
          )
        `)
        .eq("id", connectionId)
        .single();

      if (connError) throw connError;
      
      const mappedConnection: ConnectionData = {
        ...connData,
        authorized_cities: (connData.authorized_cities as Record<string, { all: boolean; cities: string[] }>) || {},
      };
      setConnection(mappedConnection);

      // Buscar acordos de comissão
      const { data: acordosData } = await supabase
        .from("acordos_comissao")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: false });

      if (acordosData) setAcordos(acordosData);

      // Buscar pedidos
      const { data: pedidosData } = await supabase
        .from("pedidos")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: false });

      if (pedidosData) setPedidos(pedidosData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarComissao = async () => {
    const percentual = parseFloat(novaComissao.percentual);
    if (isNaN(percentual) || percentual < 0 || percentual > 100) {
      toast({
        title: "Percentual inválido",
        description: "O percentual deve estar entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }

    setSolicitacaoLoading(true);
    try {
      const { error } = await supabase.from("acordos_comissao").insert({
        connection_id: connectionId,
        percentual_solicitado: percentual,
        observacoes_especificador: novaComissao.observacoes || null,
        status: "pendente",
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Aguarde a aprovação do fabricante.",
        className: "bg-[#103927] text-white border-none",
      });

      setShowSolicitarComissao(false);
      setNovaComissao({ percentual: "", observacoes: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSolicitacaoLoading(false);
    }
  };

  const handleResponderComissao = async (aprovado: boolean) => {
    if (!acordoSelecionado) return;

    const percentual = aprovado ? parseFloat(respostaComissao.percentual) : null;
    if (aprovado && (isNaN(percentual!) || percentual! < 0 || percentual! > 100)) {
      toast({
        title: "Percentual inválido",
        description: "O percentual deve estar entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }

    setSolicitacaoLoading(true);
    try {
      const updateData: any = {
        status: aprovado ? "aprovado" : "rejeitado",
        data_resposta: new Date().toISOString(),
        observacoes_fabricante: respostaComissao.observacoes || null,
      };

      if (aprovado) {
        updateData.percentual_aprovado = percentual;
        updateData.data_vigencia_inicio = new Date().toISOString();
      }

      const { error } = await supabase
        .from("acordos_comissao")
        .update(updateData)
        .eq("id", acordoSelecionado.id);

      if (error) throw error;

      // Atualizar commission_rate na conexão se aprovado
      if (aprovado) {
        await supabase
          .from("commercial_connections")
          .update({ commission_rate: percentual })
          .eq("id", connectionId);
      }

      toast({
        title: aprovado ? "Comissão aprovada!" : "Solicitação rejeitada",
        description: aprovado
          ? `Comissão de ${percentual}% validada.`
          : "O especificador será notificado.",
        className: aprovado ? "bg-[#103927] text-white border-none" : undefined,
      });

      setShowResponderComissao(false);
      setAcordoSelecionado(null);
      setRespostaComissao({ percentual: "", observacoes: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSolicitacaoLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "aprovado":
        return <Badge className="bg-emerald-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPedidoStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      rascunho: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
      enviado: { label: "Enviado", className: "bg-blue-100 text-blue-600" },
      em_analise: { label: "Em Análise", className: "bg-amber-100 text-amber-600" },
      aprovado: { label: "Aprovado", className: "bg-emerald-100 text-emerald-600" },
      em_producao: { label: "Em Produção", className: "bg-purple-100 text-purple-600" },
      enviado_cliente: { label: "Enviado", className: "bg-cyan-100 text-cyan-600" },
      entregue: { label: "Entregue", className: "bg-green-500 text-white" },
      cancelado: { label: "Cancelado", className: "bg-red-100 text-red-600" },
    };
    const config = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-600" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const comissaoAtual = acordos.find((a) => a.status === "aprovado");
  const comissaoPendente = acordos.find((a) => a.status === "pendente");
  const totalPedidos = pedidos.length;
  const totalVendas = pedidos
    .filter((p) => p.status === "entregue")
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const totalComissoes = pedidos
    .filter((p) => p.status === "entregue")
    .reduce((sum, p) => sum + (p.valor_comissao || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Conexão não encontrada.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const partnerName = userRole === "fabrica" 
    ? connection.especificador?.nome 
    : connection.fabrica?.nome;

  const partnerInfo = userRole === "fabrica"
    ? connection.especificador
    : connection.fabrica;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-medium text-foreground flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" />
            Relacionamento com {partnerName}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {userRole === "fabrica" ? "Especificador" : "Fábrica"} • 
            {partnerInfo && 'cidade' in partnerInfo && partnerInfo.cidade && ` ${partnerInfo.cidade}`}
            {partnerInfo && 'estado' in partnerInfo && partnerInfo.estado && `, ${partnerInfo.estado}`}
          </p>
        </div>
        {comissaoAtual && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Comissão Atual</p>
            <p className="text-2xl font-bold text-primary">{comissaoAtual.percentual_aprovado}%</p>
          </div>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comissão</p>
                <p className="text-2xl font-bold">{comissaoAtual?.percentual_aprovado || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
                <p className="text-2xl font-bold">{totalPedidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vendas</p>
                <p className="text-2xl font-bold">
                  {totalVendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Percent className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comissões Geradas</p>
                <p className="text-2xl font-bold">
                  {totalComissoes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm">
          <TabsTrigger value="visao-geral" className="rounded-full px-6">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="rounded-full px-6">
            Comissões
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="rounded-full px-6">
            Pedidos
          </TabsTrigger>
          {userRole === "fabrica" && (
            <TabsTrigger value="regioes" className="rounded-full px-6">
              Regiões Autorizadas
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações do parceiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {userRole === "fabrica" ? "Dados do Especificador" : "Dados da Fábrica"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{partnerName}</p>
                </div>
                {userRole === "fabrica" && connection.especificador && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{connection.especificador.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <Badge variant="outline" className="capitalize">
                        {connection.especificador.tipo}
                      </Badge>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {partnerInfo && 'cidade' in partnerInfo && partnerInfo.cidade}
                    {partnerInfo && 'estado' in partnerInfo && partnerInfo.estado && `, ${partnerInfo.estado}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parceria desde</p>
                  <p className="font-medium">
                    {format(new Date(connection.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acordo de comissão atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Acordo de Comissão Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comissaoAtual ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Percentual</span>
                      <span className="text-3xl font-bold text-primary">
                        {comissaoAtual.percentual_aprovado}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(comissaoAtual.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vigente desde</span>
                      <span className="font-medium">
                        {comissaoAtual.data_vigencia_inicio &&
                          format(new Date(comissaoAtual.data_vigencia_inicio), "dd/MM/yyyy")}
                      </span>
                    </div>
                    {userRole === "especificador" && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setShowSolicitarComissao(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Solicitar Alteração
                      </Button>
                    )}
                  </div>
                ) : comissaoPendente ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="font-medium text-amber-800">Solicitação Pendente</span>
                      </div>
                      <p className="text-sm text-amber-700 mb-3">
                        {userRole === "especificador" 
                          ? "Aguardando aprovação da fábrica."
                          : "O especificador solicitou um percentual de comissão."}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Percentual Solicitado</span>
                        <span className="text-2xl font-bold text-amber-600">
                          {comissaoPendente.percentual_solicitado}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Solicitado em {format(new Date(comissaoPendente.data_solicitacao), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                    {userRole === "fabrica" && (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setAcordoSelecionado(comissaoPendente);
                          setRespostaComissao({
                            percentual: comissaoPendente.percentual_solicitado.toString(),
                            observacoes: "",
                          });
                          setShowResponderComissao(true);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Responder Solicitação
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum acordo de comissão ativo.
                    </p>
                    {userRole === "especificador" && (
                      <Button onClick={() => setShowSolicitarComissao(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Solicitar Comissão
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Comissões */}
        <TabsContent value="comissoes" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Histórico de Acordos</h3>
              <p className="text-sm text-muted-foreground">
                Todas as solicitações e acordos de comissão.
              </p>
            </div>
            {userRole === "especificador" && (
              <Button onClick={() => setShowSolicitarComissao(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Solicitação
              </Button>
            )}
          </div>

          {acordos.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <Percent className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground">Nenhum acordo de comissão registrado.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {acordos.map((acordo) => (
                <Card key={acordo.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(acordo.status)}
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(acordo.data_solicitacao), "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground">Solicitado</p>
                            <p className="text-xl font-bold">{acordo.percentual_solicitado}%</p>
                          </div>
                          {acordo.percentual_aprovado !== null && (
                            <div>
                              <p className="text-sm text-muted-foreground">Aprovado</p>
                              <p className="text-xl font-bold text-primary">
                                {acordo.percentual_aprovado}%
                              </p>
                            </div>
                          )}
                          {acordo.data_resposta && (
                            <div>
                              <p className="text-sm text-muted-foreground">Respondido em</p>
                              <p className="font-medium">
                                {format(new Date(acordo.data_resposta), "dd/MM/yyyy")}
                              </p>
                            </div>
                          )}
                        </div>
                        {acordo.observacoes_especificador && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Especificador:</strong> {acordo.observacoes_especificador}
                          </p>
                        )}
                        {acordo.observacoes_fabricante && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Fabricante:</strong> {acordo.observacoes_fabricante}
                          </p>
                        )}
                      </div>

                      {userRole === "fabrica" && acordo.status === "pendente" && (
                        <Button
                          onClick={() => {
                            setAcordoSelecionado(acordo);
                            setRespostaComissao({
                              percentual: acordo.percentual_solicitado.toString(),
                              observacoes: "",
                            });
                            setShowResponderComissao(true);
                          }}
                        >
                          Responder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Pedidos */}
        <TabsContent value="pedidos" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Histórico de Pedidos</h3>
              <p className="text-sm text-muted-foreground">
                Todos os pedidos desta parceria.
              </p>
            </div>
            {userRole === "especificador" && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            )}
          </div>

          {pedidos.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground mb-2">Nenhum pedido registrado.</p>
                <p className="text-sm text-muted-foreground">
                  {userRole === "especificador"
                    ? "Comece a fazer pedidos para esta fábrica."
                    : "Aguardando pedidos do especificador."}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <Card key={pedido.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold">{pedido.numero_pedido}</span>
                          {getPedidoStatusBadge(pedido.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {pedido.cliente_nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(pedido.created_at), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {pedido.valor_total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        {pedido.valor_comissao > 0 && (
                          <p className="text-sm text-emerald-600">
                            Comissão: {pedido.valor_comissao.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Regiões (apenas fábrica) */}
        {userRole === "fabrica" && (
          <TabsContent value="regioes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regiões Autorizadas
                </CardTitle>
                <CardDescription>
                  Gerencie as cidades onde este especificador pode atuar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCidades(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Gerenciar Cidades Autorizadas
                </Button>
                <GerenciadorCidadesAutorizadas
                  conexaoId={connectionId}
                  especificadorNome={connection.especificador?.nome || "Especificador"}
                  authorizedRegions={connection.authorized_regions || []}
                  authorizedCities={connection.authorized_cities || {}}
                  onUpdate={fetchData}
                  open={showCidades}
                  onOpenChange={setShowCidades}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal Solicitar Comissão */}
      <Dialog open={showSolicitarComissao} onOpenChange={setShowSolicitarComissao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Comissão</DialogTitle>
            <DialogDescription>
              Informe o percentual desejado. O fabricante irá analisar sua solicitação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="percentual">Percentual (%)</Label>
              <Input
                id="percentual"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="Ex: 10"
                value={novaComissao.percentual}
                onChange={(e) =>
                  setNovaComissao({ ...novaComissao, percentual: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Justificativa (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Explique sua solicitação..."
                value={novaComissao.observacoes}
                onChange={(e) =>
                  setNovaComissao({ ...novaComissao, observacoes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSolicitarComissao(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSolicitarComissao} disabled={solicitacaoLoading}>
              {solicitacaoLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Responder Comissão (Fábrica) */}
      <Dialog open={showResponderComissao} onOpenChange={setShowResponderComissao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Solicitação de Comissão</DialogTitle>
            <DialogDescription>
              O especificador solicitou {acordoSelecionado?.percentual_solicitado}% de comissão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="percentual-resposta">Percentual a Aprovar (%)</Label>
              <Input
                id="percentual-resposta"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="Ex: 10"
                value={respostaComissao.percentual}
                onChange={(e) =>
                  setRespostaComissao({ ...respostaComissao, percentual: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes-resposta">Observações (opcional)</Label>
              <Textarea
                id="observacoes-resposta"
                placeholder="Adicione uma mensagem..."
                value={respostaComissao.observacoes}
                onChange={(e) =>
                  setRespostaComissao({ ...respostaComissao, observacoes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleResponderComissao(false)}
              disabled={solicitacaoLoading}
            >
              Rejeitar
            </Button>
            <Button
              onClick={() => handleResponderComissao(true)}
              disabled={solicitacaoLoading}
            >
              {solicitacaoLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelacionamentoFabEsp;
