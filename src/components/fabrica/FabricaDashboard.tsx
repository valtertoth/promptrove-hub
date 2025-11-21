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
import { Plus, Package, Settings, LayoutDashboard, Save, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FabricaDashboardProps {
  userId: string;
}

// Interface provisória para estruturar o cadastro
interface ProductForm {
  name: string;
  category: string;
  description: string;
  dimensions: string[]; // Ex: "200x100x75cm"
  materials: { type: string; supplier: string; reference: string }[];
}

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Estado do Formulário de Produto
  const [newProduct, setNewProduct] = useState<ProductForm>({
    name: "",
    category: "",
    description: "",
    dimensions: [""],
    materials: [],
  });

  // Adicionar nova dimensão dinâmica
  const addDimension = () => {
    setNewProduct({ ...newProduct, dimensions: [...newProduct.dimensions, ""] });
  };

  // Atualizar dimensão específica
  const updateDimension = (index: number, value: string) => {
    const updatedDimensions = [...newProduct.dimensions];
    updatedDimensions[index] = value;
    setNewProduct({ ...newProduct, dimensions: updatedDimensions });
  };

  // Remover dimensão
  const removeDimension = (index: number) => {
    const updatedDimensions = newProduct.dimensions.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, dimensions: updatedDimensions });
  };

  const handleSaveProduct = async () => {
    // Lógica de salvamento será implementada na Fase 2 (Integração com Supabase)
    console.log("Produto para salvar:", newProduct);
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "O layout do formulário está pronto. A gravação no banco será o próximo passo.",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      {/* Cabeçalho Superior */}
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

      {/* Área Principal com Abas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm w-full md:w-auto inline-flex">
          <TabsTrigger
            value="overview"
            className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6"
          >
            <Package className="mr-2 h-4 w-4" /> Meus Produtos
          </TabsTrigger>
          <TabsTrigger
            value="new-product"
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </TabsTrigger>
        </TabsList>

        {/* ABA: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white/80 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Produtos Ativos</CardTitle>
                <Package className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-400 mt-1">Cadastrados na plataforma</p>
              </CardContent>
            </Card>
            {/* Espaço para mais cards (Vendas, Especificadores, etc) */}
          </div>
        </TabsContent>

        {/* ABA: Novo Produto (O Foco da nossa tarefa) */}
        <TabsContent value="new-product">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Coluna Esquerda: Dados Básicos */}
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-medium">Informações do Produto</CardTitle>
                  <CardDescription>Detalhes essenciais para especificação.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Mesa de Jantar Toth"
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white transition-all"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        placeholder="Ex: Mesa, Cadeira, Sofá"
                        className="rounded-xl border-gray-200 bg-gray-50/30"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sku">Código Interno (SKU)</Label>
                      <Input id="sku" placeholder="Opcional" className="rounded-xl border-gray-200 bg-gray-50/30" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição Comercial</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva os diferenciais, inspiração e detalhes técnicos..."
                      className="min-h-[120px] rounded-xl border-gray-200 bg-gray-50/30 resize-none"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bloco de Variações / Dimensões */}
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium">Dimensões Disponíveis</CardTitle>
                  <CardDescription>Adicione todas as medidas que você fabrica este modelo.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {newProduct.dimensions.map((dim, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Input
                        placeholder="Ex: 200cm x 100cm x 75cm"
                        value={dim}
                        onChange={(e) => updateDimension(index, e.target.value)}
                        className="rounded-xl"
                      />
                      {newProduct.dimensions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDimension(index)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDimension}
                    className="rounded-xl mt-2 border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Medida
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita: Mídia e Ações */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium">Imagem Principal</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer bg-gray-50/50">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-sm">Clique para upload</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Status do Cadastro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full rounded-xl font-medium shadow-lg shadow-primary/20"
                    onClick={handleSaveProduct}
                  >
                    <Save className="mr-2 h-4 w-4" /> Publicar Produto
                  </Button>
                  <Button variant="ghost" className="w-full rounded-xl text-gray-500">
                    Salvar como Rascunho
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FabricaDashboard;
