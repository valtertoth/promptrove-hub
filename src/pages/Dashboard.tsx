import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Factory, Store, User, Loader2, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import FabricaDashboard from "@/components/fabrica/FabricaDashboard";
import FornecedorDashboard from "@/components/fornecedor/FornecedorDashboard";
import EspecificadorDashboard from "@/components/especificador/EspecificadorDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth(); // Importei o signOut
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
    if (!user) {
      setRoleLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error("Erro ao verificar role:", error);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRoleSelection = async (role: "fabrica" | "fornecedor" | "especificador") => {
    if (!user) {
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente para escolher um perfil.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      // Tenta INSERT direto primeiro (mais seguro se UPSERT falhar por falta de constraint)
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: role } as any);

      // Se der erro de duplicidade, tentamos UPDATE
      if (insertError) {
        if (insertError.code === "23505") {
          // Código de chave duplicada
          const { error: updateError } = await supabase
            .from("user_roles")
            .update({ role: role } as any)
            .eq("user_id", user.id);
          if (updateError) throw updateError;
        } else {
          throw insertError;
        }
      }

      // Atualiza Perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, role: role, email: user.email } as any);

      if (profileError) console.error("Aviso perfil:", profileError); // Não bloqueia se falhar o perfil

      setUserRole(role);
      toast({ title: "Perfil ativado!", className: "bg-[#103927] text-white border-none" });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Erro crítico", description: error.message, variant: "destructive" });
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#103927]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#103927]" />
      </div>
    );
  }

  if (userRole === "admin") return <AdminDashboard />;
  if (userRole === "fabrica" || userRole === "fabricante") return <FabricaDashboard userId={user.id} />;
  if (userRole === "fornecedor") return <FornecedorDashboard userId={user.id} />;
  if (userRole === "especificador") return <EspecificadorDashboard userId={user.id} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-4">
      {/* BOTÃO DE EJECT (SAIR DO LOOP) */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" onClick={signOut} className="text-red-500 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" /> Sair / Trocar Conta
        </Button>
      </div>

      <Card className="w-full max-w-4xl border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-serif text-[#1C1917] mb-2">Escolha seu perfil</CardTitle>
          <CardDescription className="text-lg">Detectamos que seu acesso ainda não foi configurado.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div
            className="flex flex-col gap-4 p-6 rounded-2xl border hover:border-[#103927] hover:shadow-lg transition-all bg-white cursor-pointer group"
            onClick={() => handleRoleSelection("fabrica")}
          >
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#103927] group-hover:text-white transition-colors">
              <Factory className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Fábrica</h3>
              <p className="text-sm text-gray-500">Gestão de produtos.</p>
            </div>
            <Button className="w-full mt-auto bg-[#1C1917] hover:bg-black rounded-xl">Entrar como Fábrica</Button>
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
              <p className="text-sm text-gray-500">Catálogo de materiais.</p>
            </div>
            <Button className="w-full mt-auto bg-[#1C1917] hover:bg-black rounded-xl">Entrar como Fornecedor</Button>
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
              <p className="text-sm text-gray-500">Projetos e curadoria.</p>
            </div>
            <Button className="w-full mt-auto bg-[#1C1917] hover:bg-black rounded-xl">Entrar como Especificador</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
