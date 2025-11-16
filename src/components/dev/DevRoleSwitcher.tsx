import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Package, Users, Code, X, ChevronDown, ChevronUp } from 'lucide-react';

const DevRoleSwitcher = () => {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentRole();
  }, [user]);

  const fetchCurrentRole = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentRole(data?.role || null);
    } catch (error) {
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
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role });

      if (error) throw error;

      setCurrentRole(role);
      toast({
        title: 'Perfil alterado!',
        description: `Mudando para: ${getRoleLabel(role)}`,
      });

      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload();
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Erro ao trocar perfil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'fabrica': return 'Fábrica';
      case 'fornecedor': return 'Fornecedor';
      case 'especificador': return 'Especificador';
      default: return 'Sem perfil';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'fabrica': return <Building2 className="w-4 h-4" />;
      case 'fornecedor': return <Package className="w-4 h-4" />;
      case 'especificador': return <Users className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'fabrica': return 'bg-blue-500 hover:bg-blue-600';
      case 'fornecedor': return 'bg-green-500 hover:bg-green-600';
      case 'especificador': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-muted';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="shadow-xl border-2 border-primary/20">
        {isExpanded ? (
          <div className="p-4 space-y-3 w-64">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm">Dev Mode</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Perfil atual: <span className="font-semibold">{getRoleLabel(currentRole || '')}</span>
              </p>

              <div className="space-y-2">
                <Button
                  onClick={() => switchRole('fabrica')}
                  disabled={loading || currentRole === 'fabrica'}
                  className={`w-full justify-start gap-2 ${getRoleColor('fabrica')}`}
                  size="sm"
                >
                  <Building2 className="w-4 h-4" />
                  Fábrica
                </Button>

                <Button
                  onClick={() => switchRole('fornecedor')}
                  disabled={loading || currentRole === 'fornecedor'}
                  className={`w-full justify-start gap-2 ${getRoleColor('fornecedor')}`}
                  size="sm"
                >
                  <Package className="w-4 h-4" />
                  Fornecedor
                </Button>

                <Button
                  onClick={() => switchRole('especificador')}
                  disabled={loading || currentRole === 'especificador'}
                  className={`w-full justify-start gap-2 ${getRoleColor('especificador')}`}
                  size="sm"
                >
                  <Users className="w-4 h-4" />
                  Especificador
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dev')}
                className="w-full"
              >
                Modo Dev Completo
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="w-full"
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Minimizar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsExpanded(true)}
            className={`${getRoleColor(currentRole || '')} gap-2`}
          >
            {getRoleIcon(currentRole || '')}
            {getRoleLabel(currentRole || '')}
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </Card>
    </div>
  );
};

export default DevRoleSwitcher;
