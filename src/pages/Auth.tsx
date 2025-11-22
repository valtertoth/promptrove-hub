import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  // Ouve o estado da autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Redireciona instantaneamente para o Dashboard
        navigate("/dashboard");
      }
      if (event === "USER_UPDATED") {
        const { error } = supabase.auth.getSession() as any;
        if (error) setErrorMessage(error.message);
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      {/* Coluna Esquerda: Imagem Conceitual */}
      <div className="hidden lg:flex w-1/2 bg-[#103927] items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')",
          }}
        ></div>
        <div className="relative z-10 text-[#FAFAF9] max-w-lg">
          <h1 className="text-5xl font-serif mb-6">Bem-vindo ao círculo.</h1>
          <p className="text-lg font-light opacity-80">
            Acesse o ecossistema definitivo para profissionais de alto padrão.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif text-[#1C1917]">Login / Cadastro</h2>
            <p className="text-gray-500 mt-2">Entre com suas credenciais para acessar.</p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#103927", // Hunter Green
                      brandAccent: "#0A261A",
                      inputBackground: "white",
                      inputText: "#1C1917",
                      inputBorder: "#E5E5E5",
                      inputBorderFocus: "#103927",
                      inputBorderHover: "#103927",
                    },
                    radii: {
                      borderRadiusButton: "12px",
                      buttonBorderRadius: "12px",
                      inputBorderRadius: "12px",
                    },
                    fonts: {
                      bodyFontFamily: `Inter, sans-serif`,
                      buttonFontFamily: `Inter, sans-serif`,
                    },
                  },
                },
              }}
              providers={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
