import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import FabricaDashboard from '@/components/fabrica/FabricaDashboard';
import EspecificadorDashboard from '@/components/especificador/EspecificadorDashboard';
import FornecedorDashboard from '@/components/fornecedor/FornecedorDashboard';
import RoleSelection from '@/components/dashboard/RoleSelection';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <RoleSelection userId={user?.id || ''} />;
  }

  if (userRole === 'fabrica') {
    return <FabricaDashboard userId={user?.id || ''} />;
  }

  if (userRole === 'especificador') {
    return <EspecificadorDashboard userId={user?.id || ''} />;
  }

  if (userRole === 'fornecedor') {
    return <FornecedorDashboard userId={user?.id || ''} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Dashboard {userRole}</h1>
        <p className="text-muted-foreground">Em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default Dashboard;
