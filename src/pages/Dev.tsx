import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Code2, Factory, Store, User, ShieldAlert } from "lucide-react";

// Importando todos os Painéis
import AdminDashboard from "@/components/admin/AdminDashboard";
import FabricaDashboard from "@/components/fabrica/FabricaDashboard";
import FornecedorDashboard from "@/components/fornecedor/FornecedorDashboard";
import EspecificadorDashboard from "@/components/especificador/EspecificadorDashboard";

const Dev = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<"admin" | "fabrica" | "fornecedor" | "especificador">("admin");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Modo Desenvolvedor</h1>
          <p className="text-gray-500 mb-4">Você precisa estar logado para simular os painéis.</p>
          <Button onClick={() => (window.location.href = "/auth")}>Ir para Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* MENU FLUTUANTE DE DESENVOLVEDOR 
        Fica fixo no canto inferior direito
      */}
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-2xl bg-gray-900 hover:bg-black border-2 border-white/20"
            >
              <Code2 className="h-6 w-6 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuLabel>Simular Perfil</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setCurrentView("admin")}
              className="cursor-pointer p-2 rounded-lg focus:bg-indigo-50 focus:text-indigo-700"
            >
              <ShieldAlert className="mr-2 h-4 w-4" /> Admin Master
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setCurrentView("fabrica")}
              className="cursor-pointer p-2 rounded-lg focus:bg-gray-100"
            >
              <Factory className="mr-2 h-4 w-4" /> Painel Fábrica
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setCurrentView("fornecedor")}
              className="cursor-pointer p-2 rounded-lg focus:bg-blue-50 focus:text-blue-700"
            >
              <Store className="mr-2 h-4 w-4" /> Painel Fornecedor
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setCurrentView("especificador")}
              className="cursor-pointer p-2 rounded-lg focus:bg-emerald-50 focus:text-emerald-700"
            >
              <User className="mr-2 h-4 w-4" /> Painel Especificador
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ÁREA DE RENDERIZAÇÃO 
        Mostra o dashboard selecionado usando o ID do usuário logado (Simulação)
      */}
      <div className="animate-in fade-in duration-500">
        {currentView === "admin" && (
          <div className="border-4 border-indigo-500 min-h-screen relative">
            <div className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-2 py-1 z-50">
              MODO SIMULAÇÃO: ADMIN
            </div>
            <AdminDashboard />
          </div>
        )}

        {currentView === "fabrica" && (
          <div className="border-4 border-gray-800 min-h-screen relative">
            <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 z-50">
              MODO SIMULAÇÃO: FÁBRICA
            </div>
            <FabricaDashboard userId={user.id} />
          </div>
        )}

        {currentView === "fornecedor" && (
          <div className="border-4 border-blue-500 min-h-screen relative">
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 z-50">
              MODO SIMULAÇÃO: FORNECEDOR
            </div>
            <FornecedorDashboard userId={user.id} />
          </div>
        )}

        {currentView === "especificador" && (
          <div className="border-4 border-emerald-500 min-h-screen relative">
            <div className="absolute top-0 left-0 bg-emerald-500 text-white text-xs px-2 py-1 z-50">
              MODO SIMULAÇÃO: ESPECIFICADOR
            </div>
            <EspecificadorDashboard userId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dev;
