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
  UploadCloud,
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
}

const FornecedorDashboard = ({ userId }: FornecedorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Estado para o upload
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "",
    description: "",
    sku_supplier: "",
    image_url: "", // Novo campo para a URL da imagem
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

  // Lógica de Upload de Imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // 1. Criar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Subir para o Supabase Storage
      const { error: uploadError } = await supabase.storage.from("material-images").upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Pegar a URL pública
      const { data } = supabase.storage.from("material-images").getPublicUrl(filePath);

      // 4. Salvar URL no estado
      setNewMaterial((prev) => ({ ...prev, image_url: data.publicUrl }));

      toast({
        title: "Imagem carregada",
        description: "A foto foi enviada com sucesso.",
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: "Verifique se o tamanho é menor que 2MB.",
        variant: "destructive",
      });
      console.error(error);
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
      image_url: material.image_url || "",
    });
    setActiveTab("new-material");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMaterial({ name: "", type: "", description: "", sku_supplier: "", image_url: "" });
    setActiveTab("catalog");
  };

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
      const materialData = {
        supplier_id: userId,
        name: newMaterial.name,
        type: newMaterial.type,
        sku_supplier: newMaterial.sku_supplier,
        description: newMaterial.description,
        image_url: newMaterial.image_url, // Salvando a foto no banco
      };

      if (editingId) {
        const { error } = await supabase.from("materials").update(materialData).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Material Atualizado", className: "bg-blue-600 text-white border-none" });
      } else {
        const { error } = await supabase.from("materials").insert(materialData);
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 font-sans">
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
                  {/* IMAGEM NO CARD */}
                  <div className="h-48 bg-gray-100 relative group-hover:bg-gray-50 transition-colors overflow-hidden">
                    {material.image_url ? (
                      <img src={material.image_url} alt={material.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-medium uppercase tracking-wide text-gray-600 shadow-sm">
                      {material.type}
                    </span>

                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-white text-gray-700 hover:text-blue-600 shadow-sm border border-gray-100"
                        onClick={() => handleEditClick(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-white text-gray-700 hover:text-red-600 shadow-sm border border-gray-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Material?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(material.id)}
                              className="bg-red-600 rounded-xl"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">{material.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">Ref: {material.sku_supplier || "S/N"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new-material">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/40 border-b border-gray-100 pb-4 px-6 pt-6 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {editingId ? "Editando Matéria-Prima" : "Detalhes da Matéria-Prima"}
                    </CardTitle>
                    <CardDescription>Cadastre seus tecidos, madeiras ou metais.</CardDescription>
                  </div>
                  {editingId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-gray-500 hover:text-gray-700 rounded-xl"
                    >
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Comercial *</Label>
                    <Input
                      id="name"
                      className="h-12 rounded-xl bg-gray-50/30"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tipo *</Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-gray-50/30">
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
                      <Label>Ref</Label>
                      <Input
                        className="h-12 rounded-xl bg-gray-50/30"
                        value={newMaterial.sku_supplier}
                        onChange={(e) => setNewMaterial({ ...newMaterial, sku_supplier: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrição</Label>
                    <Textarea
                      className="min-h-[120px] rounded-xl bg-gray-50/30"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* COMPONENTE DE UPLOAD DE IMAGEM ATIVO */}
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-medium text-gray-800">Amostra Visual</CardTitle>
                  <CardDescription>Foto da textura (Max 2MB)</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  {newMaterial.image_url ? (
                    <div className="relative rounded-2xl overflow-hidden h-64 border border-gray-200 group">
                      <img src={newMaterial.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label htmlFor="image-upload" className="cursor-pointer text-white flex flex-col items-center">
                          <UploadCloud className="h-8 w-8 mb-2" />
                          <span className="text-sm">Trocar Imagem</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer bg-gray-50/50 group"
                    >
                      {uploading ? (
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                      ) : (
                        <>
                          <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-8 w-8 text-gray-300 group-hover:text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                            Clique para enviar foto
                          </span>
                        </>
                      )}
                    </label>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </CardContent>
              </Card>

              {/* BOTÃO CORRIGIDO (Tamanho e Estilo) */}
              <Button
                className={`w-full text-white font-semibold text-lg h-14 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  editingId
                    ? "bg-gray-900 hover:bg-black shadow-gray-900/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                }`}
                onClick={handleSaveMaterial}
                disabled={loading || uploading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : editingId ? (
                  <Save className="mr-2 h-6 w-6" />
                ) : (
                  <Plus className="mr-2 h-6 w-6" />
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
