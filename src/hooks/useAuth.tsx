import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Usa logout local para garantir limpeza do storage mesmo se a sessão no servidor já expirou
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Garante que o token persistido foi removido (evita redirecionar de /auth de volta para /dashboard)
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (/^sb-.*-auth-token$/.test(key) || key === 'supabase.auth.token') {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // ignore
      }

      setSession(null);
      setUser(null);
      window.location.replace('/auth');
    }
  };

  return { user, session, loading, signOut };
}
