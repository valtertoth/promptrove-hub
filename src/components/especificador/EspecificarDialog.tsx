import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, FolderOpen, Truck } from 'lucide-react';

interface Projeto {
  id: string;
  nome_projeto: string;
  cliente: string | null;
  created_at: string;
}

interface EspecificarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: {
    id: string;
    nome: string;
  } | null;
}

const TIPOS_ENTREGA = [
  { value: 'transporte_normal', label: 'Transporte Normal', description: 'Transportadora entrega até o Lojista e o Lojista faz a Entrega Local' },
  { value: 'dropshipping', label: 'Dropshipping', description: 'O Fabricante envia direto para o Consumidor Final com NF do Especificador' },
];

const EspecificarDialog = ({ open, onOpenChange, produto }: EspecificarDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [especificadorId, setEspecificadorId] = useState<string | null>(null);
  
  // Para novo projeto
  const [novoNomeProjeto, setNovoNomeProjeto] = useState('');
  const [novoCliente, setNovoCliente] = useState('');
  
  // Para projeto existente
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  
  // Dados do item
  const [quantidade, setQuantidade] = useState('1');
  const [tipoEntrega, setTipoEntrega] = useState('transporte_normal');

  useEffect(() => {
    if (open && user) {
      fetchEspecificadorAndProjetos();
    }
  }, [open, user]);

  // Gerar próximo número de venda automaticamente
  const generateNextNumeroVenda = async (especId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('nome_projeto')
        .eq('especificador_id', especId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Encontrar o maior número
      let maxNumber = 0;
      (data || []).forEach(p => {
        const match = p.nome_projeto.match(/^(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      // Retornar próximo número formatado com zeros à esquerda
      return String(maxNumber + 1).padStart(6, '0');
    } catch (error) {
      console.error('Erro ao gerar número da venda:', error);
      return String(Date.now()).slice(-6);
    }
  };

  const fetchEspecificadorAndProjetos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar especificador do usuário
      const { data: especData, error: especError } = await supabase
        .from('especificador')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (especError) throw especError;

      if (!especData) {
        toast({
          title: 'Perfil não encontrado',
          description: 'Você precisa ter um perfil de especificador para usar esta funcionalidade.',
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      setEspecificadorId(especData.id);

      // Buscar projetos do especificador
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select('*')
        .eq('especificador_id', especData.id)
        .order('created_at', { ascending: false });

      if (projetosError) throw projetosError;

      setProjetos(projetosData || []);

      // Gerar próximo número de venda automaticamente
      const nextNumber = await generateNextNumeroVenda(especData.id);
      setNovoNomeProjeto(nextNumber);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus projetos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNovoProjeto = async () => {
    if (!especificadorId || !produto) return;
    
    if (!novoNomeProjeto.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para o projeto.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Criar novo projeto
      const { data: novoProjeto, error: projetoError } = await supabase
        .from('projetos')
        .insert({
          nome_projeto: novoNomeProjeto.trim(),
          cliente: novoCliente.trim() || null,
          especificador_id: especificadorId,
        })
        .select()
        .single();

      if (projetoError) throw projetoError;

      // Adicionar item ao projeto
      const { error: itemError } = await supabase
        .from('itens_projeto')
        .insert({
          projeto_id: novoProjeto.id,
          produto_id: produto.id,
          quantidade: parseInt(quantidade) || 1,
        });

      if (itemError) throw itemError;

      toast({
        title: 'Produto especificado!',
        description: `"${produto.nome}" foi adicionado à venda "${novoNomeProjeto}".`,
        className: 'bg-emerald-600 text-white',
      });

      // Limpar e fechar
      setNovoNomeProjeto('');
      setNovoCliente('');
      setQuantidade('1');
      setTipoEntrega('transporte_normal');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o produto.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProjetoExistente = async () => {
    if (!especificadorId || !produto || !projetoSelecionado) {
      toast({
        title: 'Projeto não selecionado',
        description: 'Selecione um projeto existente.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Adicionar item ao projeto existente
      const { error: itemError } = await supabase
        .from('itens_projeto')
        .insert({
          projeto_id: projetoSelecionado,
          produto_id: produto.id,
          quantidade: parseInt(quantidade) || 1,
        });

      if (itemError) throw itemError;

      const projetoNome = projetos.find(p => p.id === projetoSelecionado)?.nome_projeto;

      toast({
        title: 'Produto especificado!',
        description: `"${produto.nome}" foi adicionado ao projeto "${projetoNome}".`,
        className: 'bg-emerald-600 text-white',
      });

      // Limpar e fechar
      setProjetoSelecionado('');
      setQuantidade('1');
      setTipoEntrega('transporte_normal');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o produto.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!produto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Especificar Produto</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Produto selecionado:</p>
              <p className="font-semibold">{produto.nome}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tipo de Entrega
                </Label>
                <Select value={tipoEntrega} onValueChange={setTipoEntrega}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ENTREGA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info sobre tipo de entrega selecionado */}
            <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
              <strong>{TIPOS_ENTREGA.find(t => t.value === tipoEntrega)?.label}:</strong>{' '}
              {TIPOS_ENTREGA.find(t => t.value === tipoEntrega)?.description}
            </div>

            <Tabs defaultValue={projetos.length > 0 ? "existente" : "novo"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existente" disabled={projetos.length === 0}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Projeto Existente
                </TabsTrigger>
              <TabsTrigger value="novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Venda
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existente" className="space-y-4 mt-4">
                {projetos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Você ainda não tem projetos. Crie um novo!
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Selecione um projeto</Label>
                      <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um projeto..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projetos.map((projeto) => (
                            <SelectItem key={projeto.id} value={projeto.id}>
                              {projeto.nome_projeto}
                              {projeto.cliente && ` - ${projeto.cliente}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSaveProjetoExistente}
                      disabled={saving || !projetoSelecionado}
                      className="w-full"
                    >
                      {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                      Adicionar ao Projeto
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="novo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Número da Venda</Label>
                  <Input
                    value={novoNomeProjeto}
                    readOnly
                    className="bg-muted cursor-not-allowed font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gerado automaticamente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cliente (opcional)</Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={novoCliente}
                    onChange={(e) => setNovoCliente(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSaveNovoProjeto}
                  disabled={saving || !novoNomeProjeto.trim()}
                  className="w-full"
                >
                  {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                  Criar Venda e Adicionar
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EspecificarDialog;