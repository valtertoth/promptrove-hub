import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Building2,
  Truck,
  Map,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// CORREÇÃO: Interface declarada explicitamente
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

  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [applicationStep, setApplicationStep] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    docType: "cnpj",
    document: "",
    social: "",
    address: "",
    logistics: "proprio",
    regions: "",
    salesModel: "revenda",
    about: "",
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (prodData) setProducts(prodData);
      const { data: connData } = await supabase
        .from("commercial_connections")
        .select("factory_id, status")
        .eq("specifier_id", userId);
      if (connData) setConnections(connData as Connection[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (factoryId: string) => connections.find((c) => c.factory_id === factoryId)?.status;
  const handleOpenApplication = (factoryId: string) => {
    setSelectedFactoryId(factoryId);
    setIsApplicationOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedFactoryId || !formData.type || !formData.document) {
      toast({ title: "Dados incompletos", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }
    setApplicationStep(true);
    try {
      const { error } = await supabase.from("commercial_connections").insert({
        specifier_id: userId,
        factory_id: selectedFactoryId,
        status: "pending",
        application_data: formData,
      });
      if (error) throw error;
      toast({
        title: "Dossiê Enviado",
        description: "A fábrica analisará sua estrutura comercial.",
        className: "bg-[#103927] text-white border-none",
      });
      setIsApplicationOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setApplicationStep(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
      <header className="flex justify-between items-end mb-12 pb-6 border-b border-border/40">
        <div>
          <h2 className="text-sm font-sans tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Área do Especificador
          </h2>
          <h1 className="text-4xl font-serif font-medium text-foreground">Curadoria de Projetos</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-full border-border hover:bg-secondary/50">
            Meu Perfil
          </Button>
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full">
            Sair
          </Button>
        </div>
      </header>

      <Tabs defaultValue="marketplace" className="space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-white/80 backdrop-blur p-1.5 rounded-full border border-border/60 shadow-sm inline-flex h-auto">
            <TabsTrigger
              value="marketplace"
              className="rounded-full px-8 py-2.5 data-[state=active]:bg-[#103927] data-[state=active]:text-white"
            >
              Vitrine
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="rounded-full px-8 py-2.5 data-[state=active]:bg-[#103927] data-[state=active]:text-white"
            >
              Meus Projetos
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-full px-8 py-2.5 data-[state=active]:bg-[#103927] data-[state=active]:text-white"
            >
              Comissões
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="marketplace">
          <div className="relative max-w-3xl mx-auto mb-12">
            <Search className="absolute left-5 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por design, categoria ou fábrica..."
              className="pl-14 h-14 rounded-full bg-white border-transparent shadow-lg shadow-black/5 text-lg focus:ring-2 focus:ring-[#103927]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => {
                const status = getConnectionStatus(product.manufacturer_id);
                return (
                  <Card
                    key={product.id}
                    className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden flex flex-col h-full cursor-default"
                  >
                    <div className="h-80 bg-secondary/20 relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <PackageSearch className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-white/90 text-foreground backdrop-blur shadow-sm hover:bg-white">
                          {product.category}
                        </Badge>
                      </div>
                      {status !== "approved" && (
                        <div className="absolute inset-0 bg-[#103927]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <Lock className="h-10 w-10 mb-4 text-[#D4AF37]" />
                          <span className="text-2xl font-serif">Exclusivo</span>
                          <span className="text-sm opacity-80 uppercase tracking-widest mt-2">Acesso Restrito</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-8 flex-1">
                      <h3 className="font-serif font-medium text-2xl text-foreground leading-tight mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                      {status === "approved" ? (
                        <Button
                          className="w-full h-14 rounded-2xl bg-[#1C1917] hover:bg-black text-white shadow-lg"
                          onClick={() => toast({ title: "Em breve: Módulo de Pedidos" })}
                        >
                          Especificar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : status === "pending" ? (
                        <Button disabled className="w-full h-14 rounded-2xl bg-amber-100 text-amber-700">
                          <Clock className="mr-2 h-4 w-4" /> Em Análise
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-border hover:border-[#103927] hover:text-[#103927]"
                          onClick={() => handleOpenApplication(product.manufacturer_id)}
                        >
                          Solicitar Acesso
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="projects" className="text-center py-32 opacity-50">
          Área de Projetos em construção.
        </TabsContent>
        <TabsContent value="financial" className="text-center py-32 opacity-50">
          Área Financeira em construção.
        </TabsContent>
      </Tabs>

      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[2rem] p-0 border-none shadow-2xl overflow-hidden bg-[#FAFAF9]">
          <div className="bg-[#103927] p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif">Credenciamento Comercial</DialogTitle>
                <DialogDescription className="text-white/60">Apresente sua estrutura para a fábrica.</DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 grid gap-6 overflow-y-auto max-h-[600px]">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-white rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lojista">Lojista (CNPJ)</SelectItem>
                    <SelectItem value="arquiteto">Arquiteto (RT)</SelectItem>
                    <SelectItem value="representante">Representante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Documento (CNPJ/CPF)</Label>
                <Input
                  className="bg-white rounded-xl"
                  placeholder="00.000.000/0000-00"
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-border/50">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Logística / Entrega
                </Label>
                <Select onValueChange={(v) => setFormData({ ...formData, logistics: v })}>
                  <SelectTrigger className="bg-gray-50 rounded-xl border-0">
                    <SelectValue placeholder="Como você recebe?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proprio">Galpão Próprio (Cross-docking)</SelectItem>
                    <SelectItem value="loja">Recebimento na Loja</SelectItem>
                    <SelectItem value="cliente">Direto no Cliente (Dropshipping)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Modelo de Compra
                </Label>
                <Select onValueChange={(v) => setFormData({ ...formData, salesModel: v })}>
                  <SelectTrigger className="bg-gray-50 rounded-xl border-0">
                    <SelectValue placeholder="Preferência Fiscal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenda">Revenda (Compra e Venda)</SelectItem>
                    <SelectItem value="interne">Intermediação (Comissão/RT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Map className="w-4 h-4" /> Regiões de Atuação
              </Label>
              <Input
                className="bg-white rounded-xl"
                placeholder="Ex: São Paulo Capital, Alphaville, Campinas..."
                onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Liste as cidades onde você possui força de venda ou entrega.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Instagram / Site</Label>
              <Input
                className="bg-white rounded-xl"
                placeholder="@seu.perfil"
                onChange={(e) => setFormData({ ...formData, social: e.target.value })}
              />
            </div>
          </div>

          <div className="p-6 bg-white border-t border-border flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsApplicationOpen(false)} className="rounded-xl h-12 px-6">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applicationStep}
              className="rounded-xl bg-[#103927] hover:bg-[#0A261A] h-12 px-8 text-white shadow-lg"
            >
              {applicationStep ? <Loader2 className="animate-spin" /> : "Enviar Proposta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecificadorDashboard;
