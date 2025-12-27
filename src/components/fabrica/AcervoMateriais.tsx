import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Trash2, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AcervoMateriaisProps {
  produtoId: string;
  onUpdate?: () => void;
}

interface CategoriaMaterial {
  id: string;
  nome: string;
}

interface Fornecedor {
  id: string;
  nome: string;
}

interface Material {
  id: string;
  name: string;
  type: string;
  supplier_id: string;
  supplier_name: string | null;
  categoria_id: string | null;
  description: string | null;
  image_url: string | null;
}

interface MaterialVinculado {
  id: string;
  material: Material | null;
}

const AcervoMateriais = ({ produtoId, onUpdate }: AcervoMateriaisProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [fornecedorFiltro, setFornecedorFiltro] = useState<string>('todos');
  
  // Estados para materiais
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState<Material[]>([]);
  const [materiaisVinculados, setMateriaisVinculados] = useState<MaterialVinculado[]>([]);
  
  // Estado para sugestão
  const [showSugestao, setShowSugestao] = useState(false);
  const [sugestaoCategoria, setSugestaoCategoria] = useState('');

  useEffect(() => {
    fetchCategorias();
    fetchFornecedores();
    fetchMateriaisVinculados();
  }, [produtoId]);

  useEffect(() => {
    fetchMateriais();
  }, [categoriaFiltro, fornecedorFiltro]);

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_material')
        .select('id, nome')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedor')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error('Error fetching fornecedores:', error);
    }
  };

  const fetchMateriais = async () => {
    try {
      let query = supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriaFiltro && categoriaFiltro !== 'todos') {
        query = query.eq('categoria_id', categoriaFiltro);
      }

      if (fornecedorFiltro && fornecedorFiltro !== 'todos') {
        query = query.eq('supplier_id', fornecedorFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMateriaisDisponiveis(data || []);
    } catch (error) {
      console.error('Error fetching materiais:', error);
    }
  };

  const fetchMateriaisVinculados = async () => {
    try {
      const { data, error } = await supabase
        .from('product_materials')
        .select(`
          id,
          material:material_id (
            id,
            name,
            type,
            supplier_id,
            supplier_name,
            categoria_id,
            description,
            image_url
          )
        `)
        .eq('product_id', produtoId);

      if (error) throw error;
      setMateriaisVinculados(data || []);
    } catch (error) {
      console.error('Error fetching materiais vinculados:', error);
    }
  };

  const handleVincularMaterial = async (materialId: string) => {
    // Verifica se já está vinculado
    const jaVinculado = materiaisVinculados.some(m => m.material?.id === materialId);
    if (jaVinculado) {
      toast({
        title: 'Material já vinculado',
        description: 'Este material já está vinculado ao produto.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_materials')
        .insert({
          product_id: produtoId,
          material_id: materialId,
        });

      if (error) throw error;

      toast({
        title: 'Material vinculado!',
        description: 'O material foi adicionado ao produto.',
      });

      fetchMateriaisVinculados();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error vinculando material:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesvincularMaterial = async (vinculoId: string) => {
    try {
      const { error } = await supabase
        .from('product_materials')
        .delete()
        .eq('id', vinculoId);

      if (error) throw error;

      toast({
        title: 'Material removido',
      });

      fetchMateriaisVinculados();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSugerirCategoria = async () => {
    if (!sugestaoCategoria.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe a categoria que deseja sugerir.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get fabrica_id from the product
      const { data: produto } = await supabase
        .from('produtos')
        .select('fabrica_id')
        .eq('id', produtoId)
        .single();

      if (!produto) throw new Error('Produto não encontrado');

      const { error } = await supabase
        .from('sugestoes_categoria_material')
        .insert({
          nome_sugerido: sugestaoCategoria,
          fabrica_id: produto.fabrica_id,
        });

      if (error) throw error;

      toast({
        title: 'Sugestão enviada',
        description: 'Sua sugestão será analisada pela equipe.',
      });

      setSugestaoCategoria('');
      setShowSugestao(false);
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a sugestão.',
        variant: 'destructive',
      });
    }
  };

  const getCategoriaNome = (categoriaId: string | null) => {
    if (!categoriaId) return 'Sem categoria';
    const cat = categorias.find(c => c.id === categoriaId);
    return cat?.nome || 'Desconhecido';
  };

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5" />
          Acervo de Materiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Fornecedores</SelectItem>
              {fornecedores.map((forn) => (
                <SelectItem key={forn.id} value={forn.id}>
                  {forn.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Materiais Disponíveis */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Clique para adicionar ao produto
          </Label>
          
          {materiaisDisponiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum material encontrado com os filtros selecionados.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {materiaisDisponiveis.map((material) => {
                const jaVinculado = materiaisVinculados.some(m => m.material?.id === material.id);
                return (
                  <div
                    key={material.id}
                    className={`p-2 border rounded-md cursor-pointer transition-colors ${
                      jaVinculado 
                        ? 'bg-muted border-primary opacity-60' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => !jaVinculado && handleVincularMaterial(material.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{material.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {getCategoriaNome(material.categoria_id)}
                          </Badge>
                          {material.supplier_name && (
                            <Badge variant="secondary" className="text-xs truncate max-w-[100px]">
                              {material.supplier_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {jaVinculado ? (
                        <Badge variant="default" className="text-xs shrink-0">
                          Adicionado
                        </Badge>
                      ) : (
                        <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botão para sugerir nova categoria */}
        {!showSugestao ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => setShowSugestao(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Sugerir nova categoria
          </Button>
        ) : (
          <div className="space-y-2 p-3 border rounded-md bg-muted/50">
            <Input
              placeholder="Nome da categoria..."
              value={sugestaoCategoria}
              onChange={(e) => setSugestaoCategoria(e.target.value)}
              className="h-9"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleSugerirCategoria}>
                Enviar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setShowSugestao(false);
                  setSugestaoCategoria('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Materiais Selecionados */}
        {materiaisVinculados.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-medium">Materiais Selecionados</Label>
            <div className="space-y-1">
              {materiaisVinculados.map((vinculo) => (
                <div
                  key={vinculo.id}
                  className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {vinculo.material?.name || 'Material não encontrado'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {vinculo.material?.supplier_name || 'Fornecedor desconhecido'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-7 w-7 p-0"
                    onClick={() => handleDesvincularMaterial(vinculo.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AcervoMateriais;
