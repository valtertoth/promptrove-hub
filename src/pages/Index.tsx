import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, PenTool, Factory, ChevronDown, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // Efeito de "Noise" (Granulado) no fundo para textura de papel/concreto
  const noiseBg =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")";

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] overflow-x-hidden font-sans selection:bg-[#103927] selection:text-white">
      {/* NAVBAR FLUTUANTE */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 mix-blend-difference text-white">
        <div className="text-2xl font-serif font-bold tracking-tighter">Specify.</div>
        <div className="flex gap-6 text-sm font-medium tracking-wide">
          <button onClick={() => navigate("/auth")} className="hover:underline underline-offset-4 transition-all">
            Login
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all"
          >
            Começar
          </button>
        </div>
      </nav>

      {/* HERO SECTION - "THE DARK ROOM" */}
      <section className="relative h-screen bg-[#103927] text-[#FAFAF9] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: noiseBg }}></div>

        {/* Elementos Decorativos de Fundo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute w-[500px] h-[500px] rounded-full bg-[#1a5c3d] blur-[120px] -top-20 -left-20"
        />

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="z-10 text-center max-w-5xl space-y-8"
        >
          <h2 className="text-sm md:text-base font-sans tracking-[0.3em] uppercase opacity-70 border border-white/20 rounded-full px-4 py-1 inline-block">
            O Ecossistema do Design
          </h2>
          <h1 className="text-6xl md:text-9xl font-serif font-medium leading-[0.9] tracking-tight">
            A Engenharia <br />
            <span className="italic text-[#D4AF37]">do Belo.</span>
          </h1>
          <p className="text-lg md:text-xl font-light opacity-80 max-w-2xl mx-auto leading-relaxed">
            Conectamos a matéria-prima bruta à curadoria fina. <br />A plataforma definitiva para Fornecedores, Fábricas
            e Especificadores.
          </p>

          <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/auth")}
              className="h-14 px-8 rounded-full bg-[#D4AF37] text-[#103927] hover:bg-[#c4a02e] text-lg font-medium transition-all duration-300 shadow-[0_0_30px_-10px_rgba(212,175,55,0.6)]"
            >
              Solicitar Acesso Exclusivo
            </Button>
            <Button
              onClick={() => document.getElementById("concept")?.scrollIntoView({ behavior: "smooth" })}
              variant="outline"
              className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10 text-lg font-medium"
            >
              Conhecer o Processo
            </Button>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 opacity-50"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* SECTION 2: A TRÍADE (CONCEITO VISUAL) */}
      <section id="concept" className="py-32 px-6 md:px-20 bg-[#FAFAF9] relative">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: noiseBg }}></div>

        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <h3 className="text-4xl md:text-6xl font-serif text-[#1C1917] mb-6">A Cadeia de Valor</h3>
            <p className="text-xl text-[#1C1917]/60 max-w-2xl mx-auto font-light">
              Onde a inspiração encontra a execução técnica. Uma linha contínua de qualidade e procedência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* CARD 1: FORNECEDOR */}
            <motion.div style={{ y: y1 }} className="group">
              <div className="h-[500px] bg-[#E5E5E5] rounded-[2rem] overflow-hidden relative mb-6 shadow-2xl">
                {/* Imagem Conceitual (Placeholder Premium) */}
                <img
                  src="https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?q=80&w=1376&auto=format&fit=crop"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  alt="Madeira Bruta"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Origem
                </div>
              </div>
              <h4 className="text-3xl font-serif mb-2 flex items-center gap-3">
                <Layers className="w-6 h-6 text-[#103927]" /> Fornecedores
              </h4>
              <p className="text-[#1C1917]/70 leading-relaxed">
                O acervo de matérias-primas. Cadastre texturas, lâminas e metais para serem descobertos pelas melhores
                indústrias.
              </p>
            </motion.div>

            {/* CARD 2: FÁBRICA */}
            <motion.div className="group md:mt-20">
              <div className="h-[500px] bg-[#E5E5E5] rounded-[2rem] overflow-hidden relative mb-6 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1611486212557-79be6ebfa669?q=80&w=1470&auto=format&fit=crop"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  alt="Produção"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Transformação
                </div>
              </div>
              <h4 className="text-3xl font-serif mb-2 flex items-center gap-3">
                <Factory className="w-6 h-6 text-[#103927]" /> Fábricas
              </h4>
              <p className="text-[#1C1917]/70 leading-relaxed">
                Engenharia de produto. Crie fichas técnicas vivas, homologue fornecedores e apresente seu portfólio para
                o mercado.
              </p>
            </motion.div>

            {/* CARD 3: ESPECIFICADOR */}
            <motion.div style={{ y: y2 }} className="group md:mt-40">
              <div className="h-[500px] bg-[#E5E5E5] rounded-[2rem] overflow-hidden relative mb-6 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1374&auto=format&fit=crop"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  alt="Ambiente Pronto"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Curadoria
                </div>
              </div>
              <h4 className="text-3xl font-serif mb-2 flex items-center gap-3">
                <PenTool className="w-6 h-6 text-[#103927]" /> Especificadores
              </h4>
              <p className="text-[#1C1917]/70 leading-relaxed">
                Arquitetos e Designers. Acesse produtos exclusivos, solicite credenciamento e garanta a execução
                perfeita.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: O SOFTWARE (PROOF) */}
      <section className="py-32 bg-[#103927] text-[#FAFAF9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-8">
            <h3 className="text-5xl font-serif leading-tight">
              Tecnologia invisível para <br />
              <span className="text-[#D4AF37] italic">controle total.</span>
            </h3>
            <p className="text-lg opacity-80 font-light leading-relaxed">
              Esqueça planilhas e PDFs desatualizados. O Specify é um organismo vivo onde cada alteração na
              matéria-prima reflete instantaneamente no produto final.
            </p>
            <ul className="space-y-4 mt-8">
              {[
                "Gestão de Ficha Técnica em Nuvem",
                "Marketplace B2B com Aprovação",
                "Catálogo de Texturas Realistas",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#103927]">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate("/auth")}
              className="mt-8 h-12 px-8 rounded-full bg-white text-[#103927] hover:bg-gray-100 font-medium"
            >
              Começar Agora
            </Button>
          </div>

          {/* Mockup do Software (Abstrato) */}
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-[#D4AF37] blur-[100px] opacity-20"></div>
            <motion.div
              initial={{ rotateX: 10, rotateY: -10, rotateZ: 2 }}
              whileHover={{ rotateX: 0, rotateY: 0, rotateZ: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
            >
              {/* Simulação de Interface Minimalista */}
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-4">
                <div className="h-8 w-1/3 bg-white/20 rounded-lg"></div>
                <div className="flex gap-4">
                  <div className="h-32 w-32 bg-white/10 rounded-xl border border-white/10"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-full bg-white/20 rounded"></div>
                    <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                    <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10"></div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A261A] text-[#FAFAF9]/60 py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-serif font-bold text-white tracking-tighter">Specify.</div>
          <div className="text-sm flex gap-8">
            <a href="#" className="hover:text-white transition-colors">
              Manifesto
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Para Fábricas
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Para Arquitetos
            </a>
          </div>
          <div className="text-xs">© 2025 Specify Ecosystem. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
