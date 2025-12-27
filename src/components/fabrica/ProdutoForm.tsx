import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';
import VariacoesList from './VariacoesList';
import ImageUpload from './ImageUpload';
import FornecedorSelector from './FornecedorSelector';
import PersonalizacoesManager from './PersonalizacoesManager';
import AcervoMateriais from './AcervoMateriais';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ProdutoFormProps {
  fabricaId: string;
  produto?: any;
  onClose: () => void;
}

interface TipoProduto {
  id: string;
  nome: string;
}

interface Ambiente {
  id: string;
  nome: string;
}

const ProdutoForm = ({ fabricaId, produto, onClose }: ProdutoFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [produtoId, setProdutoId] = useState(produto?.id || null);
  const [images, setImages] = useState<string[]>(produto?.imagens || []);
  
  // Novos estados para tipos e ambientes
  const [tiposProduto, setTiposProduto] = useState<TipoProduto[]>([]);
  const [ambientesDisponiveis, setAmbientesDisponiveis] = useState<Ambiente[]>([]);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<string[]>(produto?.ambientes || []);
  const [showOutroTipo, setShowOutroTipo] = useState(false);
  const [sugestaoTipo, setSugestaoTipo] = useState('');
  const [descricaoSugestao, setDescricaoSugestao] = useState('');
  
  // Estados para sugestões de campos
  const [showOutroAmbiente, setShowOutroAmbiente] = useState(false);
  const [sugestaoAmbiente, setSugestaoAmbiente] = useState('');
  const [tipoSelecionadoId, setTipoSelecionadoId] = useState<string | null>(null);
  
  const [produtosExistentes, setProdutosExistentes] = useState<any[]>([]);
  const [modoNome, setModoNome] = useState<'existente' | 'novo'>(produto ? 'existente' : 'novo');
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    tipo_produto: produto?.tipo_produto || '',
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    tempo_fabricacao_dias: produto?.tempo_fabricacao_dias || '',
  });

  // Carregar tipos de produtos e ambientes
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tiposRes, ambientesRes] = await Promise.all([
          supabase
            .from('tipos_produto')
            .select('id, nome')
            .eq('ativo', true)
            .order('ordem'),
          supabase
            .from('ambientes')
            .select('id, nome')
            .eq('ativo', true)
            .order('ordem')
        ]);

        if (tiposRes.data) setTiposProduto(tiposRes.data);
        if (ambientesRes.data) setAmbientesDisponiveis(ambientesRes.data);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleTipoChange = async (value: string) => {
    if (value === 'outro') {
      setShowOutroTipo(true);
      setTipoSelecionadoId(null);
      setFormData({ ...formData, tipo_produto: '' });
    } else {
      setShowOutroTipo(false);
      const tipoSelecionado = tiposProduto.find(t => t.nome === value);
      setTipoSelecionadoId(tipoSelecionado?.id || null);
      setFormData({ ...formData, tipo_produto: value });
      
      // Carregar produtos existentes deste tipo
      const { data } = await supabase
        .from('produtos')
        .select('id, nome')
        .eq('fabrica_id', fabricaId)
        .eq('tipo_produto', value)
        .order('nome');
      
      if (data) {
        setProdutosExistentes(data);
      }
    }
  };

  const handleSubmitSugestao = async () => {
    if (!sugestaoTipo.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o tipo de produto que deseja sugerir.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sugestoes_tipo_produto')
        .insert({
          nome_sugerido: sugestaoTipo,
          descricao: descricaoSugestao,
          fabrica_id: fabricaId,
        });

      if (error) throw error;

      toast({
        title: 'Sugestão enviada',
        description: 'Sua sugestão será analisada pela equipe. Você receberá uma notificação quando for aprovada.',
      });

      setSugestaoTipo('');
      setDescricaoSugestao('');
      setShowOutroTipo(false);
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a sugestão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitSugestaoAmbiente = async () => {
    if (!sugestaoAmbiente.trim() || !tipoSelecionadoId) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o ambiente que deseja sugerir.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sugestoes_campo_produto')
        .insert({
          nome_campo: 'ambiente',
          valor_sugerido: sugestaoAmbiente,
          fabrica_id: fabricaId,
          tipo_produto_id: tipoSelecionadoId,
        });

      if (error) throw error;

      toast({
        title: 'Sugestão enviada',
        description: 'Sua sugestão de ambiente será analisada. Você receberá uma notificação quando for aprovada.',
      });

      setSugestaoAmbiente('');
      setShowOutroAmbiente(false);
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a sugestão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const toggleAmbiente = (ambienteNome: string) => {
    if (ambienteNome === 'outro') {
      setShowOutroAmbiente(true);
      return;
    }
    
    if (ambientesSelecionados.includes(ambienteNome)) {
      setAmbientesSelecionados(ambientesSelecionados.filter(a => a !== ambienteNome));
    } else {
      setAmbientesSelecionados([...ambientesSelecionados, ambienteNome]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipo_produto) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, selecione o tipo de produto.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o nome do produto.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (produto) {
        const { error } = await supabase
          .from('produtos')
          .update({
            ...formData,
            imagens: images,
            ambientes: ambientesSelecionados,
            tempo_fabricacao_dias: formData.tempo_fabricacao_dias ? parseInt(formData.tempo_fabricacao_dias) : null,
          })
          .eq('id', produto.id);

        if (error) throw error;

        toast({
          title: 'Produto atualizado',
          description: 'O produto foi atualizado com sucesso!',
        });
      } else {
        const { data, error } = await supabase
          .from('produtos')
          .insert({
            ...formData,
            fabrica_id: fabricaId,
            imagens: images,
            ambientes: ambientesSelecionados,
            tempo_fabricacao_dias: formData.tempo_fabricacao_dias ? parseInt(formData.tempo_fabricacao_dias) : null,
          })
          .select()
          .single();

        if (error) throw error;

        setProdutoId(data.id);

        toast({
          title: 'Produto criado',
          description: 'Produto cadastrado! Agora adicione as variações.',
        });
      }
    } catch (error: any) {
      console.error('Error saving produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onClose}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal - Formulário */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{produto ? 'Editar Produto' : 'Nova Peça'}</CardTitle>
            </CardHeader>
            <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TIPO DE PRODUTO - PRIMEIRO CAMPO */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Produto *</Label>
              <Select value={formData.tipo_produto || undefined} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de produto" />
                </SelectTrigger>
                <SelectContent>
                  {tiposProduto.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.nome}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="outro">Outro (sugerir novo tipo)</SelectItem>
                </SelectContent>
              </Select>
              
              {showOutroTipo && (
                <Card className="mt-4 p-4 border-primary">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Não encontrou o tipo que procura? Sugira um novo tipo para nossa equipe avaliar.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="sugestao-tipo">Nome do Tipo *</Label>
                      <Input
                        id="sugestao-tipo"
                        value={sugestaoTipo}
                        onChange={(e) => setSugestaoTipo(e.target.value)}
                        placeholder="Ex: Mesa Buffet, Rack Suspenso..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao-sugestao">Descrição (opcional)</Label>
                      <Textarea
                        id="descricao-sugestao"
                        value={descricaoSugestao}
                        onChange={(e) => setDescricaoSugestao(e.target.value)}
                        placeholder="Descreva brevemente este tipo de produto..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleSubmitSugestao} className="flex-1">
                        Enviar Sugestão
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowOutroTipo(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Só mostra os demais campos se o tipo foi selecionado */}
            {formData.tipo_produto && !showOutroTipo && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={modoNome === 'existente' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setModoNome('existente')}
                      disabled={produtosExistentes.length === 0}
                    >
                      Selecionar Existente
                    </Button>
                    <Button
                      type="button"
                      variant={modoNome === 'novo' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setModoNome('novo')}
                    >
                      Criar Novo
                    </Button>
                  </div>
                  
                  {modoNome === 'existente' && produtosExistentes.length > 0 ? (
                    <Select 
                      value={produtoSelecionadoId} 
                      onValueChange={async (value) => {
                        setProdutoSelecionadoId(value);
                        // Carregar dados do produto selecionado
                        const produtoSelecionado = produtosExistentes.find(p => p.id === value);
                        if (produtoSelecionado) {
                          setFormData({ ...formData, nome: produtoSelecionado.nome });
                          // Carregar o produto completo
                          const { data } = await supabase
                            .from('produtos')
                            .select('*')
                            .eq('id', value)
                            .single();
                          
                          if (data) {
                            setProdutoId(data.id);
                            setImages((data.imagens as string[]) || []);
                            setAmbientesSelecionados((data.ambientes as string[]) || []);
                            setFormData({
                              tipo_produto: data.tipo_produto,
                              nome: data.nome,
                              descricao: data.descricao || '',
                              tempo_fabricacao_dias: data.tempo_fabricacao_dias || '',
                            });
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtosExistentes.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id}>
                            {prod.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Aura"
                      required
                    />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {modoNome === 'existente' 
                      ? `Selecione um ${formData.tipo_produto.toLowerCase()} existente para adicionar nova variação`
                      : `Escolha um nome único para este ${formData.tipo_produto.toLowerCase()}`
                    }
                  </p>
                </div>
              </>
            )}
          </form>
            </CardContent>
          </Card>

          {/* PersonalizacoesManager - Aparece após criar/editar o produto */}
          {produtoId && (
            <>
              <PersonalizacoesManager produtoId={produtoId} fabricaId={fabricaId} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Fotografias ({images.length}/10)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione até 10 fotos do produto. A primeira será a imagem de capa.
                  </p>
                  <ImageUpload
                    fabricaId={fabricaId}
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {formData.tipo_produto && !showOutroTipo && produtoId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Ambientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecione os ambientes onde este produto pode ser usado
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ambientesDisponiveis.map((ambiente) => (
                        <Badge
                          key={ambiente.id}
                          variant={ambientesSelecionados.includes(ambiente.nome) ? "default" : "outline"}
                          className="cursor-pointer py-2 px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => toggleAmbiente(ambiente.nome)}
                        >
                          {ambiente.nome}
                          {ambientesSelecionados.includes(ambiente.nome) && (
                            <X className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className="cursor-pointer py-2 px-3 border-dashed hover:bg-muted transition-colors"
                        onClick={() => setShowOutroAmbiente(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Outro
                      </Badge>
                    </div>
                    
                    {showOutroAmbiente && (
                      <Card className="mt-4 p-4 border-primary">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Não encontrou o ambiente que procura? Sugira um novo para nossa equipe avaliar.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="sugestao-ambiente">Nome do Ambiente *</Label>
                            <Input
                              id="sugestao-ambiente"
                              value={sugestaoAmbiente}
                              onChange={(e) => setSugestaoAmbiente(e.target.value)}
                              placeholder="Ex: Home Office, Área Gourmet..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" onClick={handleSubmitSugestaoAmbiente} className="flex-1">
                              Enviar Sugestão
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowOutroAmbiente(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Fabricação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="tempo">Tempo de Fabricação (dias)</Label>
                    <Input
                      id="tempo"
                      type="number"
                      min="1"
                      value={formData.tempo_fabricacao_dias}
                      onChange={(e) => setFormData({ ...formData, tempo_fabricacao_dias: e.target.value })}
                      placeholder="Ex: 30"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Coluna lateral - Acervo de Materiais */}
        {produtoId && (
          <div className="lg:col-span-1">
            <AcervoMateriais produtoId={produtoId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutoForm;
