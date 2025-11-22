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
import {
  Plus,
  LayoutDashboard,
  Layers,
  Settings,
  LogOut,
  Image as ImageIcon,
  Save,
  Loader2,
  PackageOpen,
  Pencil,
  Trash2,
  X,
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
    sku_supplier: "",
  });

  useEffect(() => {
    fetchMaterials();
  }, [userId]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("supplier_id", userId)
      .order("created_at", { ascending: false });

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
      sku_supplier: material.sku_supplier || "",
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
    const { error } = await supabase.from("materials").delete().eq("id", id);
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
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // MODO ATUALIZAÇÃO (UPDATE)
        const { error } = await supabase
          .from("materials")
          .update({
            name: newMaterial.name,
            type: newMaterial.type,
            sku_supplier: newMaterial.sku_supplier,
            description: newMaterial.description,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Material Atualizado", className: "bg-blue-600 text-white border-none" });
      } else {
        // MODO CRIAÇÃO (INSERT)
        const { error } = await supabase.from("materials").insert({
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
          <Button
            variant="outline"
            className="h-10 rounded-xl border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
          >
            <Settings className="mr-2 h-4 w-4" /> Minha Empresa
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            className="h-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      {/* Controle de Abas via State para permitir navegação automática */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex justify-start">
          <TabsList className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 transition-all"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-500 transition-all"
            >
              <Layers className="mr-2 h-4 w-4" /> Meu Catálogo{" "}
              <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full text-xs">{materials.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="new-material"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-500 transition-all"
            >
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
              <Button onClick={() => setActiveTab("new-material")} variant="outline" className="rounded-xl">
                Criar agora
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {materials.map((material) => (
                <Card
                  key={material.id}
                  className="group rounded-2xl border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white overflow-hidden"
                >
                  {/* Área da Imagem */}
                  <div className="h-40 bg-gray-100 relative group-hover:bg-gray-50 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                    </div>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-medium uppercase tracking-wide text-gray-600 shadow-sm">
                      {material.type}
                    </span>

                    {/* Ações Flutuantes (Só aparecem no Hover) */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-100"
                        onClick={() => handleEditClick(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 shadow-sm border border-gray-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Material?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O material será removido do catálogo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(material.id)}
                              className="bg-red-600 rounded-xl hover:bg-red-700"
                            >
                              Sim, excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">{material.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Ref: <span className="font-mono text-xs text-gray-400">{material.sku_supplier || "S/N"}</span>
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-2">
                      {material.description || "Sem descrição técnica detalhada."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ABA FORMULÁRIO (Criação e Edição) */}
        <TabsContent value="new-material">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/40 border-b border-gray-100 pb-4 px-6 pt-6 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {editingId ? "Editando Matéria-Prima" : "Detalhes da Matéria-Prima"}
                    </CardTitle>
                    <CardDescription>
                      {editingId
                        ? "Ajuste as informações do item existente."
                        : "Cadastre seus tecidos, madeiras ou metais para as fábricas."}
                    </CardDescription>
                  </div>
                  {editingId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-gray-500 hover:text-gray-700 rounded-xl"
                    >
                      <X className="mr-2 h-4 w-4" /> Cancelar Edição
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Nome Comercial <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Linho Cru Premium, Carvalho Americano"
                      className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-gray-700">
                        Tipo de Material <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-blue-100">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="madeira">Madeira / Lâmina</SelectItem>
                          <SelectItem value="tecido">Tecido / Couro</SelectItem>
                          <SelectItem value="metal">Metal / Alumínio</SelectItem>
                          <SelectItem value="pedra">Pedra / Mármore</SelectItem>
                          <SelectItem value="corda">Corda Náutica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sku" className="text-gray-700">
                        Seu Código (Ref)
                      </Label>
                      <Input
                        id="sku"
                        placeholder="Ex: TEC-001"
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        value={newMaterial.sku_supplier}
                        onChange={(e) => setNewMaterial({ ...newMaterial, sku_supplier: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="desc" className="text-gray-700">
                      Descrição Técnica
                    </Label>
                    <Textarea
                      id="desc"
                      placeholder="Composição, gramatura, resistência UV, cuidados..."
                      className="min-h-[120px] rounded-xl border-gray-200 bg-gray-50/30 resize-none focus:bg-white focus:ring-2 focus:ring-blue-100 p-4"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-medium text-gray-800">Amostra Visual</CardTitle>
                  <CardDescription>Foto em alta qualidade da textura.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer bg-gray-50/50 group relative overflow-hidden">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <ImageIcon className="h-8 w-8 text-gray-300 group-hover:text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 relative z-10">
                      Clique para enviar foto
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* BOTÃO REFEITO E INTELIGENTE (SALVAR OU ATUALIZAR) */}
              <Button
                className={`w-full text-white font-semibold tracking-wide h-14 rounded-2xl shadow-xl transition-all active:scale-95 text-base flex items-center justify-center gap-2 ${
                  editingId
                    ? "bg-gray-900 hover:bg-black shadow-gray-900/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                }`}
                onClick={handleSaveMaterial}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : editingId ? (
                  <Save className="mr-2 h-5 w-5" />
                ) : (
                  <Plus className="mr-2 h-5 w-5" />
                )}
                {loading ? "Processando..." : editingId ? "Salvar Alterações" : "Cadastrar Matéria-Prima"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FornecedorDashboard;
