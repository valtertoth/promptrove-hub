import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Factory, Store, User, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Import dos componentes de Dashboard específicos
import FabricaDashboard from "@/components/fabrica/FabricaDashboard";
import FornecedorDashboard from "@/components/fornecedor/FornecedorDashboard";
import EspecificadorDashboard from "@/components/especificador/EspecificadorDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      checkUserRole();
    }
  }, [user, loading, navigate]);

  const checkUserRole = async () => {
    try {
      // 1. Tenta buscar na tabela de roles
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).maybeSingle();

      if (data) {
        setUserRole(data.role);
      } else {
        // Se não achou, talvez seja a primeira vez. Vamos verificar se tem no metadata.
        const metaRole = user?.user_metadata?.role;
        if (metaRole) {
          // Se tem no metadata, salva no banco para ficar oficial
          await supabase.from("user_roles").insert({ user_id: user!.id, role: metaRole });
          setUserRole(metaRole);
        }
        // Se não tem em lugar nenhum, vai mostrar a tela de escolha
      }
    } catch (error) {
      console.error("Erro ao verificar role:", error);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRoleSelection = async (role: "fabricante" | "fornecedor" | "especificador") => {
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: user!.id, role: role });

      if (error) throw error;

      // Atualiza também o profile para garantir sincronia
      await supabase.from("profiles").upsert({ id: user!.id, role: role, email: user!.email });

      setUserRole(role);
      toast({ title: "Perfil definido com sucesso!" });
    } catch (error: any) {
      toast({
        title: "Erro ao definir perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Roteamento baseado no papel (Role)
  if (userRole === "admin") {
    return <AdminDashboard />;
  }
  if (userRole === "fabricante") {
    return <FabricaDashboard userId={user!.id} />;
  }
  if (userRole === "fornecedor") {
    return <FornecedorDashboard userId={user!.id} />;
  }
  if (userRole === "especificador") {
    return <EspecificadorDashboard userId={user!.id} />;
  }

  // Se não tem papel definido, mostra a tela de escolha
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-4">
      <Card className="w-full max-w-4xl border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-serif text-[#1C1917] mb-2">Escolha seu perfil</CardTitle>
          <CardDescription className="text-lg">
            Para começar, selecione o tipo de conta que deseja criar:
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div
            className="flex flex-col gap-4 p-6 rounded-2xl border hover:border-[#103927] hover:shadow-lg transition-all bg-white cursor-pointer group"
            onClick={() => handleRoleSelection("fabricante")}
          >
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#103927] group-hover:text-white transition-colors">
              <Factory className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Fábrica</h3>
              <p className="text-sm text-gray-500">Cadastre seus produtos e conecte-se com especificadores.</p>
            </div>
            <Button className="w-full mt-auto bg-[#1C1917] hover:bg-black">Selecionar</Button>
          </div>

          <div
            className="flex flex-col gap-4 p-6 rounded-2xl border hover:border-blue-600 hover:shadow-lg transition-all bg-white cursor-pointer group"
            onClick={() => handleRoleSelection("fornecedor")}
          >
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Fornecedor</h3>
              <p className="text-sm text-gray-500">Disponibilize seus materiais para as fábricas.</p>
            </div>
            <Button className="w-full mt-auto bg-[#1C1917] hover:bg-black">Selecionar</Button>
          </div>

          <div
            className="flex flex-col gap-4 p-6 rounded-2xl border hover:border-emerald-600 hover:shadow-lg transition-all bg-white cursor-pointer group"
            onClick={() => handleRoleSelection("especificador")}
          >
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Especificador</h3>
              <p className="text-sm text-gray-500">Acesse catálogos exclusivos de fábricas premium.</p>
            </div>
            <Button className="w-full mt-auto bg-[#1C1917] hover:bg-black">Selecionar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
