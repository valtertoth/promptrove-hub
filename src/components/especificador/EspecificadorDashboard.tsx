import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, LayoutGrid, FolderHeart, Wallet, LogOut, Settings, Filter, Heart, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EspecificadorDashboardProps {
  userId: string;
}

const EspecificadorDashboard = ({ userId }: EspecificadorDashboardProps) => {
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      {/* Cabeçalho Superior */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            Olá, <span className="font-semibold text-emerald-700">Especificador</span>
          </h1>
          <p className="text-gray-500 mt-1">Explore o melhor do design brasileiro para seus projetos.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50">
            <Settings className="mr-2 h-4 w-4" /> Meu Perfil
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

      {/* Área Principal */}
      <Tabs defaultValue="marketplace" className="space-y-8">
        {/* Menu de Navegação Centralizado */}
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-full border border-gray-200/50 shadow-sm inline-flex">
            <TabsTrigger
              value="marketplace"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Vitrine
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              <FolderHeart className="mr-2 h-4 w-4" /> Meus Projetos
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-full px-6 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              <Wallet className="mr-2 h-4 w-4" /> Comissões
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ABA: Vitrine (Busca de Produtos) */}
        <TabsContent value="marketplace" className="space-y-6">
          {/* Barra de Busca Estilizada */}
          <div className="relative max-w-2xl mx-auto md:mx-0">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Busque por cadeiras, mesas, fábricas ou materiais..."
              className="pl-12 h-12 rounded-2xl border-gray-200 shadow-sm bg-white text-lg focus-visible:ring-emerald-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800">
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </Button>
          </div>

          {/* Grid de Produtos (Mockup) */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Destaques da Semana</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card de Produto 1 */}
              <Card className="group rounded-2xl border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                <div className="h-64 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                    <span className="text-xs">Foto do Produto</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-white/50 hover:bg-white rounded-full text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
                        Poltrona Modern
                      </h3>
                      <p className="text-sm text-gray-500">Toth Móveis</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                      Novo
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                      Madeira Nogueira
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                      Linho Cru
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button className="w-full rounded-xl bg-gray-900 hover:bg-emerald-700 text-white transition-colors">
                    Especificar
                  </Button>
                </CardFooter>
              </Card>

              {/* Card de Produto 2 (Exemplo) */}
              <Card className="group rounded-2xl border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                <div className="h-64 bg-gray-100 relative">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                    <span className="text-xs">Foto do Produto</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
                        Mesa Jantar Orgânica
                      </h3>
                      <p className="text-sm text-gray-500">Fábrica Exemplo</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                      Laca Off-White
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button className="w-full rounded-xl bg-gray-900 hover:bg-emerald-700 text-white transition-colors">
                    Especificar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ABA: Projetos */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Meus Projetos</h2>
            <Button className="rounded-xl bg-emerald-700 hover:bg-emerald-800">+ Nova Lista</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border border-dashed border-gray-300 bg-gray-50/50 shadow-none flex items-center justify-center min-h-[200px] rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="text-center">
                <FolderHeart className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <span className="text-gray-500 font-medium">Criar novo projeto</span>
              </div>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white">
              <CardHeader>
                <CardTitle>Residência Alphaville</CardTitle>
                <CardDescription>Atualizado há 2 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">4 itens especificados</p>
                <div className="flex -space-x-2 mt-4 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-300"></div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-400"></div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-500"></div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-50 p-4 flex justify-between items-center text-sm text-emerald-700 font-medium">
                Ver Detalhes <ChevronRight className="h-4 w-4" />
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: Financeiro */}
        <TabsContent value="financial">
          <Card className="rounded-2xl border-gray-100 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                Minha Carteira
              </CardTitle>
              <CardDescription>Gestão de comissões e split de pagamentos (Em Breve).</CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                <Wallet className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Módulo Financeiro</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                Aqui você poderá acompanhar suas vendas, gerar links de pagamento e visualizar seus recebimentos em
                tempo real.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EspecificadorDashboard;
