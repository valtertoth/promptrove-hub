import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login e Cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Verifica se já está logado
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isSignUp) {
        // CADASTRO
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast({
          title: "Conta criada!",
          description: "Agora escolha seu perfil no próximo passo.",
          className: "bg-[#103927] text-white border-none",
        });
        navigate("/dashboard");
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      {/* Coluna Esquerda: Imagem Conceitual (Visual Atelier) */}
      <div className="hidden lg:flex w-1/2 bg-[#103927] items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')",
          }}
        ></div>
        <div className="relative z-10 text-[#FAFAF9] max-w-lg">
          <h2 className="text-sm font-sans tracking-[0.2em] uppercase opacity-70 mb-4">Specify Ecosystem</h2>
          <h1 className="text-5xl font-serif mb-6 leading-tight">Bem-vindo ao círculo.</h1>
          <p className="text-lg font-light opacity-80 leading-relaxed">
            Acesse o ecossistema definitivo para profissionais de alto padrão. Conecte-se, especifique e transforme.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Login Customizado */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif text-[#1C1917]">{isSignUp ? "Criar Conta" : "Acessar Conta"}</h2>
            <p className="text-gray-500 mt-2">Entre com suas credenciais para gerenciar.</p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4 rounded-xl">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAuth} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#103927] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#103927] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#103927] hover:bg-[#0A261A] text-white text-lg font-medium shadow-lg shadow-[#103927]/20 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : isSignUp ? "Cadastrar" : "Entrar"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-500 hover:text-[#103927] transition-colors underline underline-offset-4"
            >
              {isSignUp ? "Já tem uma conta? Fazer Login" : "Não tem conta? Solicitar Acesso"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
