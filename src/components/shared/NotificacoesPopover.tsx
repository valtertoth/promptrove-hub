import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  metadata: any;
}

export default function NotificacoesPopover({ userId }: { userId: string }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (!userId) return;
    
    fetchNotificacoes();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('notificacoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotificacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotificacoes(data || []);
      setNaoLidas(data?.filter(n => !n.lida).length || 0);
    } catch (error) {
      console.error('Error fetching notificacoes:', error);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('id', id);

      fetchNotificacoes();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('lida', false);

      fetchNotificacoes();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {naoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {naoLidas > 0 && (
              <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas}>
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {notificacoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              <div className="space-y-2">
                {notificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      !notif.lida ? 'bg-accent/50 border-primary/20' : 'hover:bg-accent/20'
                    }`}
                    onClick={() => !notif.lida && marcarComoLida(notif.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notif.titulo}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notif.mensagem}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notif.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      {!notif.lida && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
