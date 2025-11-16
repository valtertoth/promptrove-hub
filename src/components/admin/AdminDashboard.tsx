import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificacoesPopover from "@/components/shared/NotificacoesPopover";
import SugestoesManager from "./SugestoesManager";
import { Settings, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <header className="border-b bg-card mb-6 -m-6 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie sugestões e configurações da plataforma</p>
          </div>
          <div className="flex gap-2 items-center">
            {user && <NotificacoesPopover userId={user.id} />}
            <Button onClick={handleSignOut} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="sugestoes">
          <TabsList>
            <TabsTrigger value="sugestoes">
              <Lightbulb className="w-4 h-4 mr-2" />
              Sugestões
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sugestoes" className="mt-6">
            <SugestoesManager />
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-6">
            <div className="text-center p-8 text-muted-foreground">
              Configurações em desenvolvimento...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
