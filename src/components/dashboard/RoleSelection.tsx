import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleSelectionProps {
  userId: string;
}

const RoleSelection = ({ userId }: RoleSelectionProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelection = async (role: AppRole) => {
    setLoading(true);
    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (roleError) throw roleError;

      toast({
        title: 'Perfil criado',
        description: 'Seu perfil foi criado com sucesso!',
      });

      window.location.reload();
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
      <Card className="p-8 max-w-4xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-center">Escolha seu perfil</h2>
        <p className="text-muted-foreground mb-8 text-center">
          Para começar, selecione o tipo de conta que deseja criar:
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-elegant transition-all">
            <h3 className="font-semibold text-xl mb-3">Fábrica</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cadastre seus produtos e conecte-se com especificadores
            </p>
            <Button
              onClick={() => handleRoleSelection('fabrica')}
              disabled={loading}
              className="w-full"
            >
              Selecionar
            </Button>
          </Card>
          <Card className="p-6 hover:shadow-elegant transition-all">
            <h3 className="font-semibold text-xl mb-3">Fornecedor</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Disponibilize seus materiais para as fábricas
            </p>
            <Button
              onClick={() => handleRoleSelection('fornecedor')}
              disabled={loading}
              className="w-full"
            >
              Selecionar
            </Button>
          </Card>
          <Card className="p-6 hover:shadow-elegant transition-all">
            <h3 className="font-semibold text-xl mb-3">Especificador</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Acesse catálogos exclusivos de fábricas premium
            </p>
            <Button
              onClick={() => handleRoleSelection('especificador')}
              disabled={loading}
              className="w-full"
            >
              Selecionar
            </Button>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default RoleSelection;
