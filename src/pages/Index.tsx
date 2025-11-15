import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Users, Package } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Plataforma de Especificadores Premium
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Conectando fábricas de móveis de alto padrão com especificadores e fornecedores de excelência
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-premium bg-primary hover:bg-primary-hover text-lg"
              onClick={() => navigate('/auth')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="btn-premium text-lg"
              onClick={() => navigate('/auth')}
            >
              Saber Mais
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card-premium text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Para Fábricas</h3>
            <p className="text-muted-foreground">
              Cadastre seus produtos premium, gerencie variações e acabamentos. 
              Conecte-se com especificadores qualificados e amplie sua rede.
            </p>
          </div>

          <div className="card-premium text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Para Especificadores</h3>
            <p className="text-muted-foreground">
              Acesse catálogos exclusivos, páginas premium das fábricas. 
              Arquitetos, designers e lojas especializadas em um só lugar.
            </p>
          </div>

          <div className="card-premium text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Para Fornecedores</h3>
            <p className="text-muted-foreground">
              Disponibilize seus materiais premium (tecidos, cordas, alumínios, madeiras). 
              Conecte-se diretamente com as fábricas.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center card-premium p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para elevar seu negócio?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se às melhores fábricas e especificadores do mercado
          </p>
          <Button 
            size="lg" 
            className="btn-premium bg-primary hover:bg-primary-hover text-lg"
            onClick={() => navigate('/auth')}
          >
            Criar Conta Gratuitamente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
