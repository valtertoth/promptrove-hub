import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

interface VariacoesListProps {
  produtoId: string;
  fabricaId: string;
}

const VariacoesList = ({ produtoId, fabricaId }: VariacoesListProps) => {
  const [variacoes, setVariacoes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    sku: '',
    preco_sugerido: '',
    estoque: '',
    largura: '',
    altura: '',
    profundidade: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVariacoes();
  }, [produtoId]);

  const fetchVariacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('variacoes_produto')
        .select('*')
        .eq('produto_id', produtoId);

      if (error) throw error;
      setVariacoes(data || []);
    } catch (error: any) {
      console.error('Error fetching variacoes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('variacoes_produto')
        .insert({
          produto_id: produtoId,
          sku: formData.sku,
          preco_sugerido: formData.preco_sugerido ? parseFloat(formData.preco_sugerido) : null,
          estoque: formData.estoque ? parseInt(formData.estoque) : 0,
          imagens: images,
          medidas: {
            largura: formData.largura,
            altura: formData.altura,
            profundidade: formData.profundidade,
          },
        });

      if (error) throw error;

      toast({
        title: 'Variação criada',
        description: 'A variação foi adicionada com sucesso!',
      });

      setFormData({
        sku: '',
        preco_sugerido: '',
        estoque: '',
        largura: '',
        altura: '',
        profundidade: '',
      });
      setImages([]);
      setShowForm(false);
      fetchVariacoes();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar variação.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta variação?')) return;

    try {
      const { error } = await supabase
        .from('variacoes_produto')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Variação removida',
        description: 'A variação foi removida com sucesso.',
      });

      fetchVariacoes();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover variação.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Variações do Produto</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Variação
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="border p-4 rounded-lg space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_sugerido">Preço Sugerido</Label>
                <Input
                  id="preco_sugerido"
                  type="number"
                  step="0.01"
                  value={formData.preco_sugerido}
                  onChange={(e) => setFormData({ ...formData, preco_sugerido: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque</Label>
                <Input
                  id="estoque"
                  type="number"
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="largura">Largura (cm)</Label>
                <Input
                  id="largura"
                  value={formData.largura}
                  onChange={(e) => setFormData({ ...formData, largura: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profundidade">Profundidade (cm)</Label>
                <Input
                  id="profundidade"
                  value={formData.profundidade}
                  onChange={(e) => setFormData({ ...formData, profundidade: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagens da Variação</Label>
              <ImageUpload
                fabricaId={fabricaId}
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Adicionar Variação</Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false);
                setImages([]);
              }}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {variacoes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma variação cadastrada ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {variacoes.map((variacao) => (
              <div key={variacao.id} className="border p-3 rounded space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{variacao.sku || 'Sem SKU'}</p>
                    <p className="text-sm text-muted-foreground">
                      {variacao.medidas?.largura && `${variacao.medidas.largura}cm`}
                      {variacao.medidas?.altura && ` x ${variacao.medidas.altura}cm`}
                      {variacao.medidas?.profundidade && ` x ${variacao.medidas.profundidade}cm`}
                    </p>
                    {variacao.preco_sugerido && (
                      <p className="text-sm">
                        Preço: R$ {parseFloat(variacao.preco_sugerido).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(variacao.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {variacao.imagens && variacao.imagens.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {variacao.imagens.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Variação ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariacoesList;
