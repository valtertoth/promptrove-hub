import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Plus, LayoutDashboard, Layers, Settings, LogOut, Image as ImageIcon, Save, Loader2, PackageOpen, Pencil, Trash2, X, UploadCloud, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  is_active: boolean; // Novo campo controlado
}

const FornecedorDashboard = ({ userId }: FornecedorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "",
    description: "",
    sku_supplier: "",
    image_url: ""
  });

  useEffect(() => {
    fetchMaterials();
  }, [userId]);

  const fetchMaterials = async () => {
    // AGORA FILTRAMOS APENAS OS ATIVOS (is_active = true)
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('supplier_id', userId)
      .eq('is_active', true) 
      .order('created_at', { ascending: false });
    
    if (data) setMaterials(data);
    if (error) console.error("Erro ao buscar:", error);
  };

  // Lógica de Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('material-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('material-images')
        .getPublicUrl(filePath);

      setNewMaterial(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Imagem carregada", className: "bg-green-600 text-white border-none" });

    } catch (error: any) {
      toast({ title: "Erro no upload", description: "Máx 2MB.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (material: Material) => {
    setEditingId(material.id);
    setNewMaterial({
      name: material.name,
      type: material.type,
      description: material.description || "",
      sku_supplier: material.sku_supplier || "",
      image_url: material.image_url || ""
    });
    setActiveTab("new-material");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMaterial({ name: "", type: "", description: "", sku_supplier: "", image_url: "" });
    setActiveTab("catalog");
  };

  // --- NOVA LÓGICA DE EXCLUSÃO (SOFT DELETE) ---
  const handleDelete = async (id: string) => {
    // Ao invés de .delete(), fazemos um .update() escondendo o item
    const { error } = await supabase
      .from('materials')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      toast({ 
        title: "Material Arquivado", 
        description: "O item foi removido da sua lista, mas mantido no histórico de produtos que já o utilizam.",
        className: "bg-gray-800 text-white border-none" 
      });
      fetchMaterials(); // Recarrega a lista (o item vai sumir pois filtramos is_active=true)
    } else {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveMaterial = async () => {
    if (!newMaterial.name || !newMaterial.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e o tipo do material.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Adicionei o nome da empresa fictício ou real se tivéssemos no profile
      // Aqui vamos assumir que o backend pegaria, ou salvamos manual
      // Por enquanto salvamos sem supplier_name vindo do form, pois isso deveria vir do Profile do User
      
      const materialData = {
        supplier_id: userId,
        name: newMaterial.name,
        type: newMaterial.type,
        sku_supplier: newMaterial.sku_supplier,
        description: newMaterial.description,
        image_url: newMaterial.image_url,
        is_active: true // Garante que nasce ativo
      };

      if (editingId) {
        const { error } = await supabase.from('materials').update(materialData).eq('id', editingId);
        if (error) throw error;
        toast({ title: "Material Atualizado", className: "bg-blue-600 text-white border-none" });
      } else {
        const { error } = await supabase.from('materials').insert(materialData);
        if (error) throw error;
        toast({ title: "Material Cadastrado", className: "bg-emerald-600 text-white border-none" });
      }

      setNewMaterial({ name: "", type: "", description: "", sku_supplier: "", image_url: "" });
      setEditingId(null);
      fetchMaterials();
      setActiveTab("catalog");

    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 font-sans text-slate-800">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Portal do <span className="font-semibold text-blue-600">Fornecedor</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerencie seu catálogo de matérias-primas de alto padrão.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <Settings className="mr-2 h-4 w-4" /> Minha Empresa
          </Button>
          <Button onClick={signOut} variant="ghost" className="h-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex justify-start">
            <TabsList className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex h-auto gap-1">
            <TabsTrigger value="overview" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 transition-all">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="catalog" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 transition-all">
                <Layers className="mr-2 h-4 w-4" /> Meu Catálogo <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full text-xs">{materials.length}</span>
            </TabsTrigger>
            <TabsTrigger value="new-material" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-500 transition-all">
                {editingId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingId ? "Editando Material" : "Novo Material"}
            </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="overview">
             <Card className="rounded-2xl border-none shadow-sm bg-white h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <LayoutDashboard className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>Dashboard Analítico em Desenvolvimento</p>
                </div>
             </Card>
        </TabsContent>
        
        <TabsContent value="catalog">
             <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Filtrar por nome ou tipo..." 
                    className="pl-10 rounded-xl border-gray-200 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             {filteredMaterials.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                     <PackageOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                     <h3 className="text-lg font-medium text-gray-900">Nenhum material encontrado</h3>
                     <p className="text-gray-500 mb-6">Cadastre novas matérias-primas para começar.</p>
                     <Button onClick={() => setActiveTab("new-material")} variant="outline" className="rounded-xl">Criar agora</Button>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {filteredMaterials.map((material) => (
                         <Card key={material.id} className="group rounded-2xl border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                            <div className="h-48 bg-gray-100 relative group-hover:bg-gray-50 transition-colors overflow-hidden">
                                {material.image_url ? (
                                    <img src={material.image_url} alt={material.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <ImageIcon className="h-8 w-8 opacity-30" />
                                    </div>
                                )}
                                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm border border-gray-100/50">
                                    {material.type}
                                </span>
                                
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" className="h-8 w-8 rounded-lg bg-white text-gray-700 hover:text-blue-600 shadow-sm border border-gray-100" onClick={() => handleEditClick(material)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="icon" className="h-8 w-8 rounded-lg bg-white text-gray-700 hover:text-red-600 shadow-sm border border-gray-100">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="rounded-2xl">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Arquivar Material?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Este item será removido da sua lista ativa, mas permanecerá no histórico dos produtos que já o utilizam.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(material.id)} className="bg-red-600 rounded-xl hover:bg-red-700">Sim, Arquivar</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-gray-900 truncate text-lg">{material.name}</h3>
                                <p className="text-sm text-gray-500