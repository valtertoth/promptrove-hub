import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        setUserRole(data?.role || null);
      } catch (error: any) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl p-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.email}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sair
          </Button>
        </div>

        {!userRole ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Escolha seu perfil</h2>
            <p className="text-muted-foreground mb-6">
              Para começar, selecione o tipo de conta que deseja criar:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer card-premium">
                <h3 className="font-semibold text-xl mb-2">Fábrica</h3>
                <p className="text-sm text-muted-foreground">
                  Cadastre seus produtos e conecte-se com especificadores
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer card-premium">
                <h3 className="font-semibold text-xl mb-2">Fornecedor</h3>
                <p className="text-sm text-muted-foreground">
                  Disponibilize seus materiais para as fábricas
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer card-premium">
                <h3 className="font-semibold text-xl mb-2">Especificador</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse catálogos exclusivos de fábricas premium
                </p>
              </Card>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 card-premium">
              <h3 className="font-semibold text-lg mb-2">Perfil Completo</h3>
              <div className="text-3xl font-bold text-accent">0%</div>
              <p className="text-sm text-muted-foreground mt-2">Complete seu perfil para aparecer nas buscas</p>
            </Card>
            
            <Card className="p-6 card-premium">
              <h3 className="font-semibold text-lg mb-2">Produtos Ativos</h3>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground mt-2">Produtos cadastrados e ativos</p>
            </Card>
            
            <Card className="p-6 card-premium">
              <h3 className="font-semibold text-lg mb-2">Especificadores</h3>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground mt-2">Especificadores aprovados</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
