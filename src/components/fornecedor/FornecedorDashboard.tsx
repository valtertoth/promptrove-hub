import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Plus,
  LayoutDashboard,
  Layers,
  Settings,
  LogOut,
  Image as ImageIcon,
  Loader2,
  PackageOpen,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  Search,
  ScanLine,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

interface FornecedorDashboardProps {
  userId: string;
}

interface Material {
  id: string;
  name: string;
  type: string;
  description: string;
  sku_supplier: string;
  image_url: string | null;
  is_active: boolean;
  categoria_id: string | null;
}

interface Categoria {
  id: string;
  nome: string;
}

const FornecedorDashboard = ({ userId }: FornecedorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedorId, setFornecedorId] = useState<string | null>(null);
  const [fornecedorNome, setFornecedorNome] = useState<string>("");
  const [activeTab, setActiveTab] = useState("catalog");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "",
    description: "",
    sku_supplier: "",
    image_url: "",
    categoria_id: "",
  });

  useEffect(() => {
    fetchFornecedor();
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (fornecedorId) {
      fetchMaterials();
    }
  }, [fornecedorId]);

  const fetchFornecedor = async () => {
    const { data } = await supabase
      .from("fornecedor")
      .select("id, nome")
      .eq("user_id", userId)
      .single();
    if (data) {
      setFornecedorId(data.id);
      setFornecedorNome(data.nome);
    }
  };

  const fetchCategorias = async () => {
    const { data } = await supabase
      .from("categorias_material")
      .select("id, nome")
      .eq("ativo", true)
      .order("ordem");
    if (data) setCategorias(data);
  };

  const fetchMaterials = async () => {
    if (!fornecedorId) return;
    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("supplier_id", fornecedorId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setMaterials(data);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const fileName = `${userId}-${Math.random()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("material-images").upload(fileName, file);
      const { data } = supabase.storage.from("material-images").getPublicUrl(fileName);
      setNewMaterial((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Amostra carregada" });
    } catch (error: any) {
      toast({ title: "Erro", description: "Máx 2MB.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMaterial = async () => {
    if (!newMaterial.name || !newMaterial.type || !fornecedorId) {
      toast({ title: "Erro", description: "Dados incompletos.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const payload = {
      supplier_id: fornecedorId,
      supplier_name: fornecedorNome,
      name: newMaterial.name,
      type: newMaterial.type,
      sku_supplier: newMaterial.sku_supplier,
      description: newMaterial.description,
      image_url: newMaterial.image_url,
      categoria_id: newMaterial.categoria_id || null,
      is_active: true,
    };
    if (editingId) await supabase.from("materials").update(payload).eq("id", editingId);
    else await supabase.from("materials").insert(payload);
    toast({ title: "Salvo com sucesso", className: "bg-[#103927] text-white" });
    setNewMaterial({ name: "", type: "", description: "", sku_supplier: "", image_url: "", categoria_id: "" });
    setEditingId(null);
    fetchMaterials();
    setActiveTab("catalog");
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("materials").update({ is_active: false }).eq("id", id);
    toast({ title: "Material Arquivado" });
    fetchMaterials();
  };

  const handleEditClick = (m: Material) => {
    setEditingId(m.id);
    setNewMaterial({ 
      name: m.name,
      type: m.type,
      description: m.description || "",
      sku_supplier: m.sku_supplier || "",
      image_url: m.image_url || "",
      categoria_id: m.categoria_id || ""
    });
    setActiveTab("new-material");
  };
  const filteredMaterials = materials.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
      <header className="flex justify-between items-end mb-12 pb-6 border-b border-border/40">
        <div>
          <h2 className="text-sm font-sans tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Área do Fornecedor
          </h2>
          <h1 className="text-4xl font-serif font-medium text-foreground">Acervo de Materiais</h1>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => window.location.href = '/profile'} variant="outline" className="rounded-xl">
            <Settings className="mr-2 h-4 w-4" />
            Meu Perfil
          </Button>
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">
            Sair
          </Button>
          <Button
            className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-6"
            onClick={() => {
              setEditingId(null);
              setActiveTab("new-material");
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Item
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-white/80 backdrop-blur p-1.5 rounded-full border border-border/60 shadow-sm inline-flex">
            <TabsTrigger
              value="overview"
              className="rounded-full px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            >
              Painel
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="rounded-full px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            >
              Catálogo
            </TabsTrigger>
            <TabsTrigger
              value="new-material"
              className="rounded-full px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            >
              {editingId ? "Editor" : "Cadastro"}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="catalog">
          <div className="mb-8 relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, tipo ou referência..."
              className="pl-14 h-14 rounded-full bg-white border-transparent shadow-sm text-lg focus:ring-2 focus:ring-blue-700/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="text-center py-24 bg-white/50 rounded-[3rem] border border-dashed">
              <PackageOpen className="h-16 w-16 mx-auto text-blue-200 mb-6" />
              <h3 className="text-2xl font-serif text-foreground">Acervo Vazio</h3>
              <p className="text-muted-foreground mt-2">Comece a digitalizar suas texturas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="group rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden cursor-pointer"
                >
                  <div className="h-64 relative overflow-hidden">
                    {material.image_url ? (
                      <img
                        src={material.image_url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 opacity-10" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-foreground shadow-sm">
                      {material.type}
                    </span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <Button
                        size="icon"
                        className="rounded-full bg-white text-foreground hover:bg-blue-50"
                        onClick={() => handleEditClick(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" className="rounded-full bg-white text-destructive hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Arquivar?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Não</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(material.id)}
                              className="bg-destructive rounded-xl"
                            >
                              Sim, Arquivar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-serif font-medium text-xl truncate text-foreground">{material.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2 font-mono flex items-center gap-2">
                      <ScanLine className="w-3 h-3" /> {material.sku_supplier || "S/REF"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new-material">
          <div className="grid gap-12 md:grid-cols-12 max-w-6xl mx-auto">
            <div className="md:col-span-7 space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-border/50">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-serif text-blue-900">{editingId ? "Editando Item" : "Nova Amostra"}</h3>
                  {editingId && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setNewMaterial({ name: "", type: "", description: "", sku_supplier: "", image_url: "", categoria_id: "" });
                        setActiveTab("catalog");
                      }}
                      className="rounded-full"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Nome do Material</Label>
                    <Input
                      className="h-14 rounded-2xl bg-secondary/10 border-0 text-lg focus:ring-1 focus:ring-blue-700"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                      placeholder="Ex: Carvalho Americano"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-xs tracking-wider text-muted-foreground">Categoria</Label>
                      <Select
                        value={newMaterial.categoria_id}
                        onValueChange={(val) => {
                          const cat = categorias.find(c => c.id === val);
                          setNewMaterial({ 
                            ...newMaterial, 
                            categoria_id: val,
                            type: cat?.nome || newMaterial.type
                          });
                        }}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-secondary/10 border-0">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {categorias.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-xs tracking-wider text-muted-foreground">Referência / SKU</Label>
                      <Input
                        className="h-14 rounded-2xl bg-secondary/10 border-0"
                        value={newMaterial.sku_supplier}
                        onChange={(e) => setNewMaterial({ ...newMaterial, sku_supplier: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">
                      Especificações Técnicas
                    </Label>
                    <Textarea
                      className="min-h-[120px] rounded-2xl bg-secondary/10 border-0 p-5 text-base"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      placeholder="Gramatura, resistência, acabamento..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-border/50 h-full flex flex-col">
                <h4 className="font-serif text-xl mb-6">Textura Digital</h4>
                <div
                  onClick={() => document.getElementById("up-mat")?.click()}
                  className="flex-1 min-h-[300px] rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all overflow-hidden relative group"
                >
                  {newMaterial.image_url ? (
                    <img src={newMaterial.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-blue-300">
                      <UploadCloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <span className="font-medium">Upload da Textura</span>
                    </div>
                  )}
                  {newMaterial.image_url && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
                      Trocar Imagem
                    </div>
                  )}
                  <input id="up-mat" type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </div>
                <Button
                  className={`w-full h-14 mt-6 text-lg rounded-2xl shadow-xl ${editingId ? "bg-blue-900" : "bg-blue-700 hover:bg-blue-800"}`}
                  onClick={handleSaveMaterial}
                  disabled={loading || uploading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Salvar no Acervo"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="overview">
          <div className="text-center py-24 opacity-50">Dashboard em breve.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FornecedorDashboard;
