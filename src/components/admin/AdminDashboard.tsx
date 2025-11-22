import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Package, Search, Trash2, LogOut, ShieldAlert, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AdminDashboardProps {
  userId: string;
}

// Interface ajustada para a estrutura do Lovable
interface Profile {
  id: string;
  full_name: string | null;
  updated_at: string | null;
  // O Supabase retorna os relacionamentos assim:
  user_roles: {
    role: string;
  }[];
}

interface Product {
  id: string;
  name: string;
  manufacturer_id: string;
  created_at: string;
}

const AdminDashboard = ({ userId }: AdminDashboardProps) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Dados
  const [users, setUsers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Criar Usuário Manualmente
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "especificador", name: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Pega perfis CONECTANDO com user_roles
      const { data: usersData, error: userError } = await supabase
        .from("profiles")
        .select(
          `
                *,
                user_roles (
                    role
                )
            `,
        )
        .order("updated_at", { ascending: false });

      if (userError) throw userError;
      if (usersData) {
        // Pequena adaptação se user_roles vier vazio ou array
        setUsers(usersData as any);
      }

      // 2. Pega produtos
      const { data: prodData } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (prodData) setProducts(prodData);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      // Não vamos mostrar toast de erro aqui para não poluir se for só questão de permissão inicial
    } finally {
      setLoading(false);
    }
  };

  // --- AÇÕES DE ADMIN (GOD MODE) ---

  const handleDeleteUser = async (id: string) => {
    if (!confirm("ATENÇÃO: Isso apagará o usuário. Continuar?")) return;

    // Tenta apagar do profiles (Cascade deve cuidar do resto)
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro", description: "Erro ao excluir: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuário Removido", className: "bg-indigo-600 text-white" });
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Excluir este produto permanentemente?")) return;

    await supabase.from("product_materials").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (!error) {
      toast({ title: "Produto Excluído", className: "bg-indigo-600 text-white" });
      fetchData();
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({ title: "Erro", description: "Preencha email e senha.", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      // Cria usuário no Auth do Supabase
      // O Trigger do Lovable (handle_new_user) vai rodar automaticamente
      const { error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.name,
            // Passamos o role no metadata para o trigger do Lovable pegar
            role: newUser.role,
          },
        },
      });

      if (error) throw error;

      toast({ title: "Usuário Criado", description: "Login disponível.", className: "bg-green-600 text-white" });
      setIsCreateUserOpen(false);
      setNewUser({ email: "", password: "", role: "especificador", name: "" });

      // Delay para o trigger rodar
      setTimeout(fetchData, 2000);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper para pegar a role de dentro do array
  const getUserRole = (user: Profile) => {
    if (user.user_roles && user.user_roles.length > 0) {
      return user.user_roles[0].role;
    }
    return "sem-perfil";
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserRole(u).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-10 font-sans text-slate-800">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-indigo-600" />
            Painel <span className="font-semibold text-indigo-600">Master</span>
          </h1>
          <p className="text-gray-500 mt-1">Controle total do ecossistema (Dev Mode).</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={signOut} variant="ghost" className="text-red-500 hover:bg-red-50 rounded-xl">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      {/* DASHBOARD KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Produtos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-800">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm inline-flex">
          <TabsTrigger
            value="users"
            className="rounded-xl px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <Users className="mr-2 h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-xl px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <Package className="mr-2 h-4 w-4" /> Produtos do Sistema
          </TabsTrigger>
        </TabsList>

        {/* ABA USUÁRIOS */}
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar nome ou função..."
                className="pl-10 rounded-xl bg-white border-gray-200 h-10"
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
                        <SelectItem value="fabricante">Fábrica</SelectItem>
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
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>ID Sistema</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const role = getUserRole(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "Sem nome"}</TableCell>
                      <TableCell>
                        <Badge
                          className={`
                                            ${role === "fabricante" ? "bg-black" : ""}
                                            ${role === "fornecedor" ? "bg-blue-600" : ""}
                                            ${role === "especificador" ? "bg-emerald-600" : ""}
                                            ${role === "admin" ? "bg-indigo-600" : ""}
                                        `}
                        >
                          {role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">{user.id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ABA PRODUTOS DO SISTEMA */}
        <TabsContent value="products">
          <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>ID do Fabricante</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Controle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell className="font-medium">{prod.name}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{prod.manufacturer_id}</TableCell>
                    <TableCell>{new Date(prod.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(prod.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
