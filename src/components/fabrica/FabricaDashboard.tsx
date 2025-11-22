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
  Package,
  Settings,
  LayoutDashboard,
  Save,
  Trash2,
  Image as ImageIcon,
  Check,
  Loader2,
  Search,
  Factory,
  Building2,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface FabricaDashboardProps {
  userId: string;
}

// Interface do Material
interface MaterialData {
  id: string;
  name: string;
  type: string; // Ex: Madeira Maciça
  supplier_id: string;
  supplier_name?: string; // Nome da empresa (novo)
  sku_supplier: string;
  image_url: string | null;
}

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estados de Dados
  const [allMaterials, setAllMaterials] = useState<MaterialData[]>([]);

  // Estados do Funil de Seleção
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("todos");

  // Materiais Selecionados para o Produto (CARRINHO)
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialData[]>([]);

  // Estado do Formulário do Produto
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    sku: "",
    description: "",
    dimensions: [""],
  });

  // 1. Buscar Todos os Materiais
  useEffect(() => {
    const fetchMaterials = async () => {
      // Buscamos tudo e filtramos no front-end para ser instantâneo
      const { data, error } = await supabase.from("materials").select("*").order("created_at", { ascending: false });

      if (data) setAllMaterials(data);
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

  // LÓGICA INTELIGENTE: Filtrar Fornecedores baseados na Categoria
  const uniqueSuppliers = allMaterials
    .filter((m) => selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory)
    .reduce(
      (acc, current) => {
        const x = acc.find((item) => item.id === current.supplier_id);
        if (!x) {
          return acc.concat([{ id: current.supplier_id, name: current.supplier_name || "Fornecedor Sem Nome" }]);
        } else {
          return acc;
        }
      },
      [] as { id: string; name: string }[],
    );

  // LÓGICA INTELIGENTE: Materiais exibidos na grid final
  const displayedMaterials = allMaterials.filter((m) => {
    const categoryMatch = selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory;
    const supplierMatch = selectedSupplierId === "todos" || m.supplier_id === selectedSupplierId;
    return categoryMatch && supplierMatch;
  });

  // Helper para agrupar tipos em categorias macro
  function getCategoryGroup(type: string) {
    if (["Madeira Maciça", "Lâmina Natural", "Lâmina Pré-Composta"].includes(type)) return "Madeiras";
    if (["Tecido Plano", "Couro Natural", "Couro Sintético", "Veludo"].includes(type)) return "Tecidos";
    if (["Aço Carbono", "Aço Inox", "Alumínio", "Latão"].includes(type)) return "Metais";
    if (["Mármore", "Granito", "Quartzito", "Sintético"].includes(type)) return "Pedras";
    return "Outros";
  }

  // Adicionar/Remover Material do Produto
  const toggleMaterial = (material: MaterialData) => {
    if (selectedMaterials.find((m) => m.id === material.id)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m.id !== material.id));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  // SALVAR PRODUTO
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
          dimensions: newProduct.dimensions,
        })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Criar os Vínculos
      if (selectedMaterials.length > 0 && productData) {
        const links = selectedMaterials.map((m) => ({
          product_id: productData.id,
          material_id: m.id,
        }));

        const { error: linkError } = await supabase.from("product_materials").insert(links);
        if (linkError) throw linkError;
      }

      toast({ title: "Produto Publicado!", className: "bg-green-600 text-white border-none" });

      // Reset Total
      setNewProduct({ name: "", category: "", sku: "", description: "", dimensions: [""] });
      setSelectedMaterials([]);
      setSelectedCategory("todos");
      setSelectedSupplierId("todos");
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid gap-8 md:grid-cols-12">
            {/* COLUNA DA ESQUERDA: DADOS DO PRODUTO (Ocupa 7 colunas) */}
            <div className="md:col-span-7 space-y-6">
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

              {/* Resumo dos Materiais Selecionados */}
              {selectedMaterials.length > 0 && (
                <Card className="rounded-2xl border-primary/20 shadow-lg bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center text-primary">
                      <Check className="w-4 h-4 mr-2" />
                      {selectedMaterials.length} Itens Vinculados ao Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {selectedMaterials.map((m) => (
                        <Badge
                          key={m.id}
                          variant="secondary"
                          className="bg-white border border-gray-200 text-gray-700 pl-1 pr-2 py-1 h-8 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                          onClick={() => toggleMaterial(m)}
                        >
                          {m.image_url && (
                            <img src={m.image_url} className="w-6 h-6 rounded bg-gray-100 object-cover" />
                          )}
                          {m.name}
                          <X className="w-3 h-3 ml-1 opacity-50" />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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

            {/* COLUNA DA DIREITA: O CONSTRUTOR (Ocupa 5 colunas) */}
            <div className="md:col-span-5 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white flex flex-col h-[750px]">
                <CardHeader className="pb-4 px-6 pt-6 border-b border-gray-50">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Seleção de Materiais
                  </CardTitle>
                  <CardDescription>Escolha o fornecedor e especifique o material.</CardDescription>

                  {/* FILTROS DO FUNIL */}
                  <div className="grid gap-3 mt-4">
                    {/* 1. Filtro de Categoria */}
                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => {
                        setSelectedCategory(val);
                        setSelectedSupplierId("todos");
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Filtrar Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas Categorias</SelectItem>
                        <SelectItem value="Madeiras">Madeiras</SelectItem>
                        <SelectItem value="Tecidos">Tecidos & Peles</SelectItem>
                        <SelectItem value="Metais">Metais</SelectItem>
                        <SelectItem value="Pedras">Pedras</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* 2. Seleção de Fornecedor (Dinâmico) */}
                    <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                      <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-200">
                        <div className="flex items-center text-gray-500">
                          <Factory className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Selecione o Fornecedor" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Fornecedores</SelectItem>
                        {uniqueSuppliers.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                {/* GRID DE MATERIAIS FILTRADOS */}
                <CardContent className="flex-1 overflow-hidden p-0 bg-gray-50/30">
                  <ScrollArea className="h-full px-4 py-4">
                    {displayedMaterials.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhum material encontrado com estes filtros.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {displayedMaterials.map((mat) => {
                          const isSelected = selectedMaterials.some((sm) => sm.id === mat.id);
                          return (
                            <div
                              key={mat.id}
                              onClick={() => toggleMaterial(mat)}
                              className={`
                                                group relative flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md
                                                ${isSelected ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/50" : "border-gray-200 bg-white hover:border-blue-300"}
                                            `}
                            >
                              {/* Imagem */}
                              <div className="h-24 w-full rounded-lg bg-gray-100 overflow-hidden relative">
                                {mat.image_url ? (
                                  <img src={mat.image_url} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-8 w-8 m-auto text-gray-300 absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </div>

                              {/* Textos */}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                  {mat.type}
                                </p>
                                <p
                                  className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-800"}`}
                                >
                                  {mat.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                                  <Factory className="h-3 w-3" />
                                  {mat.supplier_name || "Fornecedor Desconhecido"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="text-center py-10 text-gray-400">
          Lista de produtos será implementada na próxima etapa.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FabricaDashboard;
