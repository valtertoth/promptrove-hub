import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Package, Link2, Settings } from 'lucide-react';
import FornecedorProfile from './FornecedorProfile';
import MateriaisManager from './MateriaisManager';
import ProdutosVinculados from './ProdutosVinculados';

interface FornecedorDashboardProps {
  userId: string;
}

const FornecedorDashboard = ({ userId }: FornecedorDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fornecedor, setFornecedor] = useState<any>(null);
  const [stats, setStats] = useState({
    materiais: 0,
    produtosVinculados: 0,
  });

  useEffect(() => {
    fetchFornecedorData();
  }, [userId]);

  const fetchFornecedorData = async () => {
    try {
      const { data: fornecedorData, error: fornecedorError } = await supabase
        .from('fornecedor')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fornecedorError) throw fornecedorError;

      if (fornecedorData) {
        setFornecedor(fornecedorData);

        const materiaisCount = Array.isArray(fornecedorData.materiais) 
          ? fornecedorData.materiais.length 
          : 0;

        const { count: produtosCount } = await supabase
          .from('produto_fornecedor')
          .select('*', { count: 'exact', head: true })
          .eq('fornecedor_id', fornecedorData.id);

        setStats({
          materiais: materiaisCount,
          produtosVinculados: produtosCount || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching fornecedor:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
    navigate('/');
  };

  if (!fornecedor) {
    return <FornecedorProfile userId={userId} onComplete={fetchFornecedorData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{fornecedor.nome}</h1>
            <p className="text-sm text-muted-foreground">
              Fornecedor de {fornecedor.tipo_material}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Materiais Cadastrados</p>
                <p className="text-2xl font-bold">{stats.materiais}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Link2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos Vinculados</p>
                <p className="text-2xl font-bold">{stats.produtosVinculados}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="materiais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="materiais" className="gap-2">
              <Package className="w-4 h-4" />
              Materiais
            </TabsTrigger>
            <TabsTrigger value="produtos" className="gap-2">
              <Link2 className="w-4 h-4" />
              Produtos Vinculados
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2">
              <Settings className="w-4 h-4" />
              Meu Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materiais">
            <MateriaisManager 
              fornecedorId={fornecedor.id}
              materiais={fornecedor.materiais || []}
              onUpdate={fetchFornecedorData}
            />
          </TabsContent>

          <TabsContent value="produtos">
            <ProdutosVinculados fornecedorId={fornecedor.id} />
          </TabsContent>

          <TabsContent value="perfil">
            <FornecedorProfile 
              userId={userId}
              fornecedorData={fornecedor}
              onComplete={fetchFornecedorData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FornecedorDashboard;
