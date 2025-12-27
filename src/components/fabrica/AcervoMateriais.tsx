import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Trash2, X, ChevronRight, Upload, Image } from 'lucide-react';
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
  
  // Estados para seleção hierárquica
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState<Material[]>([]);
  
  // Seleções atuais
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>('');
  
  // Materiais vinculados ao produto
  const [materiaisVinculados, setMateriaisVinculados] = useState<MaterialVinculado[]>([]);
  
  // Estado para sugestão
  const [showSugestao, setShowSugestao] = useState(false);
  const [sugestaoCategoria, setSugestaoCategoria] = useState('');

  useEffect(() => {
    fetchCategorias();
    fetchMateriaisVinculados();
  }, [produtoId]);

  // Quando categoria muda, buscar fornecedores disponíveis para essa categoria
  useEffect(() => {
    if (categoriaSelecionada) {
      fetchFornecedoresPorCategoria();
      setFornecedorSelecionado('');
      setMateriaisDisponiveis([]);
    } else {
      setFornecedores([]);
      setFornecedorSelecionado('');
      setMateriaisDisponiveis([]);
    }
  }, [categoriaSelecionada]);

  // Quando fornecedor muda, buscar materiais disponíveis
  useEffect(() => {
    if (categoriaSelecionada && fornecedorSelecionado) {
      fetchMateriais();
    } else {
      setMateriaisDisponiveis([]);
    }
  }, [fornecedorSelecionado]);

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

  const fetchFornecedoresPorCategoria = async () => {
    try {
      // Buscar fornecedores que possuem materiais nessa categoria
      const { data: materiaisData, error } = await supabase
        .from('materials')
        .select('supplier_id, supplier_name')
        .eq('categoria_id', categoriaSelecionada)
        .eq('is_active', true);

      if (error) throw error;

      // Extrair fornecedores únicos
      const fornecedoresUnicos = new Map<string, string>();
      materiaisData?.forEach(m => {
        if (m.supplier_id && m.supplier_name) {
          fornecedoresUnicos.set(m.supplier_id, m.supplier_name);
        }
      });

      const fornecedoresList: Fornecedor[] = Array.from(fornecedoresUnicos.entries()).map(
        ([id, nome]) => ({ id, nome })
      );

      // Se não encontrou fornecedores via materials, buscar da tabela fornecedor
      if (fornecedoresList.length === 0) {
        const { data: fornecedoresData, error: fornecedoresError } = await supabase
          .from('fornecedor')
          .select('id, nome')
          .eq('ativo', true)
          .order('nome');

        if (!fornecedoresError && fornecedoresData) {
          setFornecedores(fornecedoresData);
          return;
        }
      }

      setFornecedores(fornecedoresList);
    } catch (error) {
      console.error('Error fetching fornecedores:', error);
    }
  };

  const fetchMateriais = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .eq('categoria_id', categoriaSelecionada)
        .eq('supplier_id', fornecedorSelecionado)
        .order('name');

      if (error) throw error;
      setMateriaisDisponiveis(data || []);
    } catch (error) {
      console.error('Error fetching materiais:', error);
    }
  };

  const fetchMateriaisVinculados = async () => {
    try {
      const { data, error } = await supabase
        .from('produto_materiais')
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
        .eq('produto_id', produtoId);

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
        .from('produto_materiais')
        .insert({
          produto_id: produtoId,
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
        .from('produto_materiais')
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

  const limparSelecao = () => {
    setCategoriaSelecionada('');
    setFornecedorSelecionado('');
    setMateriaisDisponiveis([]);
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
        {/* Seleção Hierárquica */}
        <div className="space-y-3">
          {/* Step 1: Categoria */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">1. Categoria do Material</Label>
            <Select 
              value={categoriaSelecionada} 
              onValueChange={(value) => setCategoriaSelecionada(value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Fornecedor (aparece após selecionar categoria) */}
          {categoriaSelecionada && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">2. Fornecedor</Label>
              {fornecedores.length > 0 ? (
                <Select 
                  value={fornecedorSelecionado} 
                  onValueChange={setFornecedorSelecionado}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((forn) => (
                      <SelectItem key={forn.id} value={forn.id}>
                        {forn.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum fornecedor com materiais nesta categoria.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Opções de Material (aparece após selecionar fornecedor) */}
          {categoriaSelecionada && fornecedorSelecionado && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">3. Opções Disponíveis</Label>
              
              {materiaisDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center bg-muted/50 rounded-md">
                  Nenhum material encontrado para este fornecedor nesta categoria.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {materiaisDisponiveis.map((material) => {
                    const jaVinculado = materiaisVinculados.some(m => m.material?.id === material.id);
                    return (
                      <div
                        key={material.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          jaVinculado 
                            ? 'bg-primary/10 border-primary opacity-70 cursor-not-allowed' 
                            : 'hover:bg-accent hover:border-primary/50'
                        }`}
                        onClick={() => !jaVinculado && handleVincularMaterial(material.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Imagem do Material */}
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {material.image_url ? (
                              <img 
                                src={material.image_url} 
                                alt={material.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Info do Material */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{material.name}</p>
                              {jaVinculado ? (
                                <Badge variant="default" className="text-xs shrink-0 ml-2">
                                  Adicionado
                                </Badge>
                              ) : (
                                <Plus className="w-4 h-4 text-primary shrink-0 ml-2" />
                              )}
                            </div>
                            {material.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {material.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={limparSelecao}
              >
                Limpar seleção
              </Button>
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
          <div className="space-y-2 pt-3 border-t">
            <Label className="text-sm font-medium">
              Materiais no Produto ({materiaisVinculados.length})
            </Label>
            <div className="space-y-2">
              {materiaisVinculados.map((vinculo) => (
                <div
                  key={vinculo.id}
                  className="flex items-center gap-3 p-2 bg-primary/5 border border-primary/20 rounded-lg"
                >
                  {/* Mini imagem */}
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {vinculo.material?.image_url ? (
                      <img 
                        src={vinculo.material.image_url} 
                        alt={vinculo.material.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {vinculo.material?.name || 'Material não encontrado'}
                    </p>
                    <div className="flex gap-1 items-center">
                      <Badge variant="outline" className="text-xs">
                        {getCategoriaNome(vinculo.material?.categoria_id || null)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        • {vinculo.material?.supplier_name || 'Fornecedor'}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-7 w-7 p-0 hover:bg-destructive/10"
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
