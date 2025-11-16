import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Package, 
  Users, 
  Home, 
  LogIn, 
  LayoutDashboard, 
  ShoppingBag,
  RefreshCw,
  Code
} from 'lucide-react';

const Dev = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentRole();
  }, [user]);

  const fetchCurrentRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setCurrentRole(data?.role || null);
    } catch (error: any) {
      console.error('Error fetching role:', error);
    }
  };

  const switchRole = async (role: 'fabrica' | 'fornecedor' | 'especificador') => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role });

      if (error) throw error;

      setCurrentRole(role);
      toast({
        title: 'Role alterado!',
        description: `Agora você está como: ${role}`,
      });

      // Refresh the page to reload dashboard
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro ao trocar role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'fabrica',
      name: 'Fábrica',
      icon: Building2,
      description: 'Gerenciar produtos e especificadores',
      color: 'bg-blue-500',
    },
    {
      id: 'fornecedor',
      name: 'Fornecedor',
      icon: Package,
      description: 'Fornecer materiais para fábricas',
      color: 'bg-green-500',
    },
    {
      id: 'especificador',
      name: 'Especificador',
      icon: Users,
      description: 'Especificar produtos para projetos',
      color: 'bg-purple-500',
    },
  ];

  const pages = [
    { path: '/', name: 'Home', icon: Home, description: 'Página inicial pública' },
    { path: '/auth', name: 'Autenticação', icon: LogIn, description: 'Login e cadastro' },
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Dashboard principal (requer role)' },
    { path: '/catalogo', name: 'Catálogo', icon: ShoppingBag, description: 'Catálogo de produtos' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Modo Desenvolvedor</h1>
              <p className="text-muted-foreground">Visualize e teste todas as interfaces</p>
            </div>
          </div>
          {user && (
            <Badge variant="outline" className="text-sm">
              {user.email}
            </Badge>
          )}
        </div>

        {/* Current Role */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Role Atual</CardTitle>
              <CardDescription>
                {currentRole ? `Você está visualizando como: ${currentRole}` : 'Nenhum role selecionado'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentRole && (
                  <Badge className="text-lg px-4 py-2">
                    {currentRole.toUpperCase()}
                  </Badge>
                )}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> Use o botão flutuante no canto inferior direito para trocar rapidamente entre perfis em qualquer página!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Switcher */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Trocar de Perfil</CardTitle>
              <CardDescription>
                Selecione um perfil para visualizar sua interface específica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = currentRole === role.id;

                  return (
                    <Button
                      key={role.id}
                      variant={isActive ? 'default' : 'outline'}
                      className="h-auto p-6 flex-col items-start gap-3"
                      onClick={() => switchRole(role.id as any)}
                      disabled={loading || isActive}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg ${role.color} bg-opacity-20`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold">{role.name}</div>
                          {isActive && (
                            <Badge variant="secondary" className="mt-1">
                              Ativo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {role.description}
                      </p>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-500">
            <CardHeader>
              <CardTitle className="text-amber-600">Autenticação Necessária</CardTitle>
              <CardDescription>
                Você precisa estar autenticado para trocar de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pages Navigator */}
        <Card>
          <CardHeader>
            <CardTitle>Navegação Rápida</CardTitle>
            <CardDescription>
              Acesse rapidamente todas as páginas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Button
                    key={page.path}
                    variant="outline"
                    className="h-auto p-4 justify-start gap-4"
                    onClick={() => navigate(page.path)}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">{page.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {page.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-blue-500 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-blue-600">Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Faça login primeiro se ainda não estiver autenticado</p>
            <p>2. Selecione um perfil (Fábrica, Fornecedor ou Especificador)</p>
            <p>3. Navegue para o Dashboard para ver a interface específica do perfil</p>
            <p>4. Use a navegação rápida para acessar outras páginas</p>
            <p>5. Troque de perfil sempre que precisar testar outra interface</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dev;
