import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SugestoesManager from "./SugestoesManager";
import { Settings, Lightbulb } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie sugestões e configurações da plataforma</p>
        </div>

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
