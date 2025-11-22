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
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [applicationStep, setApplicationStep] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    docType: "cpf",
    document: "",
    social: "",
    address: "",
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
      toast({ title: "Preencha os dados obrigatórios", variant: "destructive" });
      return;
    }
    setApplicationStep(true);
    try {
      const { error } = await supabase
        .from("commercial_connections")
        .insert({ specifier_id: userId, factory_id: selectedFactoryId, status: "pending", application_data: formData });
      if (error) throw error;
      toast({ title: "Solicitação Enviada", className: "bg-[#103927] text-white border-none" });
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
            <div className="flex justify-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-[#103927]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-dashed">
              <PackageSearch className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-6" />
              <h3 className="text-2xl font-serif">Nada encontrado</h3>
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 right-4 bg-white/30 hover:bg-white rounded-full text-white hover:text-red-500 backdrop-blur-md"
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
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
                          className="w-full h-14 rounded-2xl bg-[#1C1917] hover:bg-black text-white shadow-lg transition-all group-hover:scale-105"
                          onClick={() => toast({ title: "Adicionado ao projeto" })}
                        >
                          Especificar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : status === "pending" ? (
                        <Button
                          disabled
                          className="w-full h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100"
                        >
                          <Clock className="mr-2 h-4 w-4" /> Em Análise
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-border hover:border-[#103927] hover:text-[#103927] bg-transparent"
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
        <TabsContent value="projects">
          <div className="text-center py-32 opacity-50">Área de Projetos em construção.</div>
        </TabsContent>
        <TabsContent value="financial">
          <div className="text-center py-32 opacity-50">Área Financeira em construção.</div>
        </TabsContent>
      </Tabs>

      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 rounded-full bg-[#103927] flex items-center justify-center mx-auto mb-4 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-3xl font-serif text-center text-[#103927]">
              Credenciamento Comercial
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Conecte-se diretamente à fábrica para desbloquear condições especiais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/10 border-0">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lojista">Lojista</SelectItem>
                    <SelectItem value="arquiteto">Arquiteto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Documento</Label>
                <Input
                  className="h-12 rounded-xl bg-secondary/10 border-0"
                  placeholder="CPF/CNPJ"
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Instagram Profissional</Label>
              <Input
                className="h-12 rounded-xl bg-secondary/10 border-0"
                placeholder="@seu.perfil"
                onChange={(e) => setFormData({ ...formData, social: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade / UF</Label>
              <Input
                className="h-12 rounded-xl bg-secondary/10 border-0"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem (Opcional)</Label>
              <Textarea
                className="rounded-xl bg-secondary/10 border-0 min-h-[100px] p-4"
                placeholder="Conte sobre sua atuação..."
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button variant="ghost" onClick={() => setIsApplicationOpen(false)} className="rounded-xl h-12 px-6">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applicationStep}
              className="rounded-xl bg-[#103927] hover:bg-[#0A261A] h-12 px-8 text-white shadow-lg"
            >
              {applicationStep ? <Loader2 className="animate-spin" /> : "Enviar Candidatura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecificadorDashboard;
