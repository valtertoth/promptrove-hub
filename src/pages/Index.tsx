import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Users, Package, Sparkles, CheckCircle, Zap } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ fabricas: 0, especificadores: 0, fornecedores: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [fabricasRes, especificadoresRes, fornecedoresRes] = await Promise.all([
        supabase.from('fabrica').select('id', { count: 'exact', head: true }),
        supabase.from('especificador').select('id', { count: 'exact', head: true }),
        supabase.from('fornecedor').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        fabricas: fabricasRes.count || 0,
        especificadores: especificadoresRes.count || 0,
        fornecedores: fornecedoresRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="text-center max-w-5xl mx-auto mb-24 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8 animate-scale-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Inovação em Especificação Premium</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              O Futuro
            </span>
            <br />
            <span className="text-foreground">da Especificação</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Conectando fábricas de móveis de alto padrão com especificadores e fornecedores 
            através de tecnologia de ponta e design excepcional
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="btn-premium bg-primary hover:bg-primary-hover text-primary-foreground text-lg px-8 py-6 h-auto rounded-2xl shadow-elegant hover:shadow-2xl transition-all duration-300 group"
              onClick={() => navigate('/catalogo')}
            >
              Explorar Catálogo
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="btn-premium text-lg px-8 py-6 h-auto rounded-2xl border-2 hover:bg-accent/10 hover:border-accent transition-all duration-300"
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
            >
              {user ? 'Ir para Dashboard' : 'Começar Gratuitamente'}
            </Button>
          </div>
        </div>

        {/* Stats Section - Platform Participants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 max-w-4xl mx-auto">
          {[
            { icon: Building2, label: 'Fábricas Cadastradas', value: stats.fabricas, color: 'text-primary' },
            { icon: Users, label: 'Especificadores Ativos', value: stats.especificadores, color: 'text-accent' },
            { icon: Package, label: 'Fornecedores Premium', value: stats.fornecedores, color: 'text-primary' },
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass rounded-2xl p-6 text-center animate-scale-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
              <div className="text-4xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid - Clickable Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: Building2,
              title: 'Para Fábricas',
              description: 'Plataforma completa para gerenciar produtos premium, variações e acabamentos. Conecte-se com especificadores qualificados e expanda sua rede de negócios.',
              gradient: 'from-primary/20 to-primary/5',
            },
            {
              icon: Users,
              title: 'Para Especificadores',
              description: 'Acesso exclusivo a catálogos premium e perfis detalhados das melhores fábricas. Arquitetos, designers e lojas especializadas em um ecossistema único.',
              gradient: 'from-accent/20 to-accent/5',
            },
            {
              icon: Package,
              title: 'Para Fornecedores',
              description: 'Disponibilize materiais premium (tecidos, cordas, alumínios, madeiras) e conecte-se diretamente com as principais fábricas do mercado.',
              gradient: 'from-primary/20 to-accent/10',
            },
          ].map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate('/auth')}
              className="card-premium text-center group animate-scale-in cursor-pointer hover:border-primary/50 transition-all duration-300 w-full"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
                <span>Criar conta</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Platform Benefits Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Transformação Digital</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Como transformamos cada segmento
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trazemos qualidade, padronização, profissionalismo e credibilidade para todo o ecossistema
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: 'Fábricas',
                benefits: [
                  'Visibilidade nacional para produtos premium',
                  'Conexão direta com especificadores qualificados',
                  'Gestão profissional de catálogo e variações',
                  'Avaliações e credibilidade de mercado',
                  'Informações técnicas padronizadas'
                ],
                gradient: 'from-primary/10 to-primary/5'
              },
              {
                icon: Users,
                title: 'Especificadores',
                benefits: [
                  'Acesso a catálogos premium verificados',
                  'Informação técnica detalhada e confiável',
                  'Avaliação de mercado e referências',
                  'Decisões de compra mais seguras',
                  'Networking com fornecedores de qualidade'
                ],
                gradient: 'from-accent/10 to-accent/5'
              },
              {
                icon: Package,
                title: 'Fornecedores',
                benefits: [
                  'Conexão direta com grandes fábricas',
                  'Credibilidade através de avaliações',
                  'Padronização de informações técnicas',
                  'Visibilidade no mercado premium',
                  'Crescimento sustentável do negócio'
                ],
                gradient: 'from-primary/10 to-accent/5'
              }
            ].map((segment, index) => (
              <div 
                key={index}
                className="card-premium group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${segment.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <segment.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-foreground">{segment.title}</h3>
                <ul className="space-y-3 text-left">
                  {segment.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="card-premium p-16 text-center mb-32 animate-scale-in overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Tecnologia de Ponta</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Design. Inovação. Excelência.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nossa plataforma foi construída com as tecnologias mais modernas para oferecer 
              a melhor experiência em especificação de produtos premium
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {['Busca Inteligente', 'Filtros Avançados', 'Upload de Imagens', 'Gestão Completa'].map((tech, index) => (
                <span 
                  key={index}
                  className="px-6 py-3 rounded-xl bg-background/50 border border-border/50 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center card-premium p-16 animate-scale-in bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Pronto para revolucionar seu negócio?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Junte-se às melhores fábricas e especificadores do mercado premium
          </p>
          <Button 
            size="lg" 
            className="btn-premium bg-primary hover:bg-primary-hover text-primary-foreground text-lg px-10 py-7 h-auto rounded-2xl shadow-elegant hover:shadow-2xl transition-all duration-300 group"
            onClick={() => navigate('/auth')}
          >
            Criar Conta Gratuitamente
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
