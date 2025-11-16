import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Building2, Package, Settings } from 'lucide-react';
import EspecificadorProfile from './EspecificadorProfile';
import FabricasSearch from './FabricasSearch';
import ProdutosSearch from './ProdutosSearch';

interface EspecificadorDashboardProps {
  userId: string;
}

const EspecificadorDashboard = ({ userId }: EspecificadorDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [especificador, setEspecificador] = useState<any>(null);
  const [stats, setStats] = useState({
    fabricasAcessiveis: 0,
    solicitacoesPendentes: 0,
  });

  useEffect(() => {
    fetchEspecificadorData();
  }, [userId]);

  const fetchEspecificadorData = async () => {
    try {
      const { data: especData, error: especError } = await supabase
        .from('especificador')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (especError) throw especError;

      if (especData) {
        setEspecificador(especData);

        const { count: aprovadosCount } = await supabase
          .from('fabrica_especificador')
          .select('*', { count: 'exact', head: true })
          .eq('especificador_id', especData.id)
          .eq('status', 'aprovado');

        const { count: pendentesCount } = await supabase
          .from('fabrica_especificador')
          .select('*', { count: 'exact', head: true })
          .eq('especificador_id', especData.id)
          .eq('status', 'pendente');

        setStats({
          fabricasAcessiveis: aprovadosCount || 0,
          solicitacoesPendentes: pendentesCount || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching especificador:', error);
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

  if (!especificador) {
    return <EspecificadorProfile userId={userId} onComplete={fetchEspecificadorData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{especificador.nome}</h1>
            <p className="text-sm text-muted-foreground">{especificador.email}</p>
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
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fábricas Acessíveis</p>
                <p className="text-2xl font-bold">{stats.fabricasAcessiveis}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solicitações Pendentes</p>
                <p className="text-2xl font-bold">{stats.solicitacoesPendentes}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="produtos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="produtos" className="gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="fabricas" className="gap-2">
              <Building2 className="w-4 h-4" />
              Fábricas
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2">
              <Settings className="w-4 h-4" />
              Meu Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos">
            <ProdutosSearch especificadorId={especificador.id} />
          </TabsContent>

          <TabsContent value="fabricas">
            <FabricasSearch especificadorId={especificador.id} onUpdate={fetchEspecificadorData} />
          </TabsContent>

          <TabsContent value="perfil">
            <EspecificadorProfile 
              userId={userId} 
              especificadorData={especificador}
              onComplete={fetchEspecificadorData} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EspecificadorDashboard;
