import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Catalogo from "./pages/Catalogo";
import MeusProjetos from "./pages/MeusProjetos";
import Dev from "./pages/Dev";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./components/admin/AdminDashboard";
import Relacionamento from "./pages/Relacionamento";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/meus-projetos" element={<MeusProjetos />} />
          <Route path="/relacionamento/:connectionId" element={<Relacionamento />} />

          {/* ROTA DO MODO DEUS (Corrigida: Sem userId) */}
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/dev" element={<Dev />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
