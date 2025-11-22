import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Settings,
  LogOut,
  Image as ImageIcon,
  Check,
  Loader2,
  Search,
  X,
  ArrowRight,
  Pencil,
  Trash2,
  UploadCloud,
  MapPin,
  Instagram,
  Globe,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [allMaterials, setAllMaterials] = useState<MaterialData[]>([]);
  const [myProducts, setMyProducts] = useState<ProductData[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);

  // UI States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("todos");
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Fetchers
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

  // Actions
  const handleConnectionAction = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("commercial_connections").update({ status }).eq("id", id);
    toast({
      title: status === "approved" ? "Parceiro Aprovado" : "Solicitação Rejeitada",
      className: status === "approved" ? "bg-[#103927] text-white" : "",
    });
    fetchConnections();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `product-${userId}-${Math.random()}.${file.name.split(".").pop()}`;
    await supabase.storage.from("material-images").upload(fileName, file);
    const { data } = supabase.storage.from("material-images").getPublicUrl(fileName);
    setNewProduct((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  // Logic
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
  const displayedMaterials = allMaterials.filter(
    (m) =>
      (selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory) &&
      (selectedSupplierId === "todos" || m.supplier_id === selectedSupplierId),
  );
  function getCategoryGroup(type: string) {
    if (["Madeira Maciça", "Lâmina Natural"].includes(type)) return "Madeiras";
    if (["Tecido Plano", "Couro Natural"].includes(type)) return "Tecidos";
    return "Outros";
  }

  const toggleMaterial = (m: MaterialData) => {
    selectedMaterials.find((x) => x.id === m.id)
      ? setSelectedMaterials(selectedMaterials.filter((x) => x.id !== m.id))
      : setSelectedMaterials([...selectedMaterials, m]);
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setLoading(true);
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
    } else {
      const { data } = await supabase.from("products").insert(payload).select().single();
      if (data) pid = data.id;
    }
    if (selectedMaterials.length > 0 && pid) {
      await supabase
        .from("product_materials")
        .insert(selectedMaterials.map((m) => ({ product_id: pid, material_id: m.id })));
    }
    toast({ title: "Sucesso", className: "bg-[#103927] text-white" });
    setEditingId(null);
    setNewProduct({ name: "", category: "", sku: "", description: "", dimensions: [""], image_url: "" });
    setSelectedMaterials([]);
    fetchMyProducts();
    setLoading(false);
  };

  const handleEditProduct = async (p: ProductData) => {
    setEditingId(p.id);
    setNewProduct({ ...p });
    const { data } = await supabase.from("product_materials").select("material_id").eq("product_id", p.id);
    if (data) setSelectedMaterials(allMaterials.filter((m) => data.some((d) => d.material_id === m.id)));
    setActiveTab("new-product");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
      {/* HEADER MINIMALISTA */}
      <header className="flex justify-between items-end mb-12 pb-6 border-b border-border/40">
        <div>
          <h2 className="text-sm font-sans tracking-[0.2em] uppercase text-muted-foreground mb-2">Área da Fábrica</h2>
          <h1 className="text-4xl font-serif font-medium text-foreground">Gestão de Coleções</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-full border-border hover:bg-secondary/50" onClick={signOut}>
            Sair
          </Button>
          <Button
            className="rounded-full bg-[#103927] hover:bg-[#0A261A] text-white px-6"
            onClick={() => {
              setEditingId(null);
              setActiveTab("new-product");
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Peça
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-white/80 backdrop-blur p-1.5 rounded-full border border-border/60 shadow-sm inline-flex h-auto">
            {["overview", "products", "partners", "new-product"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-full px-8 py-2.5 text-sm font-medium data-[state=active]:bg-[#1C1917] data-[state=active]:text-white transition-all"
              >
                {tab === "overview" && "Painel"}
                {tab === "products" && "Acervo"}
                {tab === "partners" && "Parceiros"}
                {tab === "new-product" && (editingId ? "Editor" : "Criar")}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* VISÃO GERAL (Dashboard Real) */}
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

        {/* PARCEIROS (Lista Elegante) */}
        <TabsContent value="partners">
          <div className="grid gap-6 max-w-5xl mx-auto">
            {connections.filter((c) => c.status === "pending").length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif text-xl">Novas Solicitações</h3>
                {connections
                  .filter((c) => c.status === "pending")
                  .map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 bg-secondary text-secondary-foreground">
                          <AvatarFallback>{conn.application_data?.type?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-lg">{conn.application_data?.type.toUpperCase()}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {conn.application_data?.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Instagram className="w-3 h-3" /> {conn.application_data?.social}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleConnectionAction(conn.id, "rejected")}
                          variant="ghost"
                          className="rounded-full hover:text-destructive"
                        >
                          Recusar
                        </Button>
                        <Button
                          onClick={() => handleConnectionAction(conn.id, "approved")}
                          className="rounded-full bg-[#103927] hover:bg-[#0A261A] text-white px-6"
                        >
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* EDITOR DE PRODUTO (O Redesign Principal) */}
        <TabsContent value="new-product">
          <div className="grid grid-cols-12 gap-8">
            {/* Lado Esquerdo: O Produto (Visual Clean) */}
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

            {/* Lado Direito: A Paleta de Materiais (Estilo Pinterest/Mesa de Trabalho) */}
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

        {/* ACERVO (Vitrine Interna) */}
        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {myProducts.map((p) => (
              <Card
                key={p.id}
                className="rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer"
                onClick={() => handleEditProduct(p)}
              >
                <div className="h-64 relative overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <ImageIcon className="opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" className="rounded-full bg-white/90 text-black backdrop-blur">
                      Editar Peça
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-xl">{p.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{p.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {p.sku_manufacturer || "---"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FabricaDashboard;
