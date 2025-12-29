import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Package, ClipboardCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EspecificarDialog from '@/components/especificador/EspecificarDialog';

const Catalogo = () => {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [fabricas, setFabricas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedRegiao, setSelectedRegiao] = useState<string>('');
  const [selectedFabrica, setSelectedFabrica] = useState<string>('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [regioes, setRegioes] = useState<string[]>([]);

  // Estado para o dialog de especificar
  const [especificarOpen, setEspecificarOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<{ id: string; nome: string; fabrica_id: string } | null>(null);

  // Verificar se o usuário é especificador
  const [isEspecificador, setIsEspecificador] = useState(false);

  useEffect(() => {
    fetchData();
    if (user) {
      checkIfEspecificador();
    }
  }, [user]);

  const checkIfEspecificador = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('especificador')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsEspecificador(!!data);
  };

  useEffect(() => {
    filterProdutos();
  }, [searchTerm, selectedCategoria, selectedTipo, selectedRegiao, selectedFabrica]);

  const fetchData = async () => {
    try {
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select(`
          *,
          fabrica:fabrica_id (
            id,
            nome,
            cidade,
            estado,
            pais,
            regioes_autorizadas,
            logo_url
          )
        `)
        .eq('ativo', true);

      if (produtosError) throw produtosError;

      const { data: fabricasData, error: fabricasError } = await supabase
        .from('fabrica')
        .select('*')
        .eq('ativo', true);

      if (fabricasError) throw fabricasError;

      setProdutos(produtosData || []);
      setFabricas(fabricasData || []);

      // Extract unique categories, types and regions
      const categoriasSet = new Set<string>();
      const tiposSet = new Set<string>();
      const regioesSet = new Set<string>();

      produtosData?.forEach((produto: any) => {
        if (produto.categorias) {
          produto.categorias.forEach((cat: string) => categoriasSet.add(cat));
        }
        if (produto.tipo_produto) {
          tiposSet.add(produto.tipo_produto);
        }
        if (produto.fabrica?.estado) {
          regioesSet.add(produto.fabrica.estado);
        }
      });

      setCategorias(Array.from(categoriasSet));
      setTipos(Array.from(tiposSet));
      setRegioes(Array.from(regioesSet));
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProdutos = () => {
    let filtered = [...produtos];

    if (searchTerm) {
      filtered = filtered.filter((produto) =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.fabrica?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter((produto) =>
        produto.categorias?.includes(selectedCategoria)
      );
    }

    if (selectedTipo) {
      filtered = filtered.filter((produto) =>
        produto.tipo_produto === selectedTipo
      );
    }

    if (selectedRegiao) {
      filtered = filtered.filter((produto) =>
        produto.fabrica?.estado === selectedRegiao
      );
    }

    if (selectedFabrica) {
      filtered = filtered.filter((produto) =>
        produto.fabrica_id === selectedFabrica
      );
    }

    return filtered;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('');
    setSelectedTipo('');
    setSelectedRegiao('');
    setSelectedFabrica('');
  };

  const handleEspecificar = (produto: any) => {
    setProdutoSelecionado({ id: produto.id, nome: produto.nome, fabrica_id: produto.fabrica_id });
    setEspecificarOpen(true);
  };

  const filteredProdutos = filterProdutos();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold mb-4">Catálogo de Produtos</h1>
          
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todas Categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos os Tipos</SelectItem>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegiao} onValueChange={setSelectedRegiao}>
              <SelectTrigger>
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todas Regiões</SelectItem>
                {regioes.map((regiao) => (
                  <SelectItem key={regiao} value={regiao}>
                    {regiao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFabrica} onValueChange={setSelectedFabrica}>
              <SelectTrigger>
                <SelectValue placeholder="Fábrica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todas Fábricas</SelectItem>
                {fabricas.map((fabrica) => (
                  <SelectItem key={fabrica.id} value={fabrica.id}>
                    {fabrica.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedCategoria || selectedTipo || selectedRegiao || selectedFabrica) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredProdutos.length} produto(s) encontrado(s)
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredProdutos.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros de busca
            </p>
            <Button onClick={clearFilters}>Limpar Filtros</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProdutos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden hover:shadow-elegant transition-all group">
                {produto.imagens && produto.imagens.length > 0 ? (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {produto.imagens.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs">
                        +{produto.imagens.length - 1} fotos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-56 bg-muted flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{produto.nome}</h3>
                    {produto.tipo_produto && (
                      <p className="text-sm text-muted-foreground">{produto.tipo_produto}</p>
                    )}
                  </div>

                  {produto.descricao && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}

                  {produto.categorias && produto.categorias.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {produto.categorias.slice(0, 3).map((cat: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {produto.categorias.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{produto.categorias.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Botão Especificar */}
                  {isEspecificador && (
                    <Button
                      onClick={() => handleEspecificar(produto)}
                      className="w-full mb-4"
                      variant="default"
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Especificar
                    </Button>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-3">
                      {produto.fabrica?.logo_url ? (
                        <img
                          src={produto.fabrica.logo_url}
                          alt={produto.fabrica.nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {produto.fabrica?.nome?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{produto.fabrica?.nome}</p>
                        {produto.fabrica?.cidade && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {produto.fabrica.cidade}, {produto.fabrica.estado}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog de Especificar */}
      <EspecificarDialog
        open={especificarOpen}
        onOpenChange={setEspecificarOpen}
        produto={produtoSelecionado}
      />
    </div>
  );
};

export default Catalogo;