import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Package,
  Settings,
  LayoutDashboard,
  Save,
  Trash2,
  Image as ImageIcon,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface FabricaDashboardProps {
  userId: string;
}

// Interface do Material que vem do banco
interface MaterialData {
  id: string;
  name: string;
  type: string;
  sku_supplier: string;
  image_url: string | null;
}

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados de Dados
  const [availableMaterials, setAvailableMaterials] = useState<MaterialData[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);

  // Estado do Formulário
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    sku: "",
    description: "",
    dimensions: [""],
  });

  // 1. Buscar Materiais Reais ao carregar
  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase.from("materials").select("*").order("type", { ascending: true });

      if (data) setAvailableMaterials(data);
    };
    fetchMaterials();
  }, []);

  // Helpers de Dimensão
  const addDimension = () => setNewProduct({ ...newProduct, dimensions: [...newProduct.dimensions, ""] });
  const updateDimension = (index: number, val: string) => {
    const dims = [...newProduct.dimensions];
    dims[index] = val;
    setNewProduct({ ...newProduct, dimensions: dims });
  };
  const removeDimension = (index: number) => {
    const dims = newProduct.dimensions.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, dimensions: dims });
  };

  // Helper de Seleção de Material
  const toggleMaterial = (id: string) => {
    if (selectedMaterialIds.includes(id)) {
      setSelectedMaterialIds(selectedMaterialIds.filter((mId) => mId !== id));
    } else {
      setSelectedMaterialIds([...selectedMaterialIds, id]);
    }
  };

  // SALVAR PRODUTO (Lógica Pesada)
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.category) {
      toast({ title: "Erro", description: "Nome e Categoria são obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Salvar o Produto
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          manufacturer_id: userId,
          name: newProduct.name,
          category: newProduct.category,
          sku_manufacturer: newProduct.sku,
          description: newProduct.description,
          dimensions: newProduct.dimensions, // Supabase aceita Array de texto
        })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Criar os Vínculos (Produto <-> Materiais)
      if (selectedMaterialIds.length > 0 && productData) {
        const links = selectedMaterialIds.map((materialId) => ({
          product_id: productData.id,
          material_id: materialId,
        }));

        const { error: linkError } = await supabase.from("product_materials").insert(links);

        if (linkError) throw linkError;
      }

      toast({
        title: "Produto Publicado!",
        description: `${selectedMaterialIds.length} materiais vinculados com sucesso.`,
        className: "bg-green-600 text-white border-none",
      });

      // Reset
      setNewProduct({ name: "", category: "", sku: "", description: "", dimensions: [""] });
      setSelectedMaterialIds([]);
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Agrupar materiais por tipo para exibição
  const groupedMaterials = availableMaterials.reduce(
    (acc, material) => {
      if (!acc[material.type]) acc[material.type] = [];
      acc[material.type].push(material);
      return acc;
    },
    {} as Record<string, MaterialData[]>,
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 font-sans text-slate-800">
      {/* Cabeçalho */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Painel da <span className="font-semibold text-primary">Fábrica</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerencie seus produtos e conexões comerciais.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50">
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
          >
            Sair
          </Button>
        </div>
      </header>

      <Tabs defaultValue="new-product" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm w-full md:w-auto inline-flex">
          <TabsTrigger value="overview" className="rounded-xl px-6">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-6">
            <Package className="mr-2 h-4 w-4" /> Meus Produtos
          </TabsTrigger>
          <TabsTrigger
            value="new-product"
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-product">
          <div className="grid gap-8 md:grid-cols-3">
            {/* ESQUERDA: DADOS */}
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="bg-gray-50/40 border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-medium">Informações do Produto</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label>Nome do Produto</Label>
                    <Input
                      className="h-12 rounded-xl bg-gray-50/30"
                      placeholder="Ex: Mesa Jantar Orgânica"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Input
                        className="h-12 rounded-xl bg-gray-50/30"
                        placeholder="Mesa, Cadeira..."
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>SKU (Opcional)</Label>
                      <Input
                        className="h-12 rounded-xl bg-gray-50/30"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrição Comercial</Label>
                    <Textarea
                      className="min-h-[100px] rounded-xl bg-gray-50/30"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium">Dimensões</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {newProduct.dimensions.map((dim, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        className="h-10 rounded-xl bg-gray-50/30"
                        value={dim}
                        onChange={(e) => updateDimension(i, e.target.value)}
                        placeholder="200x100x75cm"
                      />
                      <Button variant="ghost" onClick={() => removeDimension(i)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="link" onClick={addDimension} className="px-0 text-primary">
                    + Adicionar Medida
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* DIREITA: MATERIAIS E SALVAR */}
            <div className="space-y-6">
              {/* BLOCO DE MATERIAIS REAIS */}
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white flex flex-col h-[500px]">
                <CardHeader className="pb-2 px-6 pt-6">
                  <CardTitle className="text-lg font-medium">Acabamentos & Materiais</CardTitle>
                  <CardDescription>Selecione o que compõe este produto.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full px-6 pb-6">
                    {availableMaterials.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">
                        Nenhum material cadastrado por fornecedores ainda.
                      </div>
                    ) : (
                      <div className="space-y-6 pt-2">
                        {Object.entries(groupedMaterials).map(([type, list]) => (
                          <div key={type}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{type}</h4>
                            <div className="space-y-2">
                              {list.map((mat) => {
                                const isSelected = selectedMaterialIds.includes(mat.id);
                                return (
                                  <div
                                    key={mat.id}
                                    onClick={() => toggleMaterial(mat.id)}
                                    className={`
                                                            group flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all
                                                            ${isSelected ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-300 bg-white"}
                                                        `}
                                  >
                                    {/* Mini Preview da Imagem */}
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                      {mat.image_url ? (
                                        <img src={mat.image_url} className="w-full h-full object-cover" />
                                      ) : (
                                        <ImageIcon className="h-5 w-5 m-auto text-gray-400 mt-2.5" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-medium truncate ${isSelected ? "text-primary" : "text-gray-700"}`}
                                      >
                                        {mat.name}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">Ref: {mat.sku_supplier || "S/N"}</p>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl text-xs text-center text-gray-500">
                  {selectedMaterialIds.length} materiais selecionados
                </div>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardContent className="p-4">
                  <Button
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/20"
                    onClick={handleSaveProduct}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Publicar Produto
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Placeholder para aba Listagem */}
        <TabsContent value="products" className="text-center py-10 text-gray-400">
          Lista de produtos será implementada na próxima etapa (Visualização da Vitrine).
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FabricaDashboard;
