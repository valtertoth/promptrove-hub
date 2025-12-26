import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FolderOpen,
  FileText,
  ArrowLeft,
  Package,
  Trash2,
  Plus,
  Download,
  Edit,
  Loader2,
  User,
  Calendar,
} from 'lucide-react';

interface ItemProjeto {
  id: string;
  quantidade: number;
  ambiente: string | null;
  created_at: string;
  produto: {
    id: string;
    nome: string;
    tipo_produto: string | null;
    fabrica: {
      nome: string;
    } | null;
  };
}

interface Projeto {
  id: string;
  nome_projeto: string;
  cliente: string | null;
  created_at: string;
  updated_at: string;
  itens: ItemProjeto[];
}

const MeusProjetos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [especificadorId, setEspecificadorId] = useState<string | null>(null);

  // Dialog para criar novo projeto
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoCliente, setNovoCliente] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar especificador
      const { data: especData, error: especError } = await supabase
        .from('especificador')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (especError) throw especError;

      if (!especData) {
        toast({
          title: 'Perfil não encontrado',
          description: 'Você precisa ser um especificador para acessar esta página.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setEspecificadorId(especData.id);

      // Buscar projetos com itens
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          *,
          itens:itens_projeto (
            id,
            quantidade,
            ambiente,
            created_at,
            produto:produto_id (
              id,
              nome,
              tipo_produto,
              fabrica:fabrica_id (nome)
            )
          )
        `)
        .eq('especificador_id', especData.id)
        .order('updated_at', { ascending: false });

      if (projetosError) throw projetosError;

      setProjetos(projetosData || []);
    } catch (error: any) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus projetos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProjeto = async () => {
    if (!especificadorId || !novoNome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para o projeto.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('projetos').insert({
        nome_projeto: novoNome.trim(),
        cliente: novoCliente.trim() || null,
        especificador_id: especificadorId,
      });

      if (error) throw error;

      toast({
        title: 'Projeto criado!',
        className: 'bg-emerald-600 text-white',
      });

      setNovoNome('');
      setNovoCliente('');
      setIsCreateOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProjeto = async (projetoId: string, nomeProjeto: string) => {
    if (!confirm(`Excluir o projeto "${nomeProjeto}" e todos os seus itens?`)) return;

    try {
      const { error } = await supabase.from('projetos').delete().eq('id', projetoId);

      if (error) throw error;

      toast({
        title: 'Projeto excluído',
        className: 'bg-indigo-600 text-white',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('itens_projeto').delete().eq('id', itemId);

      if (error) throw error;

      toast({ title: 'Item removido' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generatePDF = (projeto: Projeto) => {
    // Criar conteúdo HTML para impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${projeto.nome_projeto} - Specifica</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .info { margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: 600; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            .badge { display: inline-block; padding: 4px 8px; background: #e5e7eb; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${projeto.nome_projeto}</h1>
            <div class="info">
              ${projeto.cliente ? `<p><strong>Cliente:</strong> ${projeto.cliente}</p>` : ''}
              <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Total de itens:</strong> ${projeto.itens.length}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Fábrica</th>
                <th>Ambiente</th>
                <th>Qtd</th>
              </tr>
            </thead>
            <tbody>
              ${projeto.itens.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.produto?.nome || 'Produto não encontrado'}</td>
                  <td>${item.produto?.tipo_produto || '-'}</td>
                  <td>${item.produto?.fabrica?.nome || '-'}</td>
                  <td>${item.ambiente || '-'}</td>
                  <td>${item.quantidade}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Gerado por Specifica - ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;

    // Abrir nova janela e imprimir
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-primary" />
                  Meus Projetos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas especificações de produtos
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {projetos.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum projeto ainda</h2>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar a especificar produtos.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {projetos.map((projeto) => (
              <AccordionItem
                key={projeto.id}
                value={projeto.id}
                className="border rounded-xl bg-card px-6"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{projeto.nome_projeto}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {projeto.cliente && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {projeto.cliente}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(projeto.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {projeto.itens.length} {projeto.itens.length === 1 ? 'item' : 'itens'}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-6">
                  <div className="border-t pt-4 mt-2">
                    {projeto.itens.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum produto neste projeto. Vá ao Catálogo para adicionar.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {projeto.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded bg-background flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{item.produto?.nome || 'Produto não encontrado'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.produto?.fabrica?.nome || 'Fábrica desconhecida'}
                                  {item.ambiente && ` • ${item.ambiente}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">Qtd: {item.quantidade}</Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteProjeto(projeto.id, projeto.nome_projeto)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Projeto
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generatePDF(projeto)}
                        disabled={projeto.itens.length === 0}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>

      {/* Dialog para criar novo projeto */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Projeto *</Label>
              <Input
                placeholder="Ex: Apartamento Centro"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <Input
                placeholder="Nome do cliente"
                value={novoCliente}
                onChange={(e) => setNovoCliente(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProjeto} disabled={creating || !novoNome.trim()}>
              {creating ? <Loader2 className="animate-spin mr-2" /> : null}
              Criar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeusProjetos;