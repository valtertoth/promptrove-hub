import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface VitrineFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedAcesso: string;
  onAcessoChange: (value: string) => void;
  selectedFabricante: string;
  onFabricanteChange: (value: string) => void;
  selectedCategoria: string;
  onCategoriaChange: (value: string) => void;
  selectedAmbiente: string;
  onAmbienteChange: (value: string) => void;
  selectedFornecedor: string;
  onFornecedorChange: (value: string) => void;
  fabricantes: { id: string; nome: string }[];
  categorias: string[];
  ambientes: string[];
  fornecedores: { id: string; nome: string }[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const VitrineFilters = ({
  searchQuery,
  onSearchChange,
  selectedAcesso,
  onAcessoChange,
  selectedFabricante,
  onFabricanteChange,
  selectedCategoria,
  onCategoriaChange,
  selectedAmbiente,
  onAmbienteChange,
  selectedFornecedor,
  onFornecedorChange,
  fabricantes,
  categorias,
  ambientes,
  fornecedores,
  onClearFilters,
  activeFiltersCount,
}: VitrineFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Barra de busca principal */}
      <div className="relative max-w-3xl mx-auto">
        <Search className="absolute left-5 top-4 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por design, categoria ou fábrica..."
          className="pl-14 h-14 rounded-full bg-white border-transparent shadow-lg shadow-black/5 text-lg focus:ring-2 focus:ring-[#103927]/20 transition-all"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filtros avançados */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Filtro de Acesso */}
        <Select value={selectedAcesso} onValueChange={onAcessoChange}>
          <SelectTrigger className="w-[180px] rounded-full bg-white border-border/50 shadow-sm">
            <SelectValue placeholder="Status de Acesso" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="aprovado">Acesso Liberado</SelectItem>
            <SelectItem value="pendente">Em Análise</SelectItem>
            <SelectItem value="nao_solicitado">Não Solicitado</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Fabricante */}
        <Select value={selectedFabricante} onValueChange={onFabricanteChange}>
          <SelectTrigger className="w-[180px] rounded-full bg-white border-border/50 shadow-sm">
            <SelectValue placeholder="Fabricante" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            <SelectItem value="todos">Todos Fabricantes</SelectItem>
            {fabricantes.map((fab) => (
              <SelectItem key={fab.id} value={fab.id}>
                {fab.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Categoria */}
        <Select value={selectedCategoria} onValueChange={onCategoriaChange}>
          <SelectTrigger className="w-[180px] rounded-full bg-white border-border/50 shadow-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            <SelectItem value="todos">Todas Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Ambiente */}
        <Select value={selectedAmbiente} onValueChange={onAmbienteChange}>
          <SelectTrigger className="w-[180px] rounded-full bg-white border-border/50 shadow-sm">
            <SelectValue placeholder="Ambiente" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            <SelectItem value="todos">Todos Ambientes</SelectItem>
            {ambientes.map((amb) => (
              <SelectItem key={amb} value={amb}>
                {amb}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Fornecedor */}
        <Select value={selectedFornecedor} onValueChange={onFornecedorChange}>
          <SelectTrigger className="w-[180px] rounded-full bg-white border-border/50 shadow-sm">
            <SelectValue placeholder="Fornecedor" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            <SelectItem value="todos">Todos Fornecedores</SelectItem>
            {fornecedores.map((forn) => (
              <SelectItem key={forn.id} value={forn.id}>
                {forn.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botão limpar filtros */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="rounded-full gap-2"
          >
            <X className="h-4 w-4" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {selectedAcesso && selectedAcesso !== "todos" && (
            <Badge variant="secondary" className="rounded-full">
              Acesso: {selectedAcesso === "aprovado" ? "Liberado" : selectedAcesso === "pendente" ? "Em Análise" : "Não Solicitado"}
            </Badge>
          )}
          {selectedFabricante && selectedFabricante !== "todos" && (
            <Badge variant="secondary" className="rounded-full">
              {fabricantes.find((f) => f.id === selectedFabricante)?.nome}
            </Badge>
          )}
          {selectedCategoria && selectedCategoria !== "todos" && (
            <Badge variant="secondary" className="rounded-full">
              {selectedCategoria}
            </Badge>
          )}
          {selectedAmbiente && selectedAmbiente !== "todos" && (
            <Badge variant="secondary" className="rounded-full">
              {selectedAmbiente}
            </Badge>
          )}
          {selectedFornecedor && selectedFornecedor !== "todos" && (
            <Badge variant="secondary" className="rounded-full">
              {fornecedores.find((f) => f.id === selectedFornecedor)?.nome}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default VitrineFilters;
