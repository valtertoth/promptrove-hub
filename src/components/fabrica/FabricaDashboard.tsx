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
import { Plus, Package, Settings, LayoutDashboard, Save, Image as ImageIcon, Check, Loader2, Search, Factory, Building2, X, Layers, ArrowRight, Pencil, Trash2, UploadCloud, Users, UserCheck, UserX, Instagram, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface FabricaDashboardProps {
  userId: string;
}

interface MaterialData { id: string; name: string; type: string; supplier_id: string; supplier_name?: string; sku_supplier: string; image_url: string | null; }
interface ProductData { id: string; name: string; category: string; sku_manufacturer: string; description: string; dimensions: string[]; image_url: string | null; created_at: string; }
interface ConnectionRequest { id: string; specifier_id: string; status: string; created_at: string; application_data: any; }

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [allMaterials, setAllMaterials] = useState<MaterialData[]>([]);
  const [myProducts, setMyProducts] = useState<ProductData[]>([]);
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("todos");
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialData[]>([]);

  const [newProduct, setNewProduct] = useState({ name: "", category: "", sku: "", description: "", dimensions: [""], image_url: "" });

  useEffect(() => {
    fetchMaterials();
    fetchMyProducts();
    fetchConnections();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
    if (data) setAllMaterials(data);
  };

  const fetchMyProducts = async () => {
    const { data } = await supabase.from('products').select('*').eq('manufacturer_id', userId).order('created_at', { ascending: false });
    if (data) setMyProducts(data);
  };

  const fetchConnections = async () => {
    const { data } = await supabase.from('commercial_connections').select('*').eq('factory_id', userId).order('created_at', { ascending: false });
    if (data) setConnections(data);
  };

  const handleConnectionAction = async (connectionId: string, status: 'approved' | 'rejected') => {
      const { error } = await supabase.from('commercial_connections').update({ status }).eq('id', connectionId);
      if (!error) {
          toast({ title: status === 'approved' ? "Parceiro Aprovado" : "Solicitação Rejeitada", className: status === 'approved' ? "bg-green-600 text-white" : "bg-gray-800 text-white" });
          fetchConnections();
      } else {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('material-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('material-images').getPublicUrl(fileName);
      setNewProduct(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Imagem atualizada" });
    } catch (error: any) { toast({ title: "Erro", description: "Tente imagem menor.", variant: "destructive" }); } finally { setUploading(false); }
  };

  function getCategoryGroup(type: string) {
    if (["Madeira Maciça", "Lâmina Natural", "Lâmina Pré-Composta"].includes(type)) return "Madeiras";
    if (["Tecido Plano", "Couro Natural", "Couro Sintético", "Veludo"].includes(type)) return "Tecidos";
    if (["Aço Carbono", "Aço Inox", "Alumínio", "Latão"].includes(type)) return "Metais";
    if (["Mármore", "Granito", "Quartzito", "Sintético"].includes(type)) return "Pedras";
    return "Acabamentos Diversos";
  }

  const uniqueSuppliers = allMaterials
    .filter(m => selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory)
    .reduce((acc, current) => {
      const exists = acc.find(item => item.id === current.supplier_id);
      if (!exists) return acc.concat([{ id: current.supplier_id, name: current.supplier_name || "Fornecedor Sem Nome" }]);
      return acc;
    }, [] as { id: string, name: string }[]);

  const displayedMaterials = allMaterials.filter(m => {
    const categoryMatch = selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory;
    const supplierMatch = selectedSupplierId === "todos" || m.supplier_id === selectedSupplierId;
    return categoryMatch && supplierMatch;
  });

  const toggleMaterial = (material: MaterialData) => {
    if (selectedMaterials.find(m => m.id === material.id)) {
      setSelectedMaterials(selectedMaterials.filter(m => m.id !== material.id));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const groupedSelected = selectedMaterials.reduce((acc, mat) => {
    const group = getCategoryGroup(mat.type);
    if (!acc[group]) acc[group] = [];
    acc[group].push(mat);
    return acc;
  }, {} as Record<string, MaterialData[]>);

  const addDimension = () => setNewProduct({ ...newProduct, dimensions: [...newProduct.dimensions, ""] });
  const updateDimension = (index: number, val: string) => { const dims = [...newProduct.dimensions]; dims[index] = val; setNewProduct({ ...newProduct, dimensions: dims }); };
  const removeDimension = (index: number) => { const dims = newProduct.dimensions.filter((_, i) => i !== index); setNewProduct({ ...newProduct, dimensions: dims }); };

  const handleEditProduct = async (product: ProductData) => {
    setEditingId(product.id);
    setNewProduct({ name: product.name, category: product.category, sku: product.sku_manufacturer || "", description: product.description || "", dimensions: product.dimensions || [""], image_url: product.image_url || "" });
    const { data: links } = await supabase.from('product_materials').select('material_id').eq('product_id', product.id);
    if (links) { const linkedMaterials = allMaterials.filter(m => links.some(l => l.material_id === m.id)); setSelectedMaterials(linkedMaterials); }
    setActiveTab("new-product");
  };

  const handleCancelEdit = () => { setEditingId(null); setNewProduct({ name: "", category: "", sku: "", description: "", dimensions: [""], image_url: "" }); setSelectedMaterials([]); setActiveTab("products"); };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from('product_materials').delete().eq('product_id', id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { toast({ title: "Excluído" }); fetchMyProducts(); }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.category) { toast({ title: "Erro", description: "Campos obrigatórios.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const payload = { manufacturer_id: userId, name: newProduct.name, category: newProduct.category, sku_manufacturer: newProduct.sku, description: newProduct.description, dimensions: newProduct.dimensions, image_url: newProduct.image_url };
      let pid = editingId;
      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId);
        await supabase.from('product_materials').delete().eq('product_id', editingId);
        toast({ title: "Ficha Técnica Atualizada", className: "bg-primary text-white border-none" });
      } else {
        const { data } = await supabase.from('products').insert(payload).select().single();
        if (data) pid = data.id;
        toast({ title: "Produto Publicado", className: "bg-primary text-white border-none" });
      }
      if (selectedMaterials.length > 0 && pid) {
        const links = selectedMaterials.map(m => ({ product_id: pid, material_id: m.id }));
        await supabase.from('product_materials').insert(links);
      }
      handleCancelEdit();
      fetchMyProducts();
    } catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); } finally { setLoading(false); }
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
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">Sair</Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm inline-flex">
          <TabsTrigger value="overview" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Visão Geral</TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Portfólio</TabsTrigger>
          <TabsTrigger value="partners" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">Parceiros</TabsTrigger>
          <TabsTrigger value="new-product" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">{editingId ? "Editor" : "Novo Produto"}</TabsTrigger>
        </TabsList>

        <TabsContent value="partners">
            <div className="grid gap-6">
                <div>
                    <h3 className="text-xl font-serif text-foreground mb-4 flex items-center gap-2">
                        Solicitações Pendentes <Badge variant="secondary" className="rounded-full">{connections.filter(c => c.status === 'pending').length}</Badge>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {connections.filter(c => c.status === 'pending').map(conn => (
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
                                        <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent/50">Novo</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-3 pb-4">
                                    <div className="flex items-center gap-2"><Instagram className="w-4 h-4" /> {conn.application_data?.social}</div>
                                    <div className="bg-secondary/30 p-3 rounded-xl text-xs italic border border-border">"{conn.application_data?.about}"</div>
                                </CardContent>
                                <CardFooter className="gap-3 pt-0">
                                    <Button onClick={() => handleConnectionAction(conn.id, 'approved')} className="flex-1 bg-primary hover:bg-primary/90 rounded-xl">Aprovar</Button>
                                    <Button onClick={() => handleConnectionAction(conn.id, 'rejected')} variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl">Recusar</Button>
                                </CardFooter>
                            </Card>
                        ))}
                        {connections.filter(c => c.status === 'pending').length === 0 && <div className="col-span-2 py-12 text-center text-muted-foreground border border-dashed rounded-2xl">Tudo em dia. Nenhuma solicitação pendente.</div>}
                    </div>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-serif text-foreground mb-4">Rede Homologada</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {connections.filter(c => c.status === 'approved').map(conn => (
                            <div key={conn.id} className="flex items-center gap-4 p-4 bg-white border border-border rounded-2xl shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700"><UserCheck className="h-5 w-5" /></div>
                                <div><p className="font-medium text-foreground">{conn.application_data?.document}</p><p className="text-xs text-muted-foreground uppercase">{conn.application_data?.type}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="products">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-foreground">Acervo</h2>
                <Button onClick={() => { setEditingId(null); setActiveTab("new-product"); }} className="bg-primary text-primary-foreground rounded-xl"><Plus className="mr-2 h-4 w-4" /> Criar Peça</Button>
             </div>
             {myProducts.length === 0 ? ( <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" /><h3 className="text-xl font-serif text-foreground">O acervo está vazio</h3></div> ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {myProducts.map((product) => (
                         <Card key={product.id} className="rounded-2xl border-none shadow-lg hover:shadow-xl transition-all duration-500 bg-white overflow-hidden group">
                            <div className="h-56 bg-secondary/20 relative overflow-hidden">
                                {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex items-center justify-center h-full text-muted-foreground"><ImageIcon className="h-10 w-10 opacity-20" /></div>}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur" onClick={() => handleEditProduct(product)}><Pencil className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg