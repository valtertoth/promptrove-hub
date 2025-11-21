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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "",
    description: "",
    sku_supplier: "",
  });

  // Buscar materiais ao carregar a tela
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
      const { error } = await supabase.from("materials").insert({
        supplier_id: userId,
        name: newMaterial.name,
        type: newMaterial.type,
        sku_supplier: newMaterial.sku_supplier,
        description: newMaterial.description,
      });

      if (error) throw error;

      toast({
        title: "Material Cadastrado",
        description: "Sua matéria-prima já está disponível no catálogo.",
        className: "bg-emerald-600 text-white border-none shadow-lg",
      });

      setNewMaterial({ name: "", type: "", description: "", sku_supplier: "" });
      fetchMaterials(); // Atualiza a lista imediatamente
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

      <Tabs defaultValue="catalog" className="space-y-8">
        {/* Menu de Navegação Estilizado */}
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
              <Plus className="mr-2 h-4 w-4" /> Novo Material
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTEÚDO: Visão Geral */}
        <TabsContent value="overview">
          <Card className="rounded-2xl border-none shadow-sm bg-white h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <LayoutDashboard className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Dashboard Analítico em Desenvolvimento</p>
            </div>
          </Card>
        </TabsContent>

        {/* CONTEÚDO: Meu Catálogo (ONDE OS DADOS APARECEM) */}
        <TabsContent value="catalog">
          {materials.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <PackageOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum material cadastrado</h3>
              <p className="text-gray-500 mb-6">Comece adicionando suas matérias-primas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {materials.map((material) => (
                <Card
                  key={material.id}
                  className="group rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden cursor-pointer"
                >
                  <div className="h-40 bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                    </div>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-medium uppercase tracking-wide text-gray-600">
                      {material.type}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 truncate">{material.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">Ref: {material.sku_supplier || "S/N"}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {material.description || "Sem descrição técnica."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CONTEÚDO: Novo Material (Cadastro) */}
        <TabsContent value="new-material">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/40 border-b border-gray-100 pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-medium text-gray-800">Detalhes da Matéria-Prima</CardTitle>
                  <CardDescription>Cadastre seus tecidos, madeiras ou metais para as fábricas.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Nome Comercial <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Linho Cru Premium, Carvalho Americano"
                      className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-gray-700">
                        Tipo de Material <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}>
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
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer bg-gray-50/50 group">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                      <ImageIcon className="h-8 w-8 text-gray-300 group-hover:text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                      Clique para enviar foto
                    </span>
                    <span className="text-xs text-gray-400 mt-1">JPG ou PNG até 5MB</span>
                  </div>
                </CardContent>
              </Card>

              {/* BOTÃO REFEITO - VISUAL LUXO/TECH */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-14 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-base flex items-center justify-center gap-2"
                onClick={handleSaveMaterial}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {loading ? "Salvando..." : "Cadastrar Matéria-Prima"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FornecedorDashboard;
