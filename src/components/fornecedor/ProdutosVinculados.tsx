import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProdutosVinculadosProps {
  fornecedorId: string;
}

const ProdutosVinculados = ({ fornecedorId }: ProdutosVinculadosProps) => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProdutos();
  }, [fornecedorId]);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produto_fornecedor')
        .select(`
          *,
          produto:produto_id (
            id,
            nome,
            descricao,
            imagens,
            fabrica:fabrica_id (
              nome,
              cidade,
              estado
            )
          )
        `)
        .eq('fornecedor_id', fornecedorId);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error: any) {
      console.error('Error fetching produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Produtos que Utilizam seus Materiais</h2>

      {produtos.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum produto vinculado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Quando fábricas utilizarem seus materiais, eles aparecerão aqui.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {produtos.map((item: any) => {
            const produto = item.produto;
            const imagem = produto?.imagens?.[0];

            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {imagem && (
                    <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-l-lg">
                      <img
                        src={imagem}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-lg">{produto?.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>{produto?.fabrica?.nome}</span>
                      </div>
                      {produto?.fabrica?.cidade && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {produto.fabrica.cidade}, {produto.fabrica.estado}
                          </span>
                        </div>
                      )}
                      {item.material_utilizado && (
                        <Badge variant="secondary" className="text-xs">
                          Material: {item.material_utilizado}
                        </Badge>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProdutosVinculados;
