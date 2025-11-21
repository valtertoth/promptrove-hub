import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client"; // Importamos o cliente do banco
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutDashboard, Layers, Settings, LogOut, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FornecedorDashboardProps {
  userId: string;
}

interface MaterialForm {
  name: string;
  type: string;
  description: string;
  sku_supplier: string;
}

const FornecedorDashboard = ({ userId }: FornecedorDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const [newMaterial, setNewMaterial] = useState<MaterialForm>({
    name: "",
    type: "",
    description: "",
    sku_supplier: "",
  });

  // Função REAL de salvar no banco
  const handleSaveMaterial = async () => {
    // 1. Validação simples
    if (!newMaterial.name || !newMaterial.type) {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, preencha pelo menos o Nome e o Tipo do material.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 2. Envio para o Supabase
      const { error } = await supabase.from("materials").insert({
        supplier_id: userId, // Vincula ao seu usuário logado
        name: newMaterial.name,
        type: newMaterial.type,
        sku_supplier: newMaterial.sku_supplier,
        description: newMaterial.description,
        // image_url: Por enquanto não estamos subindo a imagem real, faremos isso no próximo passo
      });

      if (error) throw error;

      // 3. Sucesso
      toast({
        title: "Sucesso!",
        description: "Matéria-prima cadastrada no banco de dados.",
        className: "bg-green-600 text-white border-none",
      });

      // Limpar formulário
      setNewMaterial({
        name: "",
        type: "",
        description: "",
        sku_supplier: "",
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao conectar com o banco.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Portal do <span className="font-semibold text-blue-600">Fornecedor</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerencie seu catálogo de matérias-primas.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50">
            <Settings className="mr-2 h-4 w-4" /> Dados da Empresa
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <Tabs defaultValue="new-material" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm w-full md:w-auto inline-flex">
          <TabsTrigger value="overview" className="rounded-xl px-6">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-xl px-6">
            <Layers className="mr-2 h-4 w-4" /> Meu Catálogo
          </TabsTrigger>
          <TabsTrigger
            value="new-material"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Material
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="p-10 text-center text-gray-400">Área de Dashboards em desenvolvimento...</div>
        </TabsContent>

        <TabsContent value="catalog">
          <div className="p-10 text-center text-gray-400">Listagem de produtos vindo do banco em breve...</div>
        </TabsContent>

        <TabsContent value="new-material">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-medium">Detalhes da Matéria-Prima</CardTitle>
                  <CardDescription>Cadastre seus tecidos, madeiras ou metais para as fábricas.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Comercial *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Linho Cru Premium"
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white transition-all"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tipo de Material *</Label>
                      <Select onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}>
                        <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/30">
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
                      <Label htmlFor="sku">Seu Código (Ref)</Label>
                      <Input
                        id="sku"
                        placeholder="Ex: TEC-001"
                        className="rounded-xl border-gray-200 bg-gray-50/30"
                        value={newMaterial.sku_supplier}
                        onChange={(e) => setNewMaterial({ ...newMaterial, sku_supplier: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="desc">Descrição Técnica</Label>
                    <Textarea
                      id="desc"
                      placeholder="Composição, gramatura..."
                      className="min-h-[100px] rounded-xl border-gray-200 bg-gray-50/30 resize-none"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium">Amostra Visual</CardTitle>
                  <CardDescription>Foto em alta qualidade da textura.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs text-center px-4">Upload de imagem será ativado no próximo passo</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full rounded-xl h-12 text-base font-medium shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700"
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
