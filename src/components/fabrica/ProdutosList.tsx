import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProdutoForm from './ProdutoForm';

interface ProdutosListProps {
  fabricaId: string;
}

const ProdutosList = ({ fabricaId }: ProdutosListProps) => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProdutos();
  }, [fabricaId]);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('fabrica_id', fabricaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error: any) {
      console.error('Error fetching produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Produto removido',
        description: 'O produto foi desativado com sucesso.',
      });

      fetchProdutos();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover produto.',
        variant: 'destructive',
      });
    }
  };

  if (showForm) {
    return (
      <ProdutoForm
        fabricaId={fabricaId}
        produto={editingProduto}
        onClose={() => {
          setShowForm(false);
          setEditingProduto(null);
          fetchProdutos();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meus Produtos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {loading ? (
        <p>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Você ainda não tem produtos cadastrados.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Primeiro Produto
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <Card key={produto.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{produto.nome}</h3>
                  {produto.tipo_produto && (
                    <p className="text-sm text-muted-foreground">{produto.tipo_produto}</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${produto.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>
              
              {produto.descricao && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {produto.descricao}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProduto(produto);
                    setShowForm(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(produto.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProdutosList;
