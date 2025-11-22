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

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "especificador", name: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: usersData } = await supabase
      .from("profiles")
      .select(`*, user_roles (role)`)
      .order("created_at", { ascending: false });
    if (usersData) setUsers(usersData);
    const { data: prodData } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (prodData) setProducts(prodData);
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Apagar usuário?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) {
      toast({ title: "Usuário Removido", className: "bg-indigo-600 text-white" });
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("product_materials").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      toast({ title: "Produto Excluído", className: "bg-indigo-600 text-white" });
      fetchData();
    }
  };

  const handleCreateUser = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: { data: { full_name: newUser.name, role: newUser.role } },
      });
      if (error) throw error;
      toast({ title: "Usuário Criado", className: "bg-green-600 text-white" });
      setIsCreateUserOpen(false);
      setTimeout(fetchData, 2000);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground transition-colors duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-indigo-600" /> Painel{" "}
            <span className="italic text-indigo-600">Master</span>
          </h1>
          <p className="text-muted-foreground mt-1">Visão irrestrita do ecossistema.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={signOut} variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl">
            Sair
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif text-indigo-600">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif text-foreground">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-border shadow-sm inline-flex">
          <TabsTrigger
            value="users"
            className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Usuários
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 rounded-xl bg-white border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Novo Cadastro
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Criar Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
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
                    Criar
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
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) => (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium font-serif">{user.full_name || "---"}</TableCell>
                      <TableCell>
                        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
                          {user.user_roles?.[0]?.role?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleDeleteUser(user.id)}
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
        <TabsContent value="products">
          <div className="text-center py-10 opacity-50">Lista de produtos disponível na versão completa.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
