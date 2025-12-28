import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Map,
  MapPin,
  Check,
  X,
  Search,
  Truck,
  Building2,
  Loader2,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GerenciadorCidadesAutorizadasProps {
  conexaoId: string;
  especificadorNome: string;
  authorizedRegions: string[];
  authorizedCities: Record<string, { all: boolean; cities: string[] }>;
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mapa de cidades por estado (principais cidades para logística)
const CIDADES_POR_ESTADO: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AL: ["Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Barreiras"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu"],
  DF: ["Brasília", "Ceilândia", "Taguatinga", "Samambaia", "Plano Piloto", "Águas Claras"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim", "Linhares", "São Mateus", "Colatina"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade"],
  MA: ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres", "Sorriso", "Lucas do Rio Verde"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí", "Nova Andradina"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Poços de Caldas"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal", "Abaetetuba", "Cametá"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cabedelo"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "Belford Roxo", "São João de Meriti", "Petrópolis", "Volta Redonda", "Magé", "Macaé", "Itaboraí", "Cabo Frio"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Alvorada", "Passo Fundo"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó", "Criciúma", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça", "Balneário Camboriú"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "São José dos Campos", "Osasco", "Ribeirão Preto", "Sorocaba", "Santos", "Mauá", "São José do Rio Preto", "Mogi das Cruzes", "Diadema", "Jundiaí", "Piracicaba", "Carapicuíba", "Bauru", "Itaquaquecetuba", "São Vicente", "Franca", "Praia Grande", "Guarujá", "Taubaté", "Limeira"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão", "Estância"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
};

const NOMES_ESTADOS: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

const GerenciadorCidadesAutorizadas = ({
  conexaoId,
  especificadorNome,
  authorizedRegions,
  authorizedCities: initialCities,
  onUpdate,
  open,
  onOpenChange,
}: GerenciadorCidadesAutorizadasProps) => {
  const [localCities, setLocalCities] = useState<Record<string, { all: boolean; cities: string[] }>>(initialCities || {});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Inicializar estrutura para estados que não têm configuração
    const newCities = { ...localCities };
    authorizedRegions.forEach(uf => {
      if (!newCities[uf]) {
        newCities[uf] = { all: true, cities: [] };
      }
    });
    setLocalCities(newCities);
  }, [authorizedRegions]);

  const toggleEstadoCompleto = (uf: string, enabled: boolean) => {
    setLocalCities(prev => ({
      ...prev,
      [uf]: {
        all: enabled,
        cities: enabled ? [] : prev[uf]?.cities || [],
      }
    }));
  };

  const toggleCidade = (uf: string, cidade: string, enabled: boolean) => {
    setLocalCities(prev => {
      const currentCities = prev[uf]?.cities || [];
      const newCities = enabled
        ? [...currentCities, cidade]
        : currentCities.filter(c => c !== cidade);
      
      return {
        ...prev,
        [uf]: {
          all: false,
          cities: newCities,
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("commercial_connections")
        .update({ 
          authorized_cities: localCities,
          updated_at: new Date().toISOString() 
        })
        .eq("id", conexaoId);

      if (error) throw error;

      toast({
        title: "Cidades Atualizadas",
        description: "As permissões de cidades foram salvas com sucesso.",
        className: "bg-emerald-600 text-white",
      });
      
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar cidades:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as permissões.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCidadesDoEstado = (uf: string) => {
    return CIDADES_POR_ESTADO[uf] || [];
  };

  const getResumoEstado = (uf: string) => {
    const config = localCities[uf];
    if (!config || config.all) {
      return { tipo: "completo", count: getCidadesDoEstado(uf).length };
    }
    return { tipo: "parcial", count: config.cities.length };
  };

  const filteredCidades = (uf: string) => {
    const cidades = getCidadesDoEstado(uf);
    if (!searchTerm) return cidades;
    return cidades.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Gerenciar Cidades Autorizadas
          </DialogTitle>
          <DialogDescription>
            Configure as cidades onde <strong>{especificadorNome}</strong> pode atuar em cada estado.
            Você pode autorizar o estado completo ou selecionar cidades específicas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-3 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Logística por região</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700">
              <Check className="h-3 w-3" />
              Estado Completo
            </Badge>
            <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700">
              <MapPin className="h-3 w-3" />
              Cidades Específicas
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <Accordion type="multiple" className="w-full space-y-2">
            {authorizedRegions.map((uf) => {
              const resumo = getResumoEstado(uf);
              const isCompleto = localCities[uf]?.all !== false;
              
              return (
                <AccordionItem 
                  key={uf} 
                  value={uf}
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{uf}</span>
                        <span className="text-sm text-muted-foreground">
                          {NOMES_ESTADOS[uf]}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={isCompleto 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-amber-50 text-amber-700"
                        }
                      >
                        {isCompleto ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Estado Completo
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            {resumo.count} cidades
                          </>
                        )}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      {/* Toggle Estado Completo */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Map className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Autorizar Estado Completo</p>
                            <p className="text-sm text-muted-foreground">
                              Todas as cidades de {NOMES_ESTADOS[uf]} estarão autorizadas
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isCompleto}
                          onCheckedChange={(checked) => toggleEstadoCompleto(uf, checked)}
                        />
                      </div>

                      {/* Lista de Cidades (apenas se não for estado completo) */}
                      {!isCompleto && (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={`Buscar cidade em ${NOMES_ESTADOS[uf]}...`}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2">
                            {filteredCidades(uf).map((cidade) => {
                              const isSelected = localCities[uf]?.cities?.includes(cidade);
                              return (
                                <button
                                  key={cidade}
                                  onClick={() => toggleCidade(uf, cidade, !isSelected)}
                                  className={`flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors ${
                                    isSelected
                                      ? "bg-primary/10 text-primary border border-primary/30"
                                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                  }`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className="truncate">{cidade}</span>
                                </button>
                              );
                            })}
                          </div>

                          {localCities[uf]?.cities?.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {localCities[uf].cities.length} cidade(s) selecionada(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#103927] hover:bg-[#103927]/90"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Salvar Permissões
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciadorCidadesAutorizadas;
