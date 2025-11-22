import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutDashboard, Layers, Settings, LogOut, Image as ImageIcon, Save, Loader2, PackageOpen, Pencil, Trash2, X } from "lucide-react";
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
}

const FornecedorDashboard = ({ userId }: FornecedorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState("catalog"); // Controle manual da aba
  
  // Estado para saber se estamos editando alguém
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "",
    description: "",
    sku_supplier: ""
  });

  useEffect(() => {
    fetchMaterials();
  }, [userId]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('supplier_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setMaterials(data);
    if (error) console.error("Erro ao buscar:", error);
  };

  // Função para preparar a EDIÇÃO
  const handleEditClick = (material: Material) => {
    setEditingId(material.id);
    setNewMaterial({
      name: material.name,
      type: material.type,
      description: material.description || "",
      sku_supplier: material.sku_supplier || ""
    });
    setActiveTab("new-material"); // Leva o usuário para o formulário
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMaterial({ name: "", type: "", description: "", sku_supplier: "" });
    setActiveTab("catalog");
  };

  // Função para EXCLUIR
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (!error) {
      toast({ title: "Material excluído", className: "bg-gray-800 text-white border-none" });
      fetchMaterials();
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
      if (editingId) {
        // MODO ATUALIZAÇÃO (UPDATE)
        const { error } = await supabase
          .from('materials')
          .update({
            name: newMaterial.name,
            type: newMaterial.type,
            sku_supplier: newMaterial.sku_supplier,
            description: newMaterial.description,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Material Atualizado", className: "bg-blue-600 text-white border-none" });

      } else {
        // MODO CRIAÇÃO (INSERT)
        const { error } = await supabase
          .from('materials')
          .insert({
            supplier_id: userId,
            name: newMaterial.name,
            type: newMaterial.type,
            sku_supplier: newMaterial.sku_supplier,
            description: newMaterial.description,
          });

        if (error) throw error;
        toast({ title: "Material Cadastrado", className: "bg-emerald-600 text-white border-none" });
      }

      // Limpeza e Redirecionamento
      setNewMaterial({ name: "", type: "", description: "", sku_supplier: "" });
      setEditingId(null);
      fetchMaterials();
      setActiveTab("catalog"); // Volta para o catálogo após salvar

    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 font-sans">
      {/* Header */}
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

      {/* Controle de Abas via State para permitir navegação automática */}
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
        
        {/* ABA CATÁLOGO: Agora com botões de Ação */}
        <TabsContent value="catalog">
             {materials.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                     <PackageOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                     <h3 className="text-lg font-medium text-gray-900">Nenhum material cadastrado</h3>
                     <p className="text-gray-500 mb-6">Comece adicionando suas matérias-primas.</p>
                     <Button onClick={() => setActiveTab("new-material")} variant="outline" className="rounded-xl">Criar agora</Button>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {materials.map((material) => (
                         <Card key={material.id} className="group rounded-2xl border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                            {/* Área da Imagem */}
                            <div className="h-40 bg-gray-100 relative group-hover:bg-gray-50 transition-colors">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    <ImageIcon className="h-8 w-8 opacity-30" />