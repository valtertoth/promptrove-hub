import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Lock, LayoutDashboard, BookOpen, FileQuestion } from "lucide-react";

const routes = [
  {
    path: "/",
    name: "Index (Landing Page)",
    description: "Página inicial do site com informações sobre a plataforma",
    icon: Home,
  },
  {
    path: "/auth",
    name: "Auth (Autenticação)",
    description: "Página de login e cadastro de usuários",
    icon: Lock,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    description: "Painel principal após login (varia por role: fabrica, fornecedor, especificador)",
    icon: LayoutDashboard,
  },
  {
    path: "/catalogo",
    name: "Catálogo",
    description: "Listagem de produtos com filtros por categoria, tipo e região",
    icon: BookOpen,
  },
  {
    path: "/dev-routes",
    name: "Dev Routes (Esta página)",
    description: "Página de desenvolvimento para visualizar todas as rotas",
    icon: FileQuestion,
  },
];

const DevRoutes = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rotas do Sistema</h1>
          <p className="text-muted-foreground">
            Página de desenvolvimento para visualizar e navegar entre todas as rotas disponíveis
          </p>
        </div>

        <div className="grid gap-4">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Card key={route.path} className="p-6 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10 h-fit">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{route.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{route.description}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{route.path}</code>
                    </div>
                  </div>
                  <Link to={route.path}>
                    <Button variant="outline" size="sm">
                      Visitar
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">💡 Dica de Uso</h2>
          <p className="text-sm text-muted-foreground">
            Use esta página para navegar rapidamente entre diferentes partes do sistema durante o desenvolvimento.
            Acesse via <code className="bg-background px-2 py-1 rounded">/dev-routes</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevRoutes;
