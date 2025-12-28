import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  X,
  Clock,
  Building2,
  Truck,
  Map,
  Instagram,
  Globe,
  MapPin,
  FileText,
  Eye,
  Loader2,
  Settings2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GerenciadorCidadesAutorizadas from "./GerenciadorCidadesAutorizadas";

interface ConexoesComerciaisProps {
  fabricaId: string;
}

interface Conexao {
  id: string;
  specifier_id: string;
  status: string;
  level: string;
  application_data: any;
  authorized_regions: string[] | null;
  authorized_cities: Record<string, { all: boolean; cities: string[] }> | null;
  sales_model: string | null;
  logistics_info: any;
  created_at: string;
  updated_at: string;
  especificador?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    cidade: string | null;
    estado: string | null;
    telefone: string | null;
  };
}

const ConexoesComerciais = ({ fabricaId }: ConexoesComerciaisProps) => {
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedConexao, setSelectedConexao] = useState<Conexao | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cidadesDialogOpen, setCidadesDialogOpen] = useState(false);
  const [conexaoParaCidades, setConexaoParaCidades] = useState<Conexao | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConexoes();
  }, [fabricaId]);

  const fetchConexoes = async () => {
    try {
      const { data, error } = await supabase
        .from("commercial_connections")
        .select(`
          *,
          especificador:specifier_id (
            id,
            nome,
            email,
            tipo,
            cidade,
            estado,
            telefone
          )
        `)
        .eq("factory_id", fabricaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConexoes((data as unknown as Conexao[]) || []);
    } catch (error: any) {
      console.error("Erro ao buscar conexões:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("commercial_connections")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: newStatus === "approved" ? "Credenciamento Aprovado!" : "Credenciamento Recusado",
        description: newStatus === "approved" 
          ? "O especificador agora pode acessar seus produtos."
          : "A solicitação foi recusada.",
        className: newStatus === "approved" ? "bg-emerald-600 text-white" : undefined,
      });

      fetchConexoes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openDetails = (conexao: Conexao) => {
    setSelectedConexao(conexao);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pendente</Badge>;
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case "lojista":
        return "Lojista (Loja Física)";
      case "distribuidor":
        return "Distribuidor (Centro de Distribuição)";
      case "especificador":
        return "Arquiteto/Designer";
      default:
        return perfil;
    }
  };

  const pendentes = conexoes.filter((c) => c.status === "pending");
  const aprovados = conexoes.filter((c) => c.status === "approved");
  const recusados = conexoes.filter((c) => c.status === "rejected");

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conexões Comerciais</h2>
          <p className="text-muted-foreground">
            Gerencie as solicitações de credenciamento dos especificadores
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> {pendentes.length} Pendentes
          </Badge>
          <Badge variant="outline" className="gap-1 bg-emerald-50">
            <Check className="h-3 w-3" /> {aprovados.length} Aprovados
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendentes" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="aprovados" className="gap-2">
            <Check className="h-4 w-4" />
            Aprovados ({aprovados.length})
          </TabsTrigger>
          <TabsTrigger value="recusados" className="gap-2">
            <X className="h-4 w-4" />
            Recusados ({recusados.length})
          </TabsTrigger>
        </TabsList>

        {["pendentes", "aprovados", "recusados"].map((tab) => {
          const list = tab === "pendentes" ? pendentes : tab === "aprovados" ? aprovados : recusados;
          return (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
              {list.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma solicitação {tab === "pendentes" ? "pendente" : tab === "aprovados" ? "aprovada" : "recusada"}.
                  </p>
                </Card>
              ) : (
                list.map((conexao) => (
                  <Card key={conexao.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Info do Especificador */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {conexao.especificador?.nome || "Especificador"}
                            </h3>
                            {getStatusBadge(conexao.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {conexao.especificador?.email}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            {conexao.application_data?.perfil && (
                              <Badge variant="outline">
                                <Building2 className="h-3 w-3 mr-1" />
                                {getPerfilLabel(conexao.application_data.perfil)}
                              </Badge>
                            )}
                            {conexao.application_data?.regioes?.length > 0 && (
                              <Badge variant="outline">
                                <Map className="h-3 w-3 mr-1" />
                                {conexao.application_data.regioes.length} estados
                              </Badge>
                            )}
                            {conexao.application_data?.logistica?.length > 0 && (
                              <Badge variant="outline">
                                <Truck className="h-3 w-3 mr-1" />
                                {conexao.application_data.logistica.join(", ")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Solicitado em {new Date(conexao.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(conexao)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>

                          {/* Botões para conexões aprovadas */}
                          {conexao.status === "approved" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-[#103927] hover:bg-[#103927]/90"
                                onClick={() => window.location.href = `/relacionamento/${conexao.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Relacionamento
                              </Button>
                              {conexao.application_data?.regioes?.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setConexaoParaCidades(conexao);
                                    setCidadesDialogOpen(true);
                                  }}
                                >
                                  <Settings2 className="h-4 w-4 mr-1" />
                                  Gerenciar Cidades
                                </Button>
                              )}
                            </>
                          )}

                          {conexao.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={actionLoading === conexao.id}
                                onClick={() => handleStatusChange(conexao.id, "approved")}
                              >
                                {actionLoading === conexao.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Aprovar
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                disabled={actionLoading === conexao.id}
                                onClick={() => handleStatusChange(conexao.id, "rejected")}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Recusar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Modal de Detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Detalhes do Credenciamento
            </DialogTitle>
            <DialogDescription>
              Informações completas enviadas pelo especificador
            </DialogDescription>
          </DialogHeader>

          {selectedConexao && (
            <div className="space-y-6">
              {/* Dados do Especificador */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold">{selectedConexao.especificador?.nome}</h4>
                <p className="text-sm text-muted-foreground">{selectedConexao.especificador?.email}</p>
                {selectedConexao.especificador?.telefone && (
                  <p className="text-sm">{selectedConexao.especificador.telefone}</p>
                )}
                {selectedConexao.especificador?.cidade && (
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedConexao.especificador.cidade}, {selectedConexao.especificador.estado}
                  </p>
                )}
              </div>

              {/* Dados da Aplicação */}
              {selectedConexao.application_data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Perfil</Label>
                      <p className="font-medium">{getPerfilLabel(selectedConexao.application_data.perfil)}</p>
                    </div>
                    <div>
                      <Label>Documento ({selectedConexao.application_data.documento_tipo?.toUpperCase()})</Label>
                      <p className="font-medium">{selectedConexao.application_data.documento}</p>
                    </div>
                  </div>

                  {/* Logística */}
                  {selectedConexao.application_data.logistica?.length > 0 && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4" />
                        Logística / Entrega
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedConexao.application_data.logistica.map((l: string) => (
                          <Badge key={l} variant="secondary">
                            {l === "entrega_propria" ? "Entrega Própria" : "Dropshipping"}
                          </Badge>
                        ))}
                      </div>
                      {selectedConexao.application_data.transportadora_nome && (
                        <p className="text-sm mt-2">
                          Transportadora: {selectedConexao.application_data.transportadora_nome} 
                          ({selectedConexao.application_data.transportadora_cnpj})
                        </p>
                      )}
                    </div>
                  )}

                  {/* Regiões */}
                  {selectedConexao.application_data.regioes?.length > 0 && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Map className="h-4 w-4" />
                        Regiões de Atuação
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedConexao.application_data.regioes.map((r: string) => (
                          <Badge key={r} variant="outline" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Redes Sociais */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedConexao.application_data.instagram && (
                      <div>
                        <Label className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </Label>
                        <p className="text-sm">{selectedConexao.application_data.instagram}</p>
                      </div>
                    )}
                    {selectedConexao.application_data.site && (
                      <div>
                        <Label className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Site
                        </Label>
                        <a 
                          href={selectedConexao.application_data.site} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {selectedConexao.application_data.site}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Endereço Completo */}
                  {(selectedConexao.application_data.logradouro || selectedConexao.application_data.cep) && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4" />
                        Endereço Físico
                      </Label>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">
                          {selectedConexao.application_data.logradouro}
                          {selectedConexao.application_data.numero && `, ${selectedConexao.application_data.numero}`}
                          {selectedConexao.application_data.complemento && ` - ${selectedConexao.application_data.complemento}`}
                        </p>
                        <p>
                          {selectedConexao.application_data.bairro}
                          {selectedConexao.application_data.cidade && ` - ${selectedConexao.application_data.cidade}`}
                          {selectedConexao.application_data.estado && `/${selectedConexao.application_data.estado}`}
                        </p>
                        {selectedConexao.application_data.cep && (
                          <p className="text-muted-foreground">CEP: {selectedConexao.application_data.cep}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sobre */}
                  {selectedConexao.application_data.sobre && (
                    <div>
                      <Label>Sobre a Empresa</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded">
                        {selectedConexao.application_data.sobre}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedConexao?.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleStatusChange(selectedConexao.id, "rejected");
                    setDetailsOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    handleStatusChange(selectedConexao.id, "approved");
                    setDetailsOpen(false);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprovar Credenciamento
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerenciamento de Cidades */}
      {conexaoParaCidades && (
        <GerenciadorCidadesAutorizadas
          conexaoId={conexaoParaCidades.id}
          especificadorNome={conexaoParaCidades.especificador?.nome || "Especificador"}
          authorizedRegions={conexaoParaCidades.application_data?.regioes || []}
          authorizedCities={conexaoParaCidades.authorized_cities || {}}
          onUpdate={fetchConexoes}
          open={cidadesDialogOpen}
          onOpenChange={setCidadesDialogOpen}
        />
      )}
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm font-medium text-muted-foreground ${className}`}>{children}</p>
);

export default ConexoesComerciais;
