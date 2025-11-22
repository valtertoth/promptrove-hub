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
      const { data: prodData } = await supabase.from("products").select("*").order("created_at", { ascending: false });
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
      toast({ title: "Preencha os dados", variant: "destructive" });
      return;
    }
    setApplicationStep(true);
    try {
      const { error } = await supabase
        .from("commercial_connections")
        .insert({ specifier_id: userId, factory_id: selectedFactoryId, status: "pending", application_data: formData });
      if (error) throw error;
      toast({ title: "Solicitação Enviada", className: "bg-emerald-600 text-white" });
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
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground transition-colors duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-medium text-foreground">
            Olá, <span className="italic text-emerald-700">Especificador</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-light">Explore o melhor do design brasileiro.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-border shadow-sm">
            Meu Perfil
          </Button>
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">
            Sair
          </Button>
        </div>
      </header>

      <Tabs defaultValue="marketplace" className="space-y-8">
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm inline-flex">
            <TabsTrigger
              value="marketplace"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Vitrine
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Projetos
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Comissões
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="relative max-w-2xl mx-auto md:mx-0">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar design..."
              className="pl-12 h-12 rounded-2xl bg-white border-transparent shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white">
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </Button>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-foreground mb-6">Curadoria da Semana</h2>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed">
                <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-xl font-serif text-foreground">Sem resultados</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const status = getConnectionStatus(product.manufacturer_id);
                  return (
                    <Card
                      key={product.id}
                      className="group rounded-3xl border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden flex flex-col h-full"
                    >
                      <div className="h-72 bg-secondary/20 relative overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <PackageSearch className="h-10 w-10 opacity-20" />
                          </div>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-4 right-4 bg-white/30 hover:bg-white rounded-full text-white hover:text-red-500 backdrop-blur-md"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        {status !== "approved" && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] flex flex-col items-center justify-center text-white p-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <Lock className="h-8 w-8 mb-3" />
                            <span className="text-lg font-serif">Exclusivo</span>
                            <span className="text-xs opacity-80 uppercase tracking-widest mt-1">
                              Credenciamento Necessário
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-serif font-medium text-xl text-foreground line-clamp-1">
                            {product.name}
                          </h3>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                            Novo
                          </Badge>
                        </div>
                        <p className="text-xs font-sans tracking-widest uppercase text-muted-foreground mb-2">
                          {product.category}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        {status === "approved" ? (
                          <Button
                            className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg hover:shadow-emerald-700/30 transition-all"
                            onClick={() => toast({ title: "Adicionado ao projeto" })}
                          >
                            Especificar <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        ) : status === "pending" ? (
                          <Button disabled className="w-full h-12 rounded-2xl bg-amber-100 text-amber-700">
                            <Clock className="mr-2 h-4 w-4" /> Em Análise
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl border-emerald-200 text-emerald-800 hover:bg-emerald-50"
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
          </div>
        </TabsContent>
        <TabsContent value="projects" className="text-center py-24 opacity-50">
          Em construção.
        </TabsContent>
        <TabsContent value="financial" className="text-center py-24 opacity-50">
          Em construção.
        </TabsContent>
      </Tabs>

      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif text-center mb-2">Aplicação Comercial</DialogTitle>
            <DialogDescription className="text-center">
              Para garantir a exclusividade, solicitamos alguns dados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lojista">Lojista</SelectItem>
                    <SelectItem value="arquiteto">Arquiteto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Doc</Label>
                <Input
                  className="h-12 rounded-xl bg-secondary/10"
                  placeholder="CPF/CNPJ"
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Instagram / Site</Label>
              <Input
                className="h-12 rounded-xl bg-secondary/10"
                onChange={(e) => setFormData({ ...formData, social: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                className="h-12 rounded-xl bg-secondary/10"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sobre você</Label>
              <Textarea
                className="rounded-xl bg-secondary/10 min-h-[100px]"
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsApplicationOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={applicationStep}
              className="rounded-xl bg-emerald-700 h-12 px-8 text-white"
            >
              {applicationStep ? <Loader2 className="animate-spin" /> : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecificadorDashboard;
