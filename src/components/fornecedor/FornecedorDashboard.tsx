import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Save,
  Loader2,
  PackageOpen,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  Search,
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
    image_url: "",
  });

  useEffect(() => {
    fetchMaterials();
  }, [userId]);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from("materials")
      .select("*")
      .eq("supplier_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setMaterials(data);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("material-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("material-images").getPublicUrl(fileName);
      setNewMaterial((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Imagem carregada" });
    } catch (error: any) {
      toast({ title: "Erro", description: "Máx 2MB.", variant: "destructive" });
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
    const { error } = await supabase.from("materials").update({ is_active: false }).eq("id", id);
    if (!error) {
      toast({ title: "Material Arquivado" });
      fetchMaterials();
    }
  };

  const handleSaveMaterial = async () => {
    if (!newMaterial.name || !newMaterial.type) {
      toast({ title: "Erro", description: "Preencha nome e tipo.", variant: "destructive" });
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
        image_url: newMaterial.image_url,
        is_active: true,
      };
      if (editingId) {
        await supabase.from("materials").update(materialData).eq("id", editingId);
        toast({ title: "Atualizado", className: "bg-primary text-white border-none" });
      } else {
        await supabase.from("materials").insert(materialData);
        toast({ title: "Cadastrado", className: "bg-primary text-white border-none" });
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

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground transition-colors duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-medium text-foreground">
            Portal do <span className="italic text-blue-700">Fornecedor</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-light">
            Gerencie seu catálogo de matérias-primas de alto padrão.
          </p>
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
            className="rounded-full px-6 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="rounded-full px-6 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
          >
            Meu Catálogo
          </TabsTrigger>
          <TabsTrigger
            value="new-material"
            className="rounded-full px-6 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
          >
            {editingId ? "Editor" : "Novo Material"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar..."
              className="pl-12 h-12 rounded-xl bg-white border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-24 bg-white/50 rounded-3xl border border-dashed">
              <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-xl font-serif text-foreground">Nenhum material</h3>
              <Button onClick={() => setActiveTab("new-material")} variant="link" className="mt-2 text-blue-700">
                Cadastrar primeiro item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="group rounded-2xl border-none shadow-md hover:shadow-xl transition-all duration-500 bg-white overflow-hidden"
                >
                  <div className="h-56 bg-secondary/20 relative group-hover:bg-secondary/30 transition-colors overflow-hidden">
                    {material.image_url ? (
                      <img
                        src={material.image_url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
                      {material.type}
                    </span>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-white text-foreground hover:text-blue-600 shadow-sm"
                        onClick={() => handleEditClick(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-white text-foreground hover:text-destructive shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Arquivar?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(material.id)}
                              className="bg-destructive rounded-xl"
                            >
                              Arquivar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-serif font-medium text-lg truncate text-foreground">{material.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      REF: {material.sku_supplier || "---"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new-material">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-secondary/10 pb-6 pt-6">
                  <CardTitle className="text-2xl font-serif text-blue-900">
                    {editingId ? "Editando" : "Ficha do Material"}
                  </CardTitle>
                  {editingId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="absolute top-6 right-6 rounded-xl"
                    >
                      Cancelar
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid gap-2">
                    <Label>Nome Comercial</Label>
                    <Input
                      className="h-12 rounded-xl bg-secondary/10 border-transparent focus:bg-white"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tipo</Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-secondary/10 border-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectGroup>
                            <SelectLabel>Madeiras</SelectLabel>
                            <SelectItem value="Madeira Maciça">Madeira Maciça</SelectItem>
                            <SelectItem value="Lâmina Natural">Lâmina Natural</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Tecidos</SelectLabel>
                            <SelectItem value="Tecido Plano">Tecido Plano</SelectItem>
                            <SelectItem value="Couro Natural">Couro Natural</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Metais</SelectLabel>
                            <SelectItem value="Aço Carbono">Aço Carbono</SelectItem>
                            <SelectItem value="Alumínio">Alumínio</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Pedras</SelectLabel>
                            <SelectItem value="Mármore">Mármore</SelectItem>
                            <SelectItem value="Granito">Granito</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Ref</Label>
                      <Input
                        className="h-12 rounded-xl bg-secondary/10 border-transparent"
                        value={newMaterial.sku_supplier}
                        onChange={(e) => setNewMaterial({ ...newMaterial, sku_supplier: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrição</Label>
                    <Textarea
                      className="min-h-[100px] rounded-xl bg-secondary/10 border-transparent p-4"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="rounded-3xl border-none shadow-lg bg-white">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-serif">Amostra</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  {newMaterial.image_url ? (
                    <div className="relative rounded-2xl overflow-hidden h-64 border border-border group">
                      <img src={newMaterial.image_url} className="w-full h-full object-cover" />
                      <div
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => document.getElementById("up-mat")?.click()}
                      >
                        <UploadCloud className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="h-64 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/10"
                      onClick={() => document.getElementById("up-mat")?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="animate-spin text-blue-600" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                      )}
                    </div>
                  )}
                  <input id="up-mat" type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </CardContent>
              </Card>
              <Button
                className={`w-full h-14 text-lg font-serif rounded-2xl shadow-xl ${editingId ? "bg-blue-900" : "bg-blue-600"}`}
                onClick={handleSaveMaterial}
                disabled={loading || uploading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : editingId ? (
                  "Salvar Alterações"
                ) : (
                  "Cadastrar Material"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="overview">
          <div className="text-center py-24 opacity-50">Em construção.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FornecedorDashboard;
