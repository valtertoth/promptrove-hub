import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Package, Search, Trash2, LogOut, ShieldAlert, Plus, Loader2, Pencil, Settings, Factory, Truck, UserCheck, ListChecks } from "lucide-react";
import OpcoesManager from "./OpcoesManager";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UserData {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  created_at: string;
  role?: string;
  tabela: 'fabrica' | 'fornecedor' | 'especificador';
  user_id: string;
}

interface ProdutoData {
  id: string;
  nome: string;
  fabrica_id: string;
  fabrica_nome?: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Dados
  const [users, setUsers] = useState<UserData[]>([]);
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Criar Usuário Manualmente
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "especificador", name: "" });

  // Editar Role de Usuário
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      if (authLoading) return;

      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar role de admin:", error);
          setIsAdmin(false);
          return;
        }

        const admin = data?.role === "admin";
        setIsAdmin(admin);

        if (admin) {
          fetchData();
        }
      } catch (error) {
        console.error("Erro inesperado ao verificar role de admin:", error);
        setIsAdmin(false);
      }
    };

    checkAccessAndLoad();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar de todas as tabelas específicas
      const [fabricasResult, fornecedoresResult, especificadoresResult, produtosResult, rolesResult] = await Promise.all([
        supabase.from("fabrica").select("id, user_id, nome, email, created_at"),
        supabase.from("fornecedor").select("id, user_id, nome, created_at"),
        supabase.from("especificador").select("id, user_id, nome, email, tipo, created_at"),
        supabase.from("produtos").select(`
          id, 
          nome, 
          fabrica_id, 
          created_at,
          fabrica:fabrica_id (nome)
        `).order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const { data: fabricasData, error: fabricasError } = fabricasResult;
      const { data: fornecedoresData, error: fornecedoresError } = fornecedoresResult;
      const { data: especificadoresData, error: especificadoresError } = especificadoresResult;
      const { data: produtosData, error: produtosError } = produtosResult;
      const { data: rolesData, error: rolesError } = rolesResult;

      if (fabricasError) console.error("Erro fábricas:", fabricasError);
      if (fornecedoresError) console.error("Erro fornecedores:", fornecedoresError);
      if (especificadoresError) console.error("Erro especificadores:", especificadoresError);
      if (produtosError) console.error("Erro produtos:", produtosError);
      if (rolesError) console.error("Erro roles:", rolesError);

      // Criar mapa de roles
      const rolesByUserId = new Map<string, string>();
      rolesData?.forEach((r: any) => {
        rolesByUserId.set(r.user_id, r.role);
      });

      // Combinar usuários de todas as tabelas
      const allUsers: UserData[] = [];

      fabricasData?.forEach((f: any) => {
        allUsers.push({
          id: f.id,
          user_id: f.user_id,
          nome: f.nome,
          email: f.email || '---',
          tipo: 'Fábrica',
          created_at: f.created_at,
          role: rolesByUserId.get(f.user_id) || 'fabrica',
          tabela: 'fabrica',
        });
      });

      fornecedoresData?.forEach((f: any) => {
        allUsers.push({
          id: f.id,
          user_id: f.user_id,
          nome: f.nome,
          email: '---',
          tipo: 'Fornecedor',
          created_at: f.created_at,
          role: rolesByUserId.get(f.user_id) || 'fornecedor',
          tabela: 'fornecedor',
        });
      });

      especificadoresData?.forEach((e: any) => {
        allUsers.push({
          id: e.id,
          user_id: e.user_id,
          nome: e.nome,
          email: e.email || '---',
          tipo: `Especificador (${e.tipo || '---'})`,
          created_at: e.created_at,
          role: rolesByUserId.get(e.user_id) || 'especificador',
          tabela: 'especificador',
        });
      });

      // Ordenar por data de criação
      allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setUsers(allUsers);

      // Processar produtos
      const processedProdutos: ProdutoData[] = (produtosData || []).map((p: any) => ({
        id: p.id,
        nome: p.nome,
        fabrica_id: p.fabrica_id,
        fabrica_nome: p.fabrica?.nome || 'Fábrica não encontrada',
        created_at: p.created_at,
      }));

      setProdutos(processedProdutos);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- AÇÕES DE ADMIN ---

  const handleDeleteUser = async (userData: UserData) => {
    if (!confirm(`ATENÇÃO: Isso apagará o ${userData.tipo} "${userData.nome}". Continuar?`)) return;

    const { error } = await supabase.from(userData.tabela).delete().eq("id", userData.id);

    if (error) {
      toast({ title: "Erro", description: "Erro ao excluir: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuário Removido", className: "bg-indigo-600 text-white" });
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Excluir este produto permanentemente?")) return;

    // Deletar personalizações e variações primeiro
    await supabase.from("personalizacoes_produto").delete().eq("produto_id", id);
    await supabase.from("variacoes_produto").delete().eq("produto_id", id);
    await supabase.from("produto_fornecedor").delete().eq("produto_id", id);
    
    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (!error) {
      toast({ title: "Produto Excluído", className: "bg-indigo-600 text-white" });
      fetchData();
    } else {
      toast({ title: "Erro", description: "Erro ao excluir produto: " + error.message, variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({ title: "Erro", description: "Preencha email e senha.", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            nome: newUser.name,
          },
        },
      });

      if (error) throw error;

      // Criar role para o novo usuário
      if (data.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: newUser.role } as any);

        if (roleError) throw roleError;
      }

      toast({ title: "Usuário Criado", description: "Login disponível.", className: "bg-green-600 text-white" });
      setIsCreateUserOpen(false);
      setNewUser({ email: "", password: "", role: "especificador", name: "" });

      setTimeout(fetchData, 2000);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!editingUser) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: editingUser.newRole })
        .eq("user_id", editingUser.user_id);

      if (error) throw error;

      toast({ title: "Role Atualizada", className: "bg-indigo-600 text-white" });
      setIsEditRoleOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditRole = (userData: UserData) => {
    setEditingUser({ ...userData, newRole: userData.role });
    setIsEditRoleOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'fabrica': return 'bg-black';
      case 'fornecedor': return 'bg-blue-600';
      case 'especificador': return 'bg-emerald-600';
      case 'admin': return 'bg-indigo-600';
      default: return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo.includes('Fábrica')) return <Factory className="h-4 w-4" />;
    if (tipo.includes('Fornecedor')) return <Truck className="h-4 w-4" />;
    if (tipo.includes('Especificador')) return <UserCheck className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 p-6">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <h1 className="text-2xl font-semibold text-center">Acesso restrito ao administrador</h1>
        <p className="text-muted-foreground text-center max-w-xl">
          O painel <code className="px-1 py-0.5 rounded bg-muted text-xs">/admin</code> só mostra os perfis completos quando você entra com uma conta com perfil de <strong>admin</strong>.
          Use seu e-mail de administrador para testar ou volte para o dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="rounded-xl">
            Voltar para o Dashboard
          </Button>
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Trocar Conta
          </Button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => 
    (u.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.tipo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground transition-colors duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-indigo-600" />
            Painel <span className="italic text-indigo-600">Master</span>
          </h1>
          <p className="text-muted-foreground mt-1">Controle total do ecossistema.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => window.location.href = '/profile'} variant="outline" className="rounded-xl">
            <Settings className="mr-2 h-4 w-4" />
            Meu Perfil
          </Button>
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Factory className="h-4 w-4" /> Fábricas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {users.filter(u => u.tabela === 'fabrica').length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Especificadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600">
              {users.filter(u => u.tabela === 'especificador').length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" /> Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{produtos.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm inline-flex flex-wrap gap-1">
          <TabsTrigger
            value="users"
            className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <Users className="mr-2 h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <Package className="mr-2 h-4 w-4" /> Produtos
          </TabsTrigger>
          <TabsTrigger
            value="opcoes"
            className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <ListChecks className="mr-2 h-4 w-4" /> Opções do Sistema
          </TabsTrigger>
        </TabsList>

        {/* ABA USUÁRIOS */}
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nome, email ou tipo..."
                className="pl-10 rounded-xl bg-white border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                  <Plus className="mr-2 h-4 w-4" /> Criar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select onValueChange={(val) => setNewUser({ ...newUser, role: val })} defaultValue="especificador">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="especificador">Especificador</SelectItem>
                        <SelectItem value="fabrica">Fábrica</SelectItem>
                        <SelectItem value="fornecedor">Fornecedor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateUser}
                    disabled={actionLoading}
                    className="bg-indigo-600 w-full rounded-xl"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Perfil de {editingUser?.nome}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={editingUser?.email || ""} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Função</Label>
                    <Select
                      value={editingUser?.newRole || "especificador"}
                      onValueChange={(val) => setEditingUser({ ...editingUser, newRole: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="especificador">Especificador</SelectItem>
                        <SelectItem value="fabrica">Fábrica</SelectItem>
                        <SelectItem value="fornecedor">Fornecedor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleEditRole}
                    disabled={actionLoading}
                    className="bg-indigo-600 w-full rounded-xl"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userData) => (
                    <TableRow key={`${userData.tabela}-${userData.id}`}>
                      <TableCell className="font-medium font-serif">{userData.nome || "---"}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTipoIcon(userData.tipo)}
                          <span>{userData.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(userData.role || '')}>
                          {(userData.role || 'sem-perfil').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(userData.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            onClick={() => openEditRole(userData)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => handleDeleteUser(userData)}
                          >
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
        </TabsContent>

        {/* ABA PRODUTOS */}
        <TabsContent value="products">
          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Fábrica</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Controle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhum produto cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  produtos.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium">{prod.nome}</TableCell>
                      <TableCell>{prod.fabrica_nome}</TableCell>
                      <TableCell>{new Date(prod.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteProduct(prod.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ABA OPÇÕES DO SISTEMA */}
        <TabsContent value="opcoes">
          <OpcoesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;