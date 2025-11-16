import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import VariacoesList from './VariacoesList';
import ImageUpload from './ImageUpload';
import FornecedorSelector from './FornecedorSelector';

interface ProdutoFormProps {
  fabricaId: string;
  produto?: any;
  onClose: () => void;
}

const ProdutoForm = ({ fabricaId, produto, onClose }: ProdutoFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [produtoId, setProdutoId] = useState(produto?.id || null);
  const [images, setImages] = useState<string[]>(produto?.imagens || []);
  const [categorias, setCategorias] = useState<string[]>(produto?.categorias || []);
  const [tags, setTags] = useState<string[]>(produto?.tags || []);
  const [newCategoria, setNewCategoria] = useState('');
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState({
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    tipo_produto: produto?.tipo_produto || '',
    tempo_fabricacao_dias: produto?.tempo_fabricacao_dias || '',
  });

  const addCategoria = () => {
    if (newCategoria && !categorias.includes(newCategoria)) {
      setCategorias([...categorias, newCategoria]);
      setNewCategoria('');
    }
  };

  const removeCategoria = (cat: string) => {
    setCategorias(categorias.filter(c => c !== cat));
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (produto) {
        const { error } = await supabase
          .from('produtos')
          .update({
            ...formData,
            imagens: images,
            categorias: categorias,
            tags: tags,
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
            categorias: categorias,
            tags: tags,
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

      <Card>
        <CardHeader>
          <CardTitle>{produto ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_produto">Tipo de Produto</Label>
                <Input
                  id="tipo_produto"
                  value={formData.tipo_produto}
                  onChange={(e) => setFormData({ ...formData, tipo_produto: e.target.value })}
                  placeholder="Ex: Cadeira, Mesa, Sofá"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempo_fabricacao_dias">Tempo de Fabricação (dias)</Label>
                <Input
                  id="tempo_fabricacao_dias"
                  type="number"
                  value={formData.tempo_fabricacao_dias}
                  onChange={(e) => setFormData({ ...formData, tempo_fabricacao_dias: e.target.value })}
                />
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  placeholder="Descreva seu produto..."
                />
              </div>

              <div className="space-y-2">
                <Label>Categorias</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Mobiliário, Decoração..."
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategoria())}
                  />
                  <Button type="button" onClick={addCategoria} variant="outline">
                    Adicionar
                  </Button>
                </div>
                {categorias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categorias.map((cat) => (
                      <Badge key={cat} variant="secondary" className="cursor-pointer" onClick={() => removeCategoria(cat)}>
                        {cat} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Sustentável, Artesanal..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Adicionar
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Imagens do Produto</Label>
                <ImageUpload
                  fabricaId={fabricaId}
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : produto ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            </form>
        </CardContent>
      </Card>

      {produtoId && (
        <>
          <FornecedorSelector produtoId={produtoId} />
          <VariacoesList produtoId={produtoId} fabricaId={fabricaId} />
        </>
      )}
    </div>
  );
};

export default ProdutoForm;
