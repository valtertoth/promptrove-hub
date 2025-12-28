import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  similarityScore?: number;
}

interface ProductGridProps {
  products: Product[];
  hasSearched: boolean;
}

export const ProductGrid = ({ products, hasSearched }: ProductGridProps) => {
  const getSimilarityLabel = (score: number) => {
    if (score >= 95) return { text: `${score}% Match`, variant: "default" as const };
    if (score >= 80) return { text: "Alta Similaridade", variant: "secondary" as const };
    if (score >= 60) return { text: "Similaridade Média", variant: "outline" as const };
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-foreground">
            {hasSearched ? "Resultados da Busca" : "Catálogo de Produtos"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {hasSearched 
              ? "Produtos ordenados por similaridade visual" 
              : "Explore nossa coleção de móveis"}
          </p>
        </div>
        {hasSearched && (
          <Badge className="bg-ai-accent text-ai-accent-foreground">
            {products.filter(p => p.similarityScore && p.similarityScore >= 60).length} matches
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => {
          const similarity = product.similarityScore ? getSimilarityLabel(product.similarityScore) : null;
          const isTopMatch = hasSearched && product.similarityScore && product.similarityScore >= 90;

          return (
            <div
              key={product.id}
              className={cn(
                "group relative bg-card rounded-xl overflow-hidden border transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                isTopMatch 
                  ? "border-ai-accent ring-2 ring-ai-accent/20" 
                  : "border-border hover:border-ai-accent/50",
                hasSearched && "animate-fade-in"
              )}
              style={{ animationDelay: hasSearched ? `${index * 100}ms` : "0ms" }}
            >
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Similarity Badge */}
              {hasSearched && similarity && (
                <div className="absolute top-3 right-3">
                  <Badge 
                    className={cn(
                      "shadow-lg",
                      product.similarityScore && product.similarityScore >= 90 
                        ? "bg-ai-accent text-ai-accent-foreground animate-pulse-glow" 
                        : ""
                    )}
                    variant={similarity.variant}
                  >
                    {similarity.text}
                  </Badge>
                </div>
              )}

              {/* Top Match Glow Effect */}
              {isTopMatch && (
                <div className="absolute inset-0 bg-gradient-to-t from-ai-accent/20 to-transparent pointer-events-none" />
              )}

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="font-medium text-foreground group-hover:text-ai-accent transition-colors">
                  {product.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
