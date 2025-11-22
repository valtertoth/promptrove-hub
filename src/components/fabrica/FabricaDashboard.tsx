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
import {
  Plus,
  Package,
  Settings,
  LayoutDashboard,
  Save,
  Image as ImageIcon,
  Check,
  Loader2,
  Search,
  Factory,
  Building2,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface FabricaDashboardProps {
  userId: string;
}

interface MaterialData {
  id: string;
  name: string;
  type: string;
  supplier_id: string;
  supplier_name?: string;
  sku_supplier: string;
  image_url: string | null;
}

// Interface para os Produtos listados
interface ProductData {
  id: string;
  name: string;
  category: string;
  sku_manufacturer: string;
  created_at: string;
}

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("new-product"); // Controle manual da aba

  // Dados
  const [allMaterials, setAllMaterials] = useState<MaterialData[]>([]);
  const [myProducts, setMyProducts] = useState<ProductData[]>([]); // Lista de produtos salvos

  // Filtros do Construtor (Direita)
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("todos");

  // Materiais Selecionados (O Produto)
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialData[]>([]);

  // Formulário
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    sku: "",
    description: "",
    dimensions: [""],
  });

  // Buscar Materiais e Produtos ao carregar
  useEffect(() => {
    fetchMaterials();
    fetchMyProducts();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    if (data) setAllMaterials(data);
  };

  const fetchMyProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("manufacturer_id", userId)
      .order("created_at", { ascending: false });

    if (data) setMyProducts(data);
  };

  // --- Helpers de Categorias ---
  function getCategoryGroup(type: string) {
    if (["Madeira Maciça", "Lâmina Natural", "Lâmina Pré-Composta"].includes(type)) return "Madeiras";
    if (["Tecido Plano", "Couro Natural", "Couro Sintético", "Veludo"].includes(type)) return "Tecidos";
    if (["Aço Carbono", "Aço Inox", "Alumínio", "Latão"].includes(type)) return "Metais";
    if (["Mármore", "Granito", "Quartzito", "Sintético"].includes(type)) return "Pedras";
    return "Acabamentos Diversos";
  }

  // --- Lógica de Filtragem (Direita) ---
  const uniqueSuppliers = allMaterials
    .filter((m) => selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory)
    .reduce(
      (acc, current) => {
        const exists = acc.find((item) => item.id === current.supplier_id);
        if (!exists) {
          return acc.concat([{ id: current.supplier_id, name: current.supplier_name || "Fornecedor Sem Nome" }]);
        }
        return acc;
      },
      [] as { id: string; name: string }[],
    );

  const displayedMaterials = allMaterials.filter((m) => {
    const categoryMatch = selectedCategory === "todos" || getCategoryGroup(m.type) === selectedCategory;
    const supplierMatch = selectedSupplierId === "todos" || m.supplier_id === selectedSupplierId;
    return categoryMatch && supplierMatch;
  });

  // --- Lógica de Seleção ---
  const toggleMaterial = (material: MaterialData) => {
    if (selectedMaterials.find((m) => m.id === material.id)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m.id !== material.id));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  // --- Agrupamento dos Selecionados (Esquerda - Ficha Técnica) ---
  const groupedSelected = selectedMaterials.reduce(
    (acc, mat) => {
      const group = getCategoryGroup(mat.type);
      if (!acc[group]) acc[group] = [];
      acc[group].push(mat);
      return acc;
    },
    {} as Record<string, MaterialData[]>,
  );

  // --- Salvar ---
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.category) {
      toast({ title: "Erro", description: "Nome e Categoria são obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Salvar Produto
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

      // 2. Salvar Vínculos
      if (selectedMaterials.length > 0 && productData) {
        const links = selectedMaterials.map((m) => ({
          product_id: productData.id,
          material_id: m.id,
        }));
        const { error: linkError } = await supabase.from("product_materials").insert(links);
        if (linkError) throw linkError;
      }

      toast({
        title: "Sucesso!",
        description: "Produto e ficha técnica salvos.",
        className: "bg-green-600 text-white border-none",
      });

      // 3. RESET E REDIRECIONAMENTO
      setNewProduct({ name: "", category: "", sku: "", description: "", dimensions: [""] });
      setSelectedMaterials([]);
      setSelectedCategory("todos");

      // Atualiza a lista e muda de aba
      await fetchMyProducts();
      setActiveTab("products");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10 font-sans text-slate-800">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Painel da <span className="font-semibold text-primary">Fábrica</span>
          </h1>
          <p className="text-gray-500 mt-1">Construção de Produtos e Ficha Técnica.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={signOut} variant="ghost" className="text-red-500 hover:bg-red-50 rounded-xl">
            Sair
          </Button>
        </div>
      </header>

      {/* Controle de Abas via State (value={activeTab}) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

        {/* ABA: NOVO PRODUTO */}
        <TabsContent value="new-product">
          <div className="grid gap-8 md:grid-cols-12">
            {/* ESQUERDA: FICHA TÉCNICA */}
            <div className="md:col-span-7 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="bg-gray-50/40 border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-medium">1. Dados do Produto</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label>Nome do Produto</Label>
                    <Input
                      className="h-12 rounded-xl bg-gray-50/30"
                      placeholder="Ex: Cadeira João"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Input
                        className="h-12 rounded-xl bg-gray-50/30"
                        placeholder="Cadeira, Mesa..."
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>SKU</Label>
                      <Input
                        className="h-12 rounded-xl bg-gray-50/30"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrição</Label>
                    <Textarea
                      className="min-h-[80px] rounded-xl bg-gray-50/30"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ÁREA DE COMPOSIÇÃO */}
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white min-h-[300px]">
                <CardHeader className="pb-2 border-b border-gray-50">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    2. Composição / Variações Habilitadas
                  </CardTitle>
                  <CardDescription>Estes são os materiais que o especificador poderá escolher.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedMaterials.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 font-medium">A ficha técnica está vazia.</p>
                      <p className="text-xs text-gray-400">Selecione materiais na coluna da direita.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedSelected).map(([groupName, items]) => (
                        <div key={groupName} className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {groupName}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {items.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 pr-3 hover:border-red-200 hover:bg-red-50 group transition-all cursor-pointer"
                                onClick={() => toggleMaterial(m)}
                              >
                                <div className="h-8 w-8 rounded bg-white border border-gray-100 overflow-hidden">
                                  {m.image_url ? (
                                    <img src={m.image_url} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 m-auto mt-2 text-gray-300" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-700 group-hover:text-red-600">
                                    {m.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400">{m.supplier_name}</span>
                                </div>
                                <X className="h-3 w-3 ml-2 text-gray-300 group-hover:text-red-500" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                  <Button
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gray-900 hover:bg-black shadow-lg transition-all active:scale-95"
                    onClick={handleSaveProduct}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Salvar Ficha Técnica
                  </Button>
                </div>
              </Card>
            </div>

            {/* DIREITA: SELETOR */}
            <div className="md:col-span-5 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white flex flex-col h-[800px]">
                <CardHeader className="pb-4 px-6 pt-6 border-b border-gray-50 bg-blue-50/30">
                  <CardTitle className="text-lg font-medium flex items-center gap-2 text-blue-700">
                    <Building2 className="h-5 w-5" />
                    Catálogo de Fornecedores
                  </CardTitle>
                  <CardDescription>Busque e habilite os materiais.</CardDescription>
                  <div className="space-y-3 mt-4">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">1. Categoria</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(val) => {
                          setSelectedCategory(val);
                          setSelectedSupplierId("todos");
                        }}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas</SelectItem>
                          <SelectItem value="Madeiras">Madeiras</SelectItem>
                          <SelectItem value="Tecidos">Tecidos</SelectItem>
                          <SelectItem value="Metais">Metais</SelectItem>
                          <SelectItem value="Pedras">Pedras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">2. Fornecedor</Label>
                      <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                          <div className="flex items-center">
                            <Factory className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Todos" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {uniqueSuppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 bg-gray-50/30">
                  <ScrollArea className="h-full px-4 py-4">
                    {displayedMaterials.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhum material encontrado.</p>
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
                                                group relative flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                                ${isSelected ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"}
                                            `}
                            >
                              <div className="h-24 w-full rounded-lg bg-gray-100 overflow-hidden relative">
                                {mat.image_url ? (
                                  <img src={mat.image_url} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-8 w-8 m-auto text-gray-300 absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                  {mat.type}
                                </p>
                                <p
                                  className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-800"}`}
                                >
                                  {mat.name}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate mt-1 flex items-center gap-1 bg-gray-100 w-fit px-1.5 py-0.5 rounded">
                                  <Factory className="h-2.5 w-2.5" />
                                  {mat.supplier_name || "Desconhecido"}
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

        {/* ABA: MEUS PRODUTOS (AGORA IMPLEMENTADA) */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Meu Portfólio</h2>
            <Button onClick={() => setActiveTab("new-product")} className="bg-gray-900 text-white rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Criar Novo
            </Button>
          </div>

          {myProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum produto criado</h3>
              <p className="text-gray-500 mb-6">Cadastre seus produtos e vincule materiais.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myProducts.map((product) => (
                <Card
                  key={product.id}
                  className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group"
                >
                  <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium text-gray-900">{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {product.sku_manufacturer || "S/SKU"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Check className="h-4 w-4 text-green-500" />
                      Ficha Técnica Ativa
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Criado em {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-colors"
                    >
                      Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overview">
          <div className="text-center py-10 text-gray-400">Dashboards em breve.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FabricaDashboard;
