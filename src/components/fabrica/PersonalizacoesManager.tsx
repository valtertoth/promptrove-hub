import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PersonalizacoesManagerProps {
  produtoId: string;
  fabricaId: string;
}

interface Personalizacao {
  id: string;
  nome_componente: string;
  descricao: string | null;
  fornecedor_id: string | null;
  material: string | null;
  acabamento: string | null;
  observacoes: string | null;
  medidas: string | null;
  fornecedor?: {
    nome: string;
  };
}

interface Fornecedor {
  id: string;
  nome: string;
  tipo_material: string;
}

export default function PersonalizacoesManager({ produtoId, fabricaId }: PersonalizacoesManagerProps) {
  const { toast } = useToast();
  const [personalizacoes, setPersonalizacoes] = useState<Personalizacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [showConviteDialog, setShowConviteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [novaPersonalizacao, setNovaPersonalizacao] = useState({
    nome_componente: '',
    descricao: '',
    fornecedor_id: '',
    material: '',
    acabamento: '',
    observacoes: '',
    medidas: '',
  });

  const [conviteForm, setConviteForm] = useState({
    email: '',
    nome_empresa: '',
    mensagem: '',
  });

  useEffect(() => {
    fetchPersonalizacoes();
    fetchFornecedores();
  }, [produtoId]);

  const fetchPersonalizacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('personalizacoes_produto')
        .select('*, fornecedor:fornecedor_id(nome)')
        .eq('produto_id', produtoId)
        .order('ordem');

      if (error) throw error;
      setPersonalizacoes(data || []);
    } catch (error) {
      console.error('Error fetching personalizacoes:', error);
    }
  };

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedor')
        .select('id, nome, tipo_material')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error('Error fetching fornecedores:', error);
    }
  };

  const handleAddPersonalizacao = async () => {
    if (!novaPersonalizacao.nome_componente.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o nome do componente (ex: Tampo, Base)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('personalizacoes_produto')
        .insert({
          produto_id: produtoId,
          ...novaPersonalizacao,
          fornecedor_id: novaPersonalizacao.fornecedor_id || null,
        });

      if (error) throw error;

      toast({
        title: 'Personalização adicionada',
        description: 'Componente adicionado com sucesso!',
      });

      setNovaPersonalizacao({
        nome_componente: '',
        descricao: '',
        fornecedor_id: '',
        material: '',
        acabamento: '',
        observacoes: '',
        medidas: '',
      });

      fetchPersonalizacoes();
    } catch (error: any) {
      console.error('Error adding personalizacao:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a personalização.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePersonalizacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personalizacoes_produto')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Personalização removida',
        description: 'Componente removido com sucesso.',
      });

      fetchPersonalizacoes();
    } catch (error) {
      console.error('Error removing personalizacao:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a personalização.',
        variant: 'destructive',
      });
    }
  };

  const handleEnviarConvite = async () => {
    if (!conviteForm.email.trim() || !conviteForm.nome_empresa.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o email e nome da empresa do fornecedor.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('convites_fornecedor')
        .insert({
          fabrica_id: fabricaId,
          ...conviteForm,
          mensagem: conviteForm.mensagem || 'Junte-se à nossa rede de fornecedores de alto padrão!',
        });

      if (error) throw error;

      toast({
        title: 'Convite enviado! 📧',
        description: 'O fornecedor receberá um email com instruções para se cadastrar.',
      });

      setConviteForm({ email: '', nome_empresa: '', mensagem: '' });
      setShowConviteDialog(false);
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o convite.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personalizações do Produto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina os componentes e materiais específicos deste produto (ex: Tampo de Madeira, Base de Alumínio)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lista de Personalizações */}
          {personalizacoes.length > 0 && (
            <div className="space-y-3">
              {personalizacoes.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{p.nome_componente}</h4>
                      {p.descricao && <p className="text-sm text-muted-foreground mt-1">{p.descricao}</p>}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        {p.material && (
                          <div>
                            <span className="font-medium">Material:</span> {p.material}
                          </div>
                        )}
                        {p.acabamento && (
                          <div>
                            <span className="font-medium">Acabamento:</span> {p.acabamento}
                          </div>
                        )}
                        {p.medidas && (
                          <div className="col-span-2">
                            <span className="font-medium">Medidas:</span> {p.medidas}
                          </div>
                        )}
                        {p.fornecedor && (
                          <div className="col-span-2">
                            <span className="font-medium">Fornecedor:</span> {p.fornecedor.nome}
                          </div>
                        )}
                        {p.observacoes && (
                          <div className="col-span-2">
                            <span className="font-medium">Observações:</span> {p.observacoes}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePersonalizacao(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Form para Nova Personalização */}
          <Card className="p-4 border-dashed">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Componente
            </h4>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_componente">Nome do Componente *</Label>
                  <Input
                    id="nome_componente"
                    placeholder="Ex: Tampo, Base, Estrutura"
                    value={novaPersonalizacao.nome_componente}
                    onChange={(e) => setNovaPersonalizacao({ ...novaPersonalizacao, nome_componente: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    placeholder="Ex: Madeira Maciça Peroba-Rosa"
                    value={novaPersonalizacao.material}
                    onChange={(e) => setNovaPersonalizacao({ ...novaPersonalizacao, material: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="acabamento">Acabamento/Cor</Label>
                  <Input
                    id="acabamento"
                    placeholder="Ex: Cor Natural, Fendi"
                    value={novaPersonalizacao.acabamento}
                    onChange={(e) => setNovaPersonalizacao({ ...novaPersonalizacao, acabamento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="medidas">
                    Medidas (C x L x A)
                    <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                  </Label>
                  <Input
                    id="medidas"
                    placeholder="Ex: 180cm x 90cm x 75cm"
                    value={novaPersonalizacao.medidas}
                    onChange={(e) => setNovaPersonalizacao({ ...novaPersonalizacao, medidas: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fornecedor">
                  Fornecedor
                  <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={novaPersonalizacao.fornecedor_id}
                    onValueChange={(value) => setNovaPersonalizacao({ ...novaPersonalizacao, fornecedor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione ou convide" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome} ({f.tipo_material})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    <Dialog open={showConviteDialog} onOpenChange={setShowConviteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" title="Convidar fornecedor">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Convidar Fornecedor</DialogTitle>
                          <DialogDescription>
                            Convide um fornecedor que ainda não está na plataforma para fazer parte desta revolução!
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="convite_email">Email *</Label>
                            <Input
                              id="convite_email"
                              type="email"
                              placeholder="fornecedor@exemplo.com"
                              value={conviteForm.email}
                              onChange={(e) => setConviteForm({ ...conviteForm, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="convite_nome">Nome da Empresa *</Label>
                            <Input
                              id="convite_nome"
                              placeholder="Nome do Fornecedor"
                              value={conviteForm.nome_empresa}
                              onChange={(e) => setConviteForm({ ...conviteForm, nome_empresa: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="convite_mensagem">Mensagem (opcional)</Label>
                            <Textarea
                              id="convite_mensagem"
                              placeholder="Adicione uma mensagem personalizada..."
                              value={conviteForm.mensagem}
                              onChange={(e) => setConviteForm({ ...conviteForm, mensagem: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <Button onClick={handleEnviarConvite} disabled={loading} className="w-full">
                            Enviar Convite
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Detalhes sobre este componente..."
                  value={novaPersonalizacao.descricao}
                  onChange={(e) => setNovaPersonalizacao({ ...novaPersonalizacao, descricao: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais..."
                  value={novaPersonalizacao.observacoes}
                  onChange={(e) => setNovaPersonalizacao({ ...novaPersonalizacao, observacoes: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={handleAddPersonalizacao} disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Componente
              </Button>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
