import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, Building2, MapPin, Filter, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProdutosSearchProps {
  especificadorId: string;
}

const ProdutosSearch = ({ especificadorId }: ProdutosSearchProps) => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [fabricasAcessiveis, setFabricasAcessiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [especificadorId]);

  const fetchData = async () => {
    try {
      // Get factories the especificador has access to
      const { data: solicitacoes, error: solError } = await supabase
        .from('fabrica_especificador')
        .select('fabrica_id')
        .eq('especificador_id', especificadorId)
        .eq('status', 'aprovado');

      if (solError) throw solError;

      const fabricaIds = solicitacoes?.map((s) => s.fabrica_id) || [];
      setFabricasAcessiveis(fabricaIds);

      // Get all active products
      const { data: produtosData, error: prodError } = await supabase
        .from('produtos')
        .select(`
          *,
          fabrica:fabrica_id (
            id,
            nome,
            cidade,
            estado,
            logo_url
          )
        `)
        .eq('ativo', true);

      if (prodError) throw prodError;

      setProdutos(produtosData || []);

      // Extract unique categories and types
      const categoriasSet = new Set<string>();
      const tiposSet = new Set<string>();

      produtosData?.forEach((produto: any) => {
        if (produto.categorias) {
          produto.categorias.forEach((cat: string) => categoriasSet.add(cat));
        }
        if (produto.tipo_produto) {
          tiposSet.add(produto.tipo_produto);
        }
      });

      setCategorias(Array.from(categoriasSet));
      setTipos(Array.from(tiposSet));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasAccessToFabrica = (fabricaId: string) => {
    return fabricasAcessiveis.includes(fabricaId);
  };

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.fabrica?.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategoria = !selectedCategoria || produto.categorias?.includes(selectedCategoria);
    const matchesTipo = !selectedTipo || produto.tipo_produto === selectedTipo;

    return matchesSearch && matchesCategoria && matchesTipo;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoria('');
    setSelectedTipo('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-[180px]">
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
          </div>

          <Select value={selectedTipo} onValueChange={setSelectedTipo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos Tipos</SelectItem>
              {tipos.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredProdutos.length} produto(s) encontrado(s)
      </div>

      {filteredProdutos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProdutos.map((produto) => {
            const hasAccess = hasAccessToFabrica(produto.fabrica_id);
            const imagem = produto.imagens?.[0];

            return (
              <Card
                key={produto.id}
                className={`hover:shadow-lg transition-shadow ${!hasAccess ? 'opacity-60' : ''}`}
              >
                {imagem && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={imagem}
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-1">{produto.nome}</CardTitle>
                      {!hasAccess && (
                        <Badge variant="secondary" className="shrink-0">
                          Sem acesso
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span className="line-clamp-1">{produto.fabrica?.nome}</span>
                    </div>
                    {produto.fabrica?.cidade && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {produto.fabrica.cidade}, {produto.fabrica.estado}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {produto.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {produto.descricao}
                    </p>
                  )}
                  {produto.categorias && produto.categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {produto.categorias.slice(0, 3).map((cat: string) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProdutosSearch;
