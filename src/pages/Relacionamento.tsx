import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import RelacionamentoFabEsp from '@/components/relacionamento/RelacionamentoFabEsp';
import { Loader2 } from 'lucide-react';

const Relacionamento = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"fabrica" | "especificador" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const detectRole = async () => {
      if (!user || !connectionId) return;
      
      setLoading(true);
      try {
        // Verificar se usuário é fábrica
        const { data: fabricaData } = await supabase
          .from('fabrica')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fabricaData) {
          setUserRole('fabrica');
          setLoading(false);
          return;
        }

        // Verificar se usuário é especificador
        const { data: especData } = await supabase
          .from('especificador')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (especData) {
          setUserRole('especificador');
        }
      } catch (error) {
        console.error('Erro ao detectar role:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      detectRole();
    }
  }, [user, connectionId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!connectionId || !userRole) {
    navigate('/dashboard');
    return null;
  }

  return (
    <RelacionamentoFabEsp 
      connectionId={connectionId} 
      userRole={userRole}
      onBack={handleBack}
    />
  );
};

export default Relacionamento;
