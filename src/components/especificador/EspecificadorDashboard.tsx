import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  LayoutGrid,
  FolderHeart,
  Wallet,
  LogOut,
  Settings,
  Filter,
  Heart,
  ChevronRight,
  PackageSearch,
  Loader2,
  Lock,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EspecificadorDashboardProps {
  userId: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  manufacturer_id: string;
  description: string;
}

interface Connection {
  factory_id: string;
  status: "pending" | "approved" | "rejected";
}

const EspecificadorDashboard = ({ userId }: EspecificadorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados do Modal de Candidatura
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [applicationStep, setApplicationStep] = useState(false); // Loading state do envio

  // Formulário de Candidatura
  const [formData, setFormData] = useState({
    type: "",
    docType: "cpf", // cpf ou cnpj
    document: "",
    social: "", // Instagram/Site
    address: "",
    about: "",
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Produtos Ativos
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (prodData) setProducts(prodData);

      // 2. Buscar Minhas Conexões (Para saber se já pedi acesso)
      const { data: connData } = await supabase
        .from("commercial_connections")
        .select("factory_id, status")
        .eq("specifier_id", userId);

      if (connData) setConnections(connData as Connection[]);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Status ---
  const getConnectionStatus = (factoryId: string) => {
    const conn = connections.find((c) => c.factory_id === factoryId);
    return conn ? conn.status : null; // null = sem conexão
  };

  // --- Abertura do Modal ---
  const handleOpenApplication = (factoryId: string) => {
    setSelectedFactoryId(factoryId);
    setIsApplicationOpen(true);
  };

  // --- Envio da Candidatura ---
  const handleSubmitApplication = async () => {
    if (!selectedFactoryId) return;
    if (!formData.type || !formData.document || !formData.social) {
      toast({
        title: "Preencha os dados",
        description: "Tipo, Documento e Rede Social são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setApplicationStep(true);
    try {
      const { error } = await supabase.from("commercial_connections").insert({
        specifier_id: userId,
        factory_id: selectedFactoryId,
        status: "pending",
        application_data: formData, // Salva o JSON com as respostas
      });

      if (error) throw error;

      toast({
        title: "Candidatura Enviada!",
        description: "A fábrica analisará seu perfil. Você será notificado.",
        className: "bg-emerald-600 text-white border-none",
      });

      setIsApplicationOpen(false);
      fetchData(); // Atualiza status dos botões
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setApplicationStep(false);
    }
  };

  const handleEspecificar = (productName: string) => {
    toast({
      title: "Sucesso",
      description: `${productName} adicionado ao projeto.`,
      className: "bg-emerald-600 text-white border-none",
    });
  };

  // Filtro Local
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 font-sans text-slate-800">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Olá, <span className="font-semibold text-emerald-700">Especificador</span>
          </h1>
          <p className="text-gray-500 mt-1">Cadastre-se nas fábricas para ter acesso aos produtos.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50">
            <Settings className="mr-2 h-4 w-4" /> Meu Perfil
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <Tabs defaultValue="marketplace" className="space-y-8">
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-full border border-gray-200/50 shadow-sm inline-flex">
            <TabsTrigger
              value="marketplace"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Vitrine
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              <FolderHeart className="mr-2 h-4 w-4" /> Meus Projetos
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              <Wallet className="mr-2 h-4 w-4" /> Comissões
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="relative max-w-2xl mx-auto md:mx-0">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Busque por design, categoria..."
              className="pl-12 h-12 rounded-2xl border-gray-200 shadow-sm bg-white text-lg focus-visible:ring-emerald-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Vitrine de Produtos</h2>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                <PackageSearch className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const status = getConnectionStatus(product.manufacturer_id);

                  return (
                    <Card
                      key={product.id}
                      className="group rounded-2xl border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white flex flex-col h-full"
                    >
                      <div className="h-64 bg-gray-100 relative overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">
                            <span className="text-xs flex flex-col items-center">
                              <PackageSearch className="h-8 w-8 mb-2" />
                              Sem Foto
                            </span>
                          </div>
                        )}

                        {/* Overlay de Bloqueio se não aprovado */}
                        {status !== "approved" && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Lock className="h-8 w-8 mb-2" />
                            <span className="text-sm font-medium">Acesso Restrito</span>
                            <span className="text-xs opacity-80">Credenciamento necessário</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{product.name}</h3>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 shrink-0">
                            Novo
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {product.description || "Sem descrição detalhada."}
                        </p>
                      </CardContent>
                      <CardFooter className="p-5 pt-0">
                        {/* LÓGICA DO BOTÃO INTELIGENTE */}
                        {status === "approved" ? (
                          <Button
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                            onClick={() => handleEspecificar(product.name)}
                          >
                            Especificar Agora <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : status === "pending" ? (
                          <Button
                            disabled
                            className="w-full rounded-xl bg-amber-100 text-amber-700 border border-amber-200 opacity-100"
                          >
                            <Clock className="mr-2 h-4 w-4" /> Aguardando Aprovação
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full rounded-xl border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-600"
                            onClick={() => handleOpenApplication(product.manufacturer_id)}
                          >
                            Solicitar Credenciamento
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="text-center py-10 text-gray-400">
          Em breve.
        </TabsContent>
        <TabsContent value="financial" className="text-center py-10 text-gray-400">
          Em breve.
        </TabsContent>
      </Tabs>

      {/* MODAL DE CANDIDATURA (Questionário) */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">Candidatura de Especificador</DialogTitle>
            <DialogDescription>
              A fábrica precisa avaliar seu perfil comercial antes de liberar o acesso aos produtos e comissões.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qual seu perfil?</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger className="rounded-xl bg-gray-50">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lojista">Lojista (Showroom)</SelectItem>
                    <SelectItem value="arquiteto">Arquiteto / Designer</SelectItem>
                    <SelectItem value="representante">Representante Comercial</SelectItem>
                    <SelectItem value="influencer">Influenciador / Criador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select defaultValue="cpf" onValueChange={(val) => setFormData({ ...formData, docType: val })}>
                  <SelectTrigger className="rounded-xl bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">Pessoa Física (CPF)</SelectItem>
                    <SelectItem value="cnpj">Pessoa Jurídica (CNPJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Número do Documento (CPF/CNPJ)</Label>
              <Input
                className="rounded-xl bg-gray-50"
                placeholder="00.000.000/0000-00"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Instagram Profissional ou Site</Label>
              <Input
                className="rounded-xl bg-gray-50"
                placeholder="@seuinstagram ou www.seusite.com.br"
                value={formData.social}
                onChange={(e) => setFormData({ ...formData, social: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Cidade / Região de Atuação</Label>
              <Input
                className="rounded-xl bg-gray-50"
                placeholder="Ex: Presidente Prudente - SP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Conte um pouco sobre sua atuação (Opcional)</Label>
              <Textarea
                className="rounded-xl bg-gray-50 min-h-[80px]"
                placeholder="Tenho loja física de 200m2... / Sou arquiteto com foco em alto padrão..."
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplicationOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applicationStep}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {applicationStep ? <Loader2 className="mr-2 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Enviar Candidatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecificadorDashboard;
