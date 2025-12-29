import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Settings,
  Lock,
  Clock,
  CheckCircle2,
  Building2,
  Loader2,
  PackageSearch,
  ChevronRight,
  FolderOpen,
  FileText,
  Trash2,
  Package,
  User,
  Calendar,
  Handshake,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import VitrineFilters from "./VitrineFilters";
import CredenciamentoForm, { CredenciamentoData } from "./CredenciamentoForm";
import EspecificarDialog from "./EspecificarDialog";
import OrdersTab from "./OrdersTab";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EspecificadorDashboardProps {
  userId: string;
}

interface Product {
  id: string;
  nome: string;
  tipo_produto: string | null;
  categorias: string[] | null;
  ambientes: string[] | null;
  imagens: string[] | null;
  descricao: string | null;
  fabrica_id: string;
  fabrica?: {
    id: string;
    nome: string;
    cidade: string | null;
    estado: string | null;
  };
}

interface Connection {
  factory_id: string;
  status: "pending" | "approved" | "rejected";
}

interface Fabricante {
  id: string;
  nome: string;
}

interface Fornecedor {
  id: string;
  nome: string;
}

const EspecificadorDashboard = ({ userId }: EspecificadorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [especificadorId, setEspecificadorId] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcesso, setSelectedAcesso] = useState("todos");
  const [selectedFabricante, setSelectedFabricante] = useState("todos");
  const [selectedCategoria, setSelectedCategoria] = useState("todos");
  const [selectedAmbiente, setSelectedAmbiente] = useState("todos");
  const [selectedFornecedor, setSelectedFornecedor] = useState("todos");

  // Dados para filtros
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [ambientes, setAmbientes] = useState<string[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  // Modal de especificação
  const [isSpecifyOpen, setIsSpecifyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; nome: string; fabrica_id: string } | null>(null);

  // Conexões aprovadas para Comissões
  const [approvedConnections, setApprovedConnections] = useState<any[]>([]);

  // Modal de credenciamento
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [selectedFactoryName, setSelectedFactoryName] = useState<string>("");
  const [applicationLoading, setApplicationLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar especificador_id
      let especificador = null;
      const { data: especData } = await supabase
        .from("especificador")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (especData) {
        especificador = especData;
        setEspecificadorId(especData.id);
      } else {
        // Se não existe registro de especificador, criar automaticamente
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newEspec, error: createError } = await supabase
            .from("especificador")
            .insert({
              user_id: userId,
              nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'Especificador',
              email: user.email || '',
              tipo: 'arquiteto' as const,
            })
            .select('id')
            .single();

          if (!createError && newEspec) {
            especificador = newEspec;
            setEspecificadorId(newEspec.id);
          }
        }
      }

      // Buscar produtos da tabela unificada 'produtos' com dados da fábrica
      const { data: prodData } = await supabase
        .from("produtos")
        .select(`
          *,
          fabrica:fabrica_id (
            id,
            nome,
            cidade,
            estado
          )
        `)
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (prodData) {
        // Converter imagens de jsonb para array se necessário
        const mappedProducts: Product[] = prodData.map((p: any) => ({
          ...p,
          imagens: Array.isArray(p.imagens) ? p.imagens : (p.imagens ? [p.imagens] : null),
          categorias: p.tipo_produto ? [p.tipo_produto] : null,
          ambientes: Array.isArray(p.ambientes) ? p.ambientes : null,
        }));

        setProducts(mappedProducts);

        // Extrair categorias únicas
        const categoriasSet = new Set<string>();
        const fabricantesMap = new Map<string, string>();

        mappedProducts.forEach((p) => {
          if (p.tipo_produto) {
            categoriasSet.add(p.tipo_produto);
          }
          if (p.fabrica) {
            fabricantesMap.set(p.fabrica.id, p.fabrica.nome);
          }
        });

        setCategorias(Array.from(categoriasSet).sort());
        setFabricantes(
          Array.from(fabricantesMap.entries()).map(([id, nome]) => ({ id, nome }))
        );
      }

      // Buscar conexões do especificador
      if (especificador) {
        const { data: connData } = await supabase
          .from("commercial_connections")
          .select("factory_id, status")
          .eq("specifier_id", especificador.id);

        if (connData) setConnections(connData as Connection[]);
      }

      // Buscar fornecedores
      const { data: fornData } = await supabase
        .from("fornecedor")
        .select("id, nome")
        .eq("ativo", true);

      if (fornData) {
        setFornecedores(fornData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar conexões aprovadas com acordos de comissão
  const fetchApprovedConnections = async () => {
    if (!especificadorId) return;
    try {
      const { data, error } = await supabase
        .from("commercial_connections")
        .select(`
          *,
          fabrica:factory_id (
            id,
            nome,
            logo_url,
            cidade,
            estado
          )
        `)
        .eq("specifier_id", especificadorId)
        .eq("status", "approved");

      if (error) throw error;
      
      // Para cada conexão, buscar o acordo de comissão mais recente
      const connectionsWithAcordos = await Promise.all((data || []).map(async (conn) => {
        const { data: acordoData } = await supabase
          .from("acordos_comissao")
          .select("*")
          .eq("connection_id", conn.id)
          .order("created_at", { ascending: false })
          .limit(1);
        
        return {
          ...conn,
          acordo_atual: acordoData?.[0] || null
        };
      }));
      
      setApprovedConnections(connectionsWithAcordos);
    } catch (error) {
      console.error("Erro ao buscar conexões:", error);
    }
  };

  // Carregar conexões quando especificadorId estiver disponível
  useEffect(() => {
    if (especificadorId) {
      fetchApprovedConnections();
    }
  }, [especificadorId]);

  // Handler para abrir dialog de especificar
  const handleOpenSpecify = (product: Product) => {
    setSelectedProduct({ id: product.id, nome: product.nome, fabrica_id: product.fabrica_id });
    setIsSpecifyOpen(true);
  };

  // Handler para fechar dialog e atualizar projetos
  const handleSpecifyClose = (open: boolean) => {
    setIsSpecifyOpen(open);
    if (!open) {
      fetchProjects();
    }
  };

  const getConnectionStatus = (factoryId: string) => {
    const conn = connections.find((c) => c.factory_id === factoryId);
    return conn ? conn.status : null;
  };

  const handleOpenApplication = (factoryId: string, factoryName: string) => {
    setSelectedFactoryId(factoryId);
    setSelectedFactoryName(factoryName);
    setIsApplicationOpen(true);
  };

  const handleSubmitApplication = async (formData: CredenciamentoData) => {
    if (!selectedFactoryId || !especificadorId) {
      toast({
        title: "Erro",
        description: "Dados de usuário não encontrados.",
        variant: "destructive",
      });
      return;
    }

    setApplicationLoading(true);
    try {
      const insertData = {
        specifier_id: especificadorId,
        factory_id: selectedFactoryId,
        status: "pending",
        application_data: formData as any,
        authorized_regions: formData.regioes,
        logistics_info: {
          logistica: formData.logistica,
          transportadora_nome: formData.transportadora_nome,
          transportadora_cnpj: formData.transportadora_cnpj,
        } as any,
      };
      
      const { error } = await supabase.from("commercial_connections").insert(insertData);

      if (error) throw error;

      toast({
        title: "Credenciamento Enviado!",
        description: `Sua proposta foi enviada para ${selectedFactoryName}. Aguarde a análise.`,
        className: "bg-[#103927] text-white border-none",
      });

      setIsApplicationOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApplicationLoading(false);
    }
  };

  // Lógica de filtros
  const filteredProducts = products.filter((p) => {
    // Busca textual
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        p.nome.toLowerCase().includes(query) ||
        (p.descricao || "").toLowerCase().includes(query) ||
        (p.fabrica?.nome || "").toLowerCase().includes(query) ||
        (p.tipo_produto || "").toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filtro de acesso
    if (selectedAcesso !== "todos") {
      const status = getConnectionStatus(p.fabrica_id);
      if (selectedAcesso === "aprovado" && status !== "approved") return false;
      if (selectedAcesso === "pendente" && status !== "pending") return false;
      if (selectedAcesso === "nao_solicitado" && status !== null) return false;
    }

    // Filtro de fabricante
    if (selectedFabricante !== "todos" && p.fabrica_id !== selectedFabricante) {
      return false;
    }

    // Filtro de categoria (agora baseado em tipo_produto)
    if (selectedCategoria !== "todos") {
      if (p.tipo_produto !== selectedCategoria) return false;
    }

    // Filtro de ambiente (não aplicável com a nova estrutura)
    // Os produtos da tabela products não têm campo ambientes

    // Filtro de fornecedor (TODO: quando tivermos relação produto-fornecedor)

    return true;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedAcesso("todos");
    setSelectedFabricante("todos");
    setSelectedCategoria("todos");
    setSelectedAmbiente("todos");
    setSelectedFornecedor("todos");
  };

  const activeFiltersCount = [
    selectedAcesso !== "todos",
    selectedFabricante !== "todos",
    selectedCategoria !== "todos",
    selectedAmbiente !== "todos",
    selectedFornecedor !== "todos",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12 font-sans text-foreground">
      {/* Header responsivo */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-12 pb-6 border-b border-border/40">
        <div>
          <h2 className="text-xs md:text-sm font-sans tracking-[0.2em] uppercase text-muted-foreground mb-1 md:mb-2">
            Área do Especificador
          </h2>
          <h1 className="text-2xl md:text-4xl font-serif font-medium text-foreground">Curadoria de Projetos</h1>
        </div>
        <div className="flex gap-2 md:gap-4 w-full md:w-auto">
          <Button
            onClick={() => (window.location.href = "/profile")}
            variant="outline"
            size="sm"
            className="rounded-full border-border hover:bg-secondary/50 flex-1 md:flex-none"
          >
            <Settings className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Meu Perfil</span>
          </Button>
          <Button onClick={signOut} variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-full">
            <span className="md:hidden">Sair</span>
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </header>

      <Tabs defaultValue="marketplace" className="space-y-6 md:space-y-10">
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-white/80 backdrop-blur p-1 md:p-1.5 rounded-full border border-border/60 shadow-sm inline-flex h-auto min-w-max">
            <TabsTrigger
              value="marketplace"
              className="rounded-full px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base data-[state=active]:bg-[#103927] data-[state=active]:text-white whitespace-nowrap"
            >
              Vitrine
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-full px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base data-[state=active]:bg-[#103927] data-[state=active]:text-white whitespace-nowrap"
            >
              <Package className="h-4 w-4 mr-1 md:mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-full px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base data-[state=active]:bg-[#103927] data-[state=active]:text-white whitespace-nowrap"
            >
              Comissões
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="marketplace">
          {/* Filtros */}
          <div className="mb-12">
            <VitrineFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedAcesso={selectedAcesso}
              onAcessoChange={setSelectedAcesso}
              selectedFabricante={selectedFabricante}
              onFabricanteChange={setSelectedFabricante}
              selectedCategoria={selectedCategoria}
              onCategoriaChange={setSelectedCategoria}
              selectedAmbiente={selectedAmbiente}
              onAmbienteChange={setSelectedAmbiente}
              selectedFornecedor={selectedFornecedor}
              onFornecedorChange={setSelectedFornecedor}
              fabricantes={fabricantes}
              categorias={categorias}
              ambientes={ambientes}
              fornecedores={fornecedores}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-[#103927]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-dashed">
              <PackageSearch className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-6" />
              <h3 className="text-2xl font-serif text-foreground">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mt-2">Tente ajustar os filtros de busca</p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-center text-muted-foreground mb-6">
                {filteredProducts.length} produto(s) encontrado(s)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => {
                  const status = getConnectionStatus(product.fabrica_id);

                  return (
                    <Card
                      key={product.id}
                      className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden flex flex-col h-full cursor-default"
                    >
                      <div className="h-80 bg-secondary/20 relative overflow-hidden">
                        {product.imagens && product.imagens.length > 0 ? (
                          <img
                            src={product.imagens[0]}
                            alt={product.nome}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <PackageSearch className="h-12 w-12 opacity-20" />
                          </div>
                        )}

                        {/* Etiquetas */}
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          {product.tipo_produto && (
                            <Badge className="bg-white/90 text-foreground backdrop-blur shadow-sm hover:bg-white">
                              {product.tipo_produto}
                            </Badge>
                          )}
                          {status === "approved" && (
                            <Badge className="bg-emerald-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Acesso
                            </Badge>
                          )}
                        </div>

                        {/* Bloqueio Visual se não aprovado */}
                        {status !== "approved" && (
                          <div className="absolute inset-0 bg-[#103927]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <Lock className="h-10 w-10 mb-4 text-[#D4AF37]" />
                            <span className="text-2xl font-serif">Exclusivo</span>
                            <span className="text-sm opacity-80 uppercase tracking-widest mt-2">
                              Acesso Restrito
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-8 flex-1">
                        {/* Nome da Fábrica */}
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Building2 className="w-3 h-3" />
                          <span className="text-xs font-bold tracking-widest uppercase">
                            {product.fabrica?.nome || "Fábrica Parceira"}
                          </span>
                        </div>

                        <h3 className="font-serif font-medium text-2xl text-foreground leading-tight mb-2">
                          {product.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {product.descricao}
                        </p>

                        {/* Categorias */}
                        {product.categorias && product.categorias.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {product.categorias.slice(0, 2).map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {product.categorias.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.categorias.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="p-8 pt-0">
                        {status === "approved" ? (
                          <Button
                            className="w-full h-14 rounded-2xl bg-[#1C1917] hover:bg-black text-white shadow-lg transition-all group-hover:scale-105"
                            onClick={() => handleOpenSpecify(product)}
                          >
                            Especificar <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : status === "pending" ? (
                          <Button disabled className="w-full h-14 rounded-2xl bg-amber-100 text-amber-700 border border-amber-100">
                            <Clock className="mr-2 h-4 w-4" /> Em Análise
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-border hover:border-[#103927] hover:text-[#103927] bg-transparent"
                            onClick={() =>
                              handleOpenApplication(product.fabrica_id, product.fabrica?.nome || "Fábrica")
                            }
                          >
                            Solicitar Acesso
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab especificadorId={especificadorId} />
        </TabsContent>

        <TabsContent value="financial">
          {approvedConnections.length === 0 ? (
            <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-dashed">
              <Handshake className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-6" />
              <h3 className="text-2xl font-serif text-foreground">Nenhuma conexão aprovada</h3>
              <p className="text-muted-foreground mt-2">
                Solicite acesso a fábricas na Vitrine para ver suas comissões
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedConnections.map((conn) => {
                const acordo = conn.acordo_atual;
                const isPendente = acordo?.status === 'pendente';
                const isAprovado = acordo?.status === 'aprovado';
                const comissaoDisplay = isAprovado 
                  ? `${acordo.percentual_aprovado}%` 
                  : isPendente 
                    ? `${acordo.percentual_solicitado}% (pendente)` 
                    : 'A definir';

                return (
                  <Card key={conn.id} className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        {conn.fabrica?.logo_url ? (
                          <img src={conn.fabrica.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#103927]/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-[#103927]" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{conn.fabrica?.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {conn.fabrica?.cidade}, {conn.fabrica?.estado}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge className="bg-emerald-500 text-white">Aprovado</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Comissão</span>
                          <div className="flex items-center gap-2">
                            {isPendente && (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                            {isAprovado && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            <span className={`font-medium ${isPendente ? 'text-amber-600' : isAprovado ? 'text-emerald-600' : ''}`}>
                              {comissaoDisplay}
                            </span>
                          </div>
                        </div>
                        {isPendente && (
                          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                            Aguardando aprovação da fábrica
                          </p>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aprovado em</span>
                          <span>{new Date(conn.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => window.location.href = `/relacionamento/${conn.id}`}
                      >
                        Ver Relacionamento
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL DE CREDENCIAMENTO */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="sm:max-w-[900px] rounded-[2rem] p-0 border-none shadow-2xl overflow-hidden bg-[#FAFAF9]">
          <div className="bg-[#103927] p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif">Credenciamento Comercial</DialogTitle>
                <DialogDescription className="text-white/60">
                  Apresente sua estrutura para {selectedFactoryName}
                </DialogDescription>
              </div>
            </div>
          </div>

          <CredenciamentoForm
            onSubmit={handleSubmitApplication}
            onCancel={() => setIsApplicationOpen(false)}
            loading={applicationLoading}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL DE ESPECIFICAÇÃO */}
      <EspecificarDialog
        open={isSpecifyOpen}
        onOpenChange={handleSpecifyClose}
        produto={selectedProduct}
      />
    </div>
  );
};

export default EspecificadorDashboard;
