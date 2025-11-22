import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Package,
  Settings,
  LayoutDashboard,
  Save,
  Image as ImageIcon,
  Check,
  Loader2,
  Search,
  Factory,
  Building2,
  X,
  Layers,
  ArrowRight,
  Pencil,
  Trash2,
  UploadCloud,
  Users,
  UserCheck,
  UserX,
  Instagram,
  MapPin,
  Palette,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FabricaDashboardProps {
  userId: string;
}

interface MaterialData {
  id: string;
  name: string;
  type: string;
  supplier_id: string;
  supplier_name?: string;
  sku_supplier: string;
  image_url: string | null;
}
interface ProductData {
  id: string;
  name: string;
  category: string;
  sku_manufacturer: string;
  description: string;
  dimensions: string[];
  image_url: string | null;
  created_at: string;
}
interface ConnectionRequest {
  id: string;
  specifier_id: string;
  status: string;
  created_at: string;
  application_data: any;
}
interface NegotiationData {
  commission: string;
  region: string;
}

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Dados
  const [allMaterials, setAllMaterials] = useState<MaterialData[]>([]);
  const [myProducts, setMyProducts] = useState<ProductData[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);

  // UI States - Produtos
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("todos");
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialData[]>([]);

  // UI States - Negociação (Parceiros)
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionRequest | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationData>({ commission: "10", region: "" });

  // Formulário Produto
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    sku: "",
    description: "",
    dimensions: [""],
    image_url: "",
  });

  useEffect(() => {
    fetchMaterials();
    fetchMyProducts();
    fetchConnections();
  }, []);

  // --- FETCHERS ---
  const fetchMaterials = async () => {
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    if (data) setAllMaterials(data);
  };

  const fetchMyProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("manufacturer_id", userId)
      .order("created_at", { ascending: false });
    if (data) setMyProducts(data);
  };

  const fetchConnections = async () => {
    const { data } = await supabase
      .from("commercial_connections")
      .select("*")
      .eq("factory_id", userId)
      .order("created_at", { ascending: false });
    if (data) setConnections(data);
  };

  // --- ACTIONS PARCEIROS (NEGOCIAÇÃO) ---
  const openApprovalModal = (conn: ConnectionRequest) => {
    setSelectedConnection(conn);
    setNegotiation({ commission: "10", region: conn.application_data?.address || "" }); // Sugere a cidade do cadastro
    setIsApproveOpen(true);
  };

  const confirmApproval = async () => {
    if (!selectedConnection) return;
    setLoading(true);

    const { error } = await supabase
      .from("commercial_connections")
      .update({
        status: "approved",
        // Salvando as regras de negócio (precisa ter criado as colunas no banco conforme passo anterior)
        commission_rate: parseFloat(negotiation.commission),
        authorized_regions: [negotiation.region],
      })
      .eq("id", selectedConnection.id);

    if (!error) {
      toast({
        title: "Parceiro Homologado",
        description: `Comissão definida em ${negotiation.commission}%`,
        className: "bg-[#103927] text-white border-none",
      });
      fetchConnections();
      setIsApproveOpen(false);
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const rejectConnection = async (id: string) => {
    const { error } = await supabase.from("commercial_connections").update({ status: "rejected" }).eq("id", id);
    if (!error) {
      toast({ title: "Solicitação Rejeitada" });
      fetchConnections();
    } else {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  // --- ACTIONS PRODUTOS ---
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const fileName = `product-${userId}-${Math.random()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("material-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("material-images").getPublicUrl(fileName);
      setNewProduct((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Foto carregada!", className: "bg-green-600 text-white border-none" });
    } catch (error: any) {
      toast({ title: "Erro", description: "Tente imagem menor.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // --- HELPERS ---
  function getCategoryGroup(type: string) {
    if (["Madeira Maciça", "Lâmina Natural", "Lâmina Pré-Composta"].includes(type)) return "Madeiras";
    if (["Tecido Plano", "Couro Natural", "Couro Sintético", "Veludo"].includes(type)) return "Tecidos";
    if (["Aço Carbono", "Aço Inox", "Alumínio", "Latão"].includes(type)) return "Metais";
    if (["Mármore", "Granito", "Quartzito", "Sintético"].includes(type)) return "Pedras";
    return "Acabamentos Diversos";
  }

  const uniqueSuppliers = allMaterials
    .filter((m) => selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory)
    .reduce(
      (acc, current) => {
        const exists = acc.find((item) => item.id === current.supplier_id);
        if (!exists) return acc.concat([{ id: current.supplier_id, name: current.supplier_name || "Fornecedor" }]);
        return acc;
      },
      [] as { id: string; name: string }[],
    );

  const displayedMaterials = allMaterials.filter((m) => {
    const categoryMatch = selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory;
    const supplierMatch = selectedSupplierId === "todos" || m.supplier_id === selectedSupplierId;
    return categoryMatch && supplierMatch;
  });

  const toggleMaterial = (material: MaterialData) => {
    if (selectedMaterials.find((m) => m.id === material.id)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m.id !== material.id));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const groupedSelected = selectedMaterials.reduce(
    (acc, mat) => {
      const group = getCategoryGroup(mat.type);
      if (!acc[group]) acc[group] = [];
      acc[group].push(mat);
      return acc;
    },
    {} as Record<string, MaterialData[]>,
  );

  // --- CRUD PRODUTO ---
  const handleEditProduct = async (product: ProductData) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      sku: product.sku_manufacturer || "",
      description: product.description || "",
      dimensions: product.dimensions || [""],
      image_url: product.image_url || "",
    });
    const { data: links } = await supabase.from("product_materials").select("material_id").eq("product_id", product.id);
    if (links) {
      const linkedMaterials = allMaterials.filter((m) => links.some((l) => l.material_id === m.id));
      setSelectedMaterials(linkedMaterials);
    }
    setActiveTab("new-product");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: "", category: "", sku: "", description: "", dimensions: [""], image_url: "" });
    setSelectedMaterials([]);
    setActiveTab("products");
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("product_materials").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      toast({ title: "Excluído", className: "bg-gray-800 text-white border-none" });
      fetchMyProducts();
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.category) {
      toast({ title: "Erro", description: "Campos obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        manufacturer_id: userId,
        name: newProduct.name,
        category: newProduct.category,
        sku_manufacturer: newProduct.sku,
        description: newProduct.description,
        dimensions: newProduct.dimensions,
        image_url: newProduct.image_url,
      };
      let pid = editingId;
      if (editingId) {
        await supabase.from("products").update(payload).eq("id", editingId);
        await supabase.from("product_materials").delete().eq("product_id", editingId);
        toast({ title: "Ficha Técnica Atualizada", className: "bg-[#103927] text-white border-none" });
      } else {
        const { data } = await supabase.from("products").insert(payload).select().single();
        if (data) pid = data.id;
        toast({ title: "Produto Publicado", className: "bg-[#103927] text-white border-none" });
      }
      if (selectedMaterials.length > 0 && pid) {
        const links = selectedMaterials.map((m) => ({ product_id: pid, material_id: m.id }));
        await supabase.from("product_materials").insert(links);
      }
      handleCancelEdit();
      fetchMyProducts();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground transition-colors duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-medium tracking-tight text-foreground">
            Atelier da <span className="italic text-primary">Fábrica</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-light">Gestão de acervo e curadoria de materiais.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">
            Sair
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm inline-flex">
          <TabsTrigger
            value="overview"
            className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            Portfólio
          </TabsTrigger>
          <TabsTrigger
            value="partners"
            className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            Parceiros
          </TabsTrigger>
          <TabsTrigger
            value="new-product"
            className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            {editingId ? "Editor" : "Novo Produto"}
          </TabsTrigger>
        </TabsList>

        {/* ABA PARCEIROS COM NEGOCIAÇÃO */}
        <TabsContent value="partners">
          <div className="grid gap-6">
            <div>
              <h3 className="text-xl font-serif text-foreground mb-4 flex items-center gap-2">
                Solicitações Pendentes{" "}
                <Badge variant="secondary" className="rounded-full">
                  {connections.filter((c) => c.status === "pending").length}
                </Badge>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {connections
                  .filter((c) => c.status === "pending")
                  .map((conn) => (
                    <Card key={conn.id} className="rounded-2xl border-none shadow-md bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-serif font-medium text-foreground">
                              {conn.application_data?.type?.toUpperCase() || "ESPECIFICADOR"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {conn.application_data?.address}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent/50">
                            Novo
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-3 pb-4">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4" /> {conn.application_data?.social}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/20 p-3 rounded-xl">
                          <div>
                            <span className="block font-bold text-foreground">Logística</span>
                            {conn.application_data?.logistics?.toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-foreground">Modelo</span>
                            {conn.application_data?.salesModel?.toUpperCase()}
                          </div>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-xl text-xs italic border border-border">
                          "{conn.application_data?.about}"
                        </div>
                      </CardContent>
                      <CardFooter className="gap-3 pt-0">
                        <Button
                          onClick={() => openApprovalModal(conn)}
                          className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                        >
                          <UserCheck className="mr-2 h-4 w-4" /> Analisar & Aprovar
                        </Button>
                        <Button
                          onClick={() => rejectConnection(conn.id)}
                          variant="outline"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          Recusar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                {connections.filter((c) => c.status === "pending").length === 0 && (
                  <div className="col-span-2 py-12 text-center text-muted-foreground border border-dashed rounded-2xl">
                    Tudo em dia. Nenhuma solicitação pendente.
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-serif text-foreground mb-4">Rede Homologada</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {connections
                  .filter((c) => c.status === "approved")
                  .map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center gap-4 p-4 bg-white border border-border rounded-2xl shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{conn.application_data?.document}</p>
                        <p className="text-xs text-muted-foreground uppercase">{conn.application_data?.type}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* OUTRAS ABAS (MANTIDAS) */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <Card className="rounded-3xl border-none shadow-lg bg-[#103927] text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <CardHeader>
                <CardTitle className="text-sm font-sans opacity-70 uppercase tracking-widest">
                  Produtos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-serif">{myProducts.length}</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-sans text-muted-foreground uppercase tracking-widest">
                  Parceiros Conectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-serif text-[#1C1917]">
                  {connections.filter((c) => c.status === "approved").length}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-sans text-muted-foreground uppercase tracking-widest">
                  Solicitações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-serif text-[#D4AF37]">
                  {connections.filter((c) => c.status === "pending").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-foreground">Acervo</h2>
            <Button
              onClick={() => {
                setEditingId(null);
                setActiveTab("new-product");
              }}
              className="bg-primary text-primary-foreground rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Peça
            </Button>
          </div>
          {myProducts.length === 0 ? (
            <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-serif text-foreground">O acervo está vazio</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myProducts.map((product) => (
                <Card
                  key={product.id}
                  className="rounded-2xl border-none shadow-lg hover:shadow-xl transition-all duration-500 bg-white overflow-hidden group cursor-pointer"
                  onClick={() => handleEditProduct(product)}
                >
                  <div className="h-56 bg-secondary/20 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir peça?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-destructive rounded-xl"
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-serif font-medium text-foreground">{product.name}</CardTitle>
                        <CardDescription className="font-sans text-xs tracking-widest uppercase mt-1">
                          {product.category}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {product.sku_manufacturer || "---"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl"
                      onClick={() => handleEditProduct(product)}
                    >
                      Ver Ficha Técnica <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new-product">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-border/50">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif">{editingId ? "Editando Peça" : "Nova Peça"}</h3>
                  {editingId && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setNewProduct({
                          name: "",
                          category: "",
                          sku: "",
                          description: "",
                          dimensions: [""],
                          image_url: "",
                        });
                        setSelectedMaterials([]);
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nome</Label>
                      <Input
                        className="h-12 rounded-xl bg-secondary/10 border-0 focus:ring-1 focus:ring-[#103927] text-lg"
                        placeholder="Ex: Poltrona Alta"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</Label>
                      <Input
                        className="h-12 rounded-xl bg-secondary/10 border-0 focus:ring-1 focus:ring-[#103927]"
                        placeholder="Assentos"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fotografia</Label>
                    <div
                      onClick={() => document.getElementById("img-up")?.click()}
                      className="relative h-64 bg-secondary/10 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/20 transition-all overflow-hidden group"
                    >
                      {newProduct.image_url ? (
                        <img src={newProduct.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <UploadCloud className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <span>Upload Imagem</span>
                        </div>
                      )}
                      {newProduct.image_url && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
                          Trocar Imagem
                        </div>
                      )}
                    </div>
                    <input
                      id="img-up"
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Materiais Selecionados
                    </Label>
                    <div className="min-h-[80px] p-4 rounded-2xl bg-secondary/10 flex flex-wrap gap-2">
                      {selectedMaterials.length === 0 && (
                        <span className="text-sm text-muted-foreground italic">Selecione na paleta ao lado...</span>
                      )}
                      {selectedMaterials.map((m) => (
                        <Badge
                          key={m.id}
                          variant="secondary"
                          className="bg-white pl-1 pr-3 py-1 h-8 rounded-full border border-border cursor-pointer hover:border-red-300 hover:text-red-500 transition-colors"
                          onClick={() => toggleMaterial(m)}
                        >
                          {m.image_url ? (
                            <img src={m.image_url} className="w-6 h-6 rounded-full mr-2 object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
                          )}
                          {m.name}
                          <X className="w-3 h-3 ml-2 opacity-50" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full h-14 rounded-2xl bg-[#1C1917] text-white text-lg hover:bg-black shadow-xl transition-all"
                    onClick={handleSaveProduct}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Salvar Ficha Técnica"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-5 flex flex-col h-full">
              <div className="bg-white rounded-[2rem] shadow-xl border border-border/50 flex flex-col h-[800px] overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/5">
                  <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#103927]" /> Acervo de Materiais
                  </h3>
                  <div className="flex gap-2">
                    <Select
                      value={selectedCategory}
                      onValueChange={(v) => {
                        setSelectedCategory(v);
                        setSelectedSupplierId("todos");
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-white border-border">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Madeiras">Madeiras</SelectItem>
                        <SelectItem value="Tecidos">Tecidos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                      <SelectTrigger className="h-10 rounded-xl bg-white border-border">
                        <SelectValue placeholder="Fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {uniqueSuppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ScrollArea className="flex-1 bg-[#FAFAF9]">
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {displayedMaterials.map((m) => {
                      const isSelected = selectedMaterials.some((x) => x.id === m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMaterial(m)}
                          className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${isSelected ? "ring-2 ring-[#103927] border-transparent shadow-lg" : "border-border hover:border-[#103927]/50 hover:shadow-md"}`}
                        >
                          <div className="aspect-square relative">
                            {m.image_url ? (
                              <img src={m.image_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-muted-foreground">
                                <ImageIcon />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#103927]/20 flex items-center justify-center">
                                <div className="bg-[#103927] text-white rounded-full p-1">
                                  <Check className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs font-medium truncate">{m.name}</p>
                              <p className="text-[10px] opacity-80 truncate">{m.supplier_name}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL DE APROVAÇÃO E REGRAS (NOVO) */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Definir Regras de Parceiro</DialogTitle>
            <DialogDescription>Configure as condições comerciais para este especificador.</DialogDescription>
          </DialogHeader>
          {selectedConnection && (
            <div className="bg-secondary/10 p-4 rounded-xl mb-4 text-sm space-y-1 border border-border/50">
              <p>
                <strong className="text-foreground">Logística:</strong>{" "}
                {selectedConnection.application_data.logistics?.toUpperCase()}
              </p>
              <p>
                <strong className="text-foreground">Modelo:</strong>{" "}
                {selectedConnection.application_data.salesModel?.toUpperCase()}
              </p>
            </div>
          )}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Comissão Autorizada (%)</Label>
              <Input
                type="number"
                className="h-12 rounded-xl text-lg font-medium bg-secondary/5"
                value={negotiation.commission}
                onChange={(e) => setNegotiation({ ...negotiation, commission: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Região de Atuação</Label>
              <Input
                className="h-12 rounded-xl bg-secondary/5"
                value={negotiation.region}
                onChange={(e) => setNegotiation({ ...negotiation, region: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsApproveOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={confirmApproval} className="rounded-xl bg-[#103927] text-white px-8">
              {loading ? <Loader2 className="animate-spin" /> : "Homologar Parceiro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FabricaDashboard;
