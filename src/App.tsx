import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Catalogo from "./pages/Catalogo";
import Dev from "./pages/Dev";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./components/admin/AdminDashboard"; // <--- IMPORT NOVO

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
          <Route path="/catalogo" element={<Catalogo />} />

          {/* ROTA DO MODO DEUS (Adicionada Agora) */}
          <Route path="/admin" element={<AdminDashboard userId="admin-master" />} />

          <Route path="/dev" element={<Dev />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Pequeno helper para o TooltipProvider que faltava no seu arquivo original
import { TooltipProvider } from "@/components/ui/tooltip";

export default App;
