import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Package, Users, Settings, Plus } from 'lucide-react';
import FabricaProfile from './FabricaProfile';
import ProdutosList from './ProdutosList';
import EspecificadoresList from './EspecificadoresList';

interface FabricaDashboardProps {
  userId: string;
}

const FabricaDashboard = ({ userId }: FabricaDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fabrica, setFabrica] = useState<any>(null);
  const [stats, setStats] = useState({
    produtos: 0,
    especificadores: 0,
    perfilCompleto: 0,
  });

  useEffect(() => {
    fetchFabricaData();
  }, [userId]);

  const fetchFabricaData = async () => {
    try {
      const { data: fabricaData, error: fabricaError } = await supabase
        .from('fabrica')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fabricaError) throw fabricaError;

      if (fabricaData) {
        setFabrica(fabricaData);

        const { count: produtosCount } = await supabase
          .from('produtos')
          .select('*', { count: 'exact', head: true })
          .eq('fabrica_id', fabricaData.id)
          .eq('ativo', true);

        const { count: especCount } = await supabase
          .from('fabrica_especificador')
          .select('*', { count: 'exact', head: true })
          .eq('fabrica_id', fabricaData.id)
          .eq('status', 'aprovado');

        setStats({
          produtos: produtosCount || 0,
          especificadores: especCount || 0,
          perfilCompleto: fabricaData.perfil_completo_percentual || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching fabrica:', error);
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

  if (!fabrica) {
    return <FabricaProfile userId={userId} onComplete={fetchFabricaData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{fabrica.nome}</h1>
            <p className="text-sm text-muted-foreground">{fabrica.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perfil Completo</p>
                <p className="text-2xl font-bold">{stats.perfilCompleto}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                <p className="text-2xl font-bold">{stats.produtos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Especificadores</p>
                <p className="text-2xl font-bold">{stats.especificadores}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="produtos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="especificadores">Especificadores</TabsTrigger>
            <TabsTrigger value="perfil">Perfil da Fábrica</TabsTrigger>
          </TabsList>

          <TabsContent value="produtos">
            <ProdutosList fabricaId={fabrica.id} />
          </TabsContent>

          <TabsContent value="especificadores">
            <EspecificadoresList fabricaId={fabrica.id} />
          </TabsContent>

          <TabsContent value="perfil">
            <FabricaProfile userId={userId} fabricaData={fabrica} onComplete={fetchFabricaData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FabricaDashboard;
