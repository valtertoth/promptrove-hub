import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, GripVertical, CheckCircle, XCircle, Clock, Package, Home, Palette } from "lucide-react";

interface TipoProduto {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
}

interface Ambiente {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
}

interface CategoriaMaterial {
  tipo: string;
  count: number;
}

interface SugestaoTipo {
  id: string;
  nome_sugerido: string;
  descricao: string | null;
  status: string | null;
  mensagem_admin: string | null;
  created_at: string | null;
  fabrica: { nome: string } | null;
}

interface SugestaoCampo {
  id: string;
  nome_campo: string;
  valor_sugerido: string;
  descricao: string | null;
  status: string | null;
  mensagem_admin: string | null;
  created_at: string | null;
  fabrica: { nome: string } | null;
  tipos_produto: { nome: string } | null;
}

export default function OpcoesManager() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dados
  const [tiposProduto, setTiposProduto] = useState<TipoProduto[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [categoriasMaterial, setCategoriasMaterial] = useState<CategoriaMaterial[]>([]);
  const [sugestoesTipo, setSugestoesTipo] = useState<SugestaoTipo[]>([]);
  const [sugestoesCampo, setSugestoesCampo] = useState<SugestaoCampo[]>([]);
  
  // Estados para edição
  const [isCreateTipoOpen, setIsCreateTipoOpen] = useState(false);
  const [isEditTipoOpen, setIsEditTipoOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoProduto | null>(null);
  const [newTipo, setNewTipo] = useState({ nome: '', descricao: '' });
  
  const [isCreateAmbienteOpen, setIsCreateAmbienteOpen] = useState(false);
  const [isEditAmbienteOpen, setIsEditAmbienteOpen] = useState(false);
  const [editingAmbiente, setEditingAmbiente] = useState<Ambiente | null>(null);
  const [newAmbiente, setNewAmbiente] = useState({ nome: '', descricao: '' });
  
  // Mensagens para sugestões
  const [mensagensAdmin, setMensagensAdmin] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tiposRes, ambientesRes, materiaisRes, sugestoesTipoRes, sugestoesCampoRes] = await Promise.all([
        supabase.from('tipos_produto').select('*').order('ordem'),
        supabase.from('ambientes').select('*').order('ordem'),
        supabase.from('materials').select('type'),
        supabase.from('sugestoes_tipo_produto').select('*, fabrica:fabrica_id(nome)').order('created_at', { ascending: false }),
        supabase.from('sugestoes_campo_produto').select('*, fabrica:fabrica_id(nome), tipos_produto:tipo_produto_id(nome)').order('created_at', { ascending: false }),
      ]);

      if (tiposRes.data) setTiposProduto(tiposRes.data);
      if (ambientesRes.data) setAmbientes(ambientesRes.data);
      if (sugestoesTipoRes.data) setSugestoesTipo(sugestoesTipoRes.data);
      if (sugestoesCampoRes.data) setSugestoesCampo(sugestoesCampoRes.data);
      
      // Agrupar categorias de materiais
      if (materiaisRes.data) {
        const counts: Record<string, number> = {};
        materiaisRes.data.forEach((m: any) => {
          counts[m.type] = (counts[m.type] || 0) + 1;
        });
        setCategoriasMaterial(Object.entries(counts).map(([tipo, count]) => ({ tipo, count })));
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os dados.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // === TIPOS DE PRODUTO ===
  const handleCreateTipo = async () => {
    if (!newTipo.nome.trim()) {
      toast({ title: 'Campo obrigatório', description: 'Informe o nome do tipo.', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      const maxOrdem = tiposProduto.length > 0 ? Math.max(...tiposProduto.map(t => t.ordem || 0)) : 0;
      const { error } = await supabase.from('tipos_produto').insert({
        nome: newTipo.nome,
        descricao: newTipo.descricao || null,
        ativo: true,
        ordem: maxOrdem + 1,
      });
      if (error) throw error;
      toast({ title: 'Tipo criado', description: `"${newTipo.nome}" foi adicionado.` });
      setNewTipo({ nome: '', descricao: '' });
      setIsCreateTipoOpen(false);
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTipo = async () => {
    if (!editingTipo) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('tipos_produto').update({
        nome: editingTipo.nome,
        descricao: editingTipo.descricao,
        ativo: editingTipo.ativo,
      }).eq('id', editingTipo.id);
      if (error) throw error;
      toast({ title: 'Tipo atualizado' });
      setIsEditTipoOpen(false);
      setEditingTipo(null);
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTipo = async (id: string) => {
    if (!confirm('Excluir este tipo? Produtos existentes podem ser afetados.')) return;
    try {
      const { error } = await supabase.from('tipos_produto').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Tipo excluído' });
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleTipoAtivo = async (tipo: TipoProduto) => {
    try {
      const { error } = await supabase.from('tipos_produto').update({ ativo: !tipo.ativo }).eq('id', tipo.id);
      if (error) throw error;
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  // === AMBIENTES ===
  const handleCreateAmbiente = async () => {
    if (!newAmbiente.nome.trim()) {
      toast({ title: 'Campo obrigatório', description: 'Informe o nome do ambiente.', variant: 'destructive' });
      return;
    }
    setActionLoading(true);
    try {
      const maxOrdem = ambientes.length > 0 ? Math.max(...ambientes.map(a => a.ordem || 0)) : 0;
      const { error } = await supabase.from('ambientes').insert({
        nome: newAmbiente.nome,
        descricao: newAmbiente.descricao || null,
        ativo: true,
        ordem: maxOrdem + 1,
      });
      if (error) throw error;
      toast({ title: 'Ambiente criado', description: `"${newAmbiente.nome}" foi adicionado.` });
      setNewAmbiente({ nome: '', descricao: '' });
      setIsCreateAmbienteOpen(false);
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAmbiente = async () => {
    if (!editingAmbiente) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('ambientes').update({
        nome: editingAmbiente.nome,
        descricao: editingAmbiente.descricao,
        ativo: editingAmbiente.ativo,
      }).eq('id', editingAmbiente.id);
      if (error) throw error;
      toast({ title: 'Ambiente atualizado' });
      setIsEditAmbienteOpen(false);
      setEditingAmbiente(null);
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAmbiente = async (id: string) => {
    if (!confirm('Excluir este ambiente? Produtos existentes podem ser afetados.')) return;
    try {
      const { error } = await supabase.from('ambientes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Ambiente excluído' });
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleAmbienteAtivo = async (ambiente: Ambiente) => {
    try {
      const { error } = await supabase.from('ambientes').update({ ativo: !ambiente.ativo }).eq('id', ambiente.id);
      if (error) throw error;
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  // === SUGESTÕES ===
  const aprovarTipo = async (sugestao: SugestaoTipo) => {
    setActionLoading(true);
    try {
      const maxOrdem = tiposProduto.length > 0 ? Math.max(...tiposProduto.map(t => t.ordem || 0)) : 0;
      const { error: insertError } = await supabase.from('tipos_produto').insert({
        nome: sugestao.nome_sugerido,
        descricao: sugestao.descricao,
        ativo: true,
        ordem: maxOrdem + 1,
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase.from('sugestoes_tipo_produto').update({
        status: 'aprovado',
        mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão aprovada e tipo de produto criado.',
      }).eq('id', sugestao.id);
      if (updateError) throw updateError;

      toast({ title: 'Aprovado', description: `"${sugestao.nome_sugerido}" foi adicionado.` });
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const rejeitarTipo = async (sugestao: SugestaoTipo) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('sugestoes_tipo_produto').update({
        status: 'rejeitado',
        mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão rejeitada.',
      }).eq('id', sugestao.id);
      if (error) throw error;
      toast({ title: 'Rejeitado', description: 'A fábrica será notificada.' });
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const aprovarCampo = async (sugestao: SugestaoCampo) => {
    setActionLoading(true);
    try {
      if (sugestao.nome_campo === 'ambiente') {
        const maxOrdem = ambientes.length > 0 ? Math.max(...ambientes.map(a => a.ordem || 0)) : 0;
        const { error: insertError } = await supabase.from('ambientes').insert({
          nome: sugestao.valor_sugerido,
          descricao: sugestao.descricao,
          ativo: true,
          ordem: maxOrdem + 1,
        });
        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabase.from('sugestoes_campo_produto').update({
        status: 'aprovado',
        mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão aprovada.',
      }).eq('id', sugestao.id);
      if (updateError) throw updateError;

      toast({ title: 'Aprovado', description: `"${sugestao.valor_sugerido}" foi adicionado.` });
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const rejeitarCampo = async (sugestao: SugestaoCampo) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('sugestoes_campo_produto').update({
        status: 'rejeitado',
        mensagem_admin: mensagensAdmin[sugestao.id] || 'Sugestão rejeitada.',
      }).eq('id', sugestao.id);
      if (error) throw error;
      toast({ title: 'Rejeitado', description: 'A fábrica será notificada.' });
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'aprovado') return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
    if (status === 'rejeitado') return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  const sugestoesTipoPendentes = sugestoesTipo.filter(s => s.status === 'pendente' || !s.status);
  const sugestoesCampoPendentes = sugestoesCampo.filter(s => s.status === 'pendente' || !s.status);
  const totalPendentes = sugestoesTipoPendentes.length + sugestoesCampoPendentes.length;

  // Tipos de materiais do enum
  const tiposMaterialEnum = ['tecido', 'corda', 'aluminio', 'madeira', 'ferro', 'lamina', 'acabamento', 'outro'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-indigo-600" />
          Gerenciar Opções do Sistema
        </h2>
        <p className="text-muted-foreground">Controle total sobre categorias, tipos e ambientes disponíveis na plataforma</p>
      </div>

      <Tabs defaultValue="tipos" className="space-y-4">
        <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border shadow-sm">
          <TabsTrigger value="tipos" className="rounded-full px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Package className="mr-2 h-4 w-4" /> Categorias de Produto ({tiposProduto.length})
          </TabsTrigger>
          <TabsTrigger value="ambientes" className="rounded-full px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Home className="mr-2 h-4 w-4" /> Ambientes ({ambientes.length})
          </TabsTrigger>
          <TabsTrigger value="materiais" className="rounded-full px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Palette className="mr-2 h-4 w-4" /> Tipos de Material ({tiposMaterialEnum.length})
          </TabsTrigger>
          <TabsTrigger value="sugestoes" className="rounded-full px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Clock className="mr-2 h-4 w-4" /> Sugestões Pendentes ({totalPendentes})
          </TabsTrigger>
        </TabsList>

        {/* === ABA CATEGORIAS DE PRODUTO === */}
        <TabsContent value="tipos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Tipos de produtos disponíveis para os fabricantes cadastrarem (ex: Sofá, Mesa, Cadeira)
            </p>
            <Dialog open={isCreateTipoOpen} onOpenChange={setIsCreateTipoOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Categoria de Produto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input 
                      value={newTipo.nome} 
                      onChange={(e) => setNewTipo({ ...newTipo, nome: e.target.value })} 
                      placeholder="Ex: Sofá, Mesa, Cadeira..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea 
                      value={newTipo.descricao} 
                      onChange={(e) => setNewTipo({ ...newTipo, descricao: e.target.value })} 
                      placeholder="Descreva esta categoria..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTipo} disabled={actionLoading} className="bg-indigo-600 w-full rounded-xl">
                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Criar Categoria'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposProduto.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  tiposProduto.map((tipo) => (
                    <TableRow key={tipo.id} className={!tipo.ativo ? 'opacity-50' : ''}>
                      <TableCell><GripVertical className="h-4 w-4 text-muted-foreground" /></TableCell>
                      <TableCell className="font-medium">{tipo.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{tipo.descricao || '---'}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={tipo.ativo} onCheckedChange={() => handleToggleTipoAtivo(tipo)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => { setEditingTipo(tipo); setIsEditTipoOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDeleteTipo(tipo.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Dialog Editar Tipo */}
          <Dialog open={isEditTipoOpen} onOpenChange={setIsEditTipoOpen}>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Editar Categoria</DialogTitle>
              </DialogHeader>
              {editingTipo && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={editingTipo.nome} onChange={(e) => setEditingTipo({ ...editingTipo, nome: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea value={editingTipo.descricao || ''} onChange={(e) => setEditingTipo({ ...editingTipo, descricao: e.target.value })} rows={2} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingTipo.ativo} onCheckedChange={(checked) => setEditingTipo({ ...editingTipo, ativo: checked })} />
                    <Label>Ativo</Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleUpdateTipo} disabled={actionLoading} className="bg-indigo-600 w-full rounded-xl">
                  {actionLoading ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* === ABA AMBIENTES === */}
        <TabsContent value="ambientes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Ambientes onde os produtos podem ser utilizados (ex: Sala de Estar, Área Externa)
            </p>
            <Dialog open={isCreateAmbienteOpen} onOpenChange={setIsCreateAmbienteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" /> Novo Ambiente
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Ambiente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input 
                      value={newAmbiente.nome} 
                      onChange={(e) => setNewAmbiente({ ...newAmbiente, nome: e.target.value })} 
                      placeholder="Ex: Sala de Estar, Área Externa..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea 
                      value={newAmbiente.descricao} 
                      onChange={(e) => setNewAmbiente({ ...newAmbiente, descricao: e.target.value })} 
                      placeholder="Descreva este ambiente..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateAmbiente} disabled={actionLoading} className="bg-indigo-600 w-full rounded-xl">
                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Criar Ambiente'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ambientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum ambiente cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  ambientes.map((ambiente) => (
                    <TableRow key={ambiente.id} className={!ambiente.ativo ? 'opacity-50' : ''}>
                      <TableCell><GripVertical className="h-4 w-4 text-muted-foreground" /></TableCell>
                      <TableCell className="font-medium">{ambiente.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{ambiente.descricao || '---'}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={ambiente.ativo} onCheckedChange={() => handleToggleAmbienteAtivo(ambiente)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={() => { setEditingAmbiente(ambiente); setIsEditAmbienteOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDeleteAmbiente(ambiente.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Dialog Editar Ambiente */}
          <Dialog open={isEditAmbienteOpen} onOpenChange={setIsEditAmbienteOpen}>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Editar Ambiente</DialogTitle>
              </DialogHeader>
              {editingAmbiente && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={editingAmbiente.nome} onChange={(e) => setEditingAmbiente({ ...editingAmbiente, nome: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea value={editingAmbiente.descricao || ''} onChange={(e) => setEditingAmbiente({ ...editingAmbiente, descricao: e.target.value })} rows={2} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingAmbiente.ativo} onCheckedChange={(checked) => setEditingAmbiente({ ...editingAmbiente, ativo: checked })} />
                    <Label>Ativo</Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleUpdateAmbiente} disabled={actionLoading} className="bg-indigo-600 w-full rounded-xl">
                  {actionLoading ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* === ABA TIPOS DE MATERIAL === */}
        <TabsContent value="materiais" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Categorias de materiais disponíveis para os fornecedores (definidas no sistema)
            </p>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tiposMaterialEnum.map((tipo) => {
                const categoria = categoriasMaterial.find(c => c.tipo === tipo);
                return (
                  <div key={tipo} className="p-4 border rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors">
                    <div className="font-medium capitalize">{tipo}</div>
                    <div className="text-sm text-muted-foreground">
                      {categoria?.count || 0} materiais cadastrados
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Os tipos de materiais são definidos no sistema e não podem ser editados aqui. 
              Para adicionar novos tipos, entre em contato com o suporte técnico.
            </p>
          </Card>
        </TabsContent>

        {/* === ABA SUGESTÕES PENDENTES === */}
        <TabsContent value="sugestoes" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sugestões enviadas pelos fabricantes aguardando aprovação
          </p>

          {totalPendentes === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm bg-white p-12">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma sugestão pendente</p>
                <p className="text-muted-foreground">Todas as sugestões foram analisadas.</p>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="tipos-sug">
              <TabsList>
                <TabsTrigger value="tipos-sug">Categorias ({sugestoesTipoPendentes.length})</TabsTrigger>
                <TabsTrigger value="campos-sug">Campos/Ambientes ({sugestoesCampoPendentes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="tipos-sug" className="space-y-4 mt-4">
                {sugestoesTipoPendentes.map((sugestao) => (
                  <Card key={sugestao.id} className="rounded-xl">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{sugestao.nome_sugerido}</CardTitle>
                          <CardDescription>
                            Sugerido por: {sugestao.fabrica?.nome || 'N/A'} • {sugestao.created_at ? new Date(sugestao.created_at).toLocaleDateString() : ''}
                          </CardDescription>
                        </div>
                        {getStatusBadge(sugestao.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sugestao.descricao && (
                        <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">{sugestao.descricao}</p>
                      )}
                      <div className="space-y-2">
                        <Label>Mensagem para a fábrica (opcional)</Label>
                        <Textarea
                          placeholder="Adicione uma mensagem..."
                          value={mensagensAdmin[sugestao.id] || ''}
                          onChange={(e) => setMensagensAdmin({ ...mensagensAdmin, [sugestao.id]: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => aprovarTipo(sugestao)} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                        </Button>
                        <Button onClick={() => rejeitarTipo(sugestao)} disabled={actionLoading} variant="destructive" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="campos-sug" className="space-y-4 mt-4">
                {sugestoesCampoPendentes.map((sugestao) => (
                  <Card key={sugestao.id} className="rounded-xl">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{sugestao.valor_sugerido}</CardTitle>
                          <CardDescription>
                            Campo: {sugestao.nome_campo} | Tipo: {sugestao.tipos_produto?.nome || 'N/A'} | Por: {sugestao.fabrica?.nome || 'N/A'}
                          </CardDescription>
                        </div>
                        {getStatusBadge(sugestao.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sugestao.descricao && (
                        <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">{sugestao.descricao}</p>
                      )}
                      <div className="space-y-2">
                        <Label>Mensagem para a fábrica (opcional)</Label>
                        <Textarea
                          placeholder="Adicione uma mensagem..."
                          value={mensagensAdmin[sugestao.id] || ''}
                          onChange={(e) => setMensagensAdmin({ ...mensagensAdmin, [sugestao.id]: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => aprovarCampo(sugestao)} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                        </Button>
                        <Button onClick={() => rejeitarCampo(sugestao)} disabled={actionLoading} variant="destructive" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
