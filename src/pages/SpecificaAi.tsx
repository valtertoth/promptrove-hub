import { useState, useCallback } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/specifica-ai/UploadZone";
import { ProductGrid, Product } from "@/components/specifica-ai/ProductGrid";
import { useNavigate } from "react-router-dom";

// Mock dataset - In production, this would come from Supabase
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Cadeira Eames",
    category: "Cadeiras",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop",
  },
  {
    id: "2",
    name: "Poltrona Barcelona",
    category: "Poltronas",
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=500&fit=crop",
  },
  {
    id: "3",
    name: "Mesa de Centro Nórdica",
    category: "Mesas",
    imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&h=500&fit=crop",
  },
  {
    id: "4",
    name: "Sofá Modular",
    category: "Sofás",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop",
  },
  {
    id: "5",
    name: "Cadeira de Escritório",
    category: "Cadeiras",
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&h=500&fit=crop",
  },
  {
    id: "6",
    name: "Mesa de Jantar",
    category: "Mesas",
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=500&fit=crop",
  },
  {
    id: "7",
    name: "Luminária Arco",
    category: "Iluminação",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop",
  },
  {
    id: "8",
    name: "Estante Industrial",
    category: "Estantes",
    imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&h=500&fit=crop",
  },
];

/**
 * handleImageSearch - Core function for Visual Search
 * 
 * INTEGRATION POINTS FOR TRANSFORMERS.JS:
 * 
 * 1. Import the pipeline from @huggingface/transformers:
 *    import { pipeline } from "@huggingface/transformers";
 * 
 * 2. Create a feature extraction pipeline for embeddings:
 *    const extractor = await pipeline(
 *      "feature-extraction",
 *      "Xenova/clip-vit-base-patch32", // CLIP model for image embeddings
 *      { device: "webgpu" }
 *    );
 * 
 * 3. Generate embeddings for the uploaded image:
 *    const imageEmbedding = await extractor(imageDataUrl);
 * 
 * 4. Compare with pre-computed product embeddings using cosine similarity
 * 
 * 5. Return products sorted by similarity score
 */
const handleImageSearch = async (file: File, products: Product[]): Promise<Product[]> => {
  // SIMULATION: In production, this would use Transformers.js or an API
  // to generate embeddings and compute similarity scores
  
  return new Promise((resolve) => {
    // Simulate AI processing delay (2 seconds)
    setTimeout(() => {
      // Mock similarity scores - randomly assign high scores to some products
      const scoredProducts = products.map((product, index) => ({
        ...product,
        similarityScore: index < 3 
          ? 98 - (index * 5) // Top 3 get high scores
          : Math.floor(Math.random() * 40) + 30 // Rest get lower scores
      }));

      // Sort by similarity score (highest first)
      const sortedProducts = scoredProducts.sort(
        (a, b) => (b.similarityScore || 0) - (a.similarityScore || 0)
      );

      resolve(sortedProducts);
    }, 2000);
  });
};

const SpecificaAi = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const handleImageUpload = useCallback(async (file: File) => {
    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsScanning(true);
    setHasSearched(false);

    try {
      // Perform visual search
      const results = await handleImageSearch(file, mockProducts);
      setProducts(results);
      setHasSearched(true);
    } catch (error) {
      console.error("Error during image search:", error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setIsScanning(false);
    setHasSearched(false);
    setProducts(mockProducts);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-ai-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-ai-accent-foreground" />
              </div>
              <span className="text-xl font-serif font-semibold text-foreground">
                Specifica<span className="text-ai-accent">.Ai</span>
              </span>
            </div>
          </div>
          
          {hasSearched && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="border-ai-accent text-ai-accent hover:bg-ai-accent hover:text-ai-accent-foreground"
            >
              Nova Busca
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4">
              Busca Visual <span className="text-ai-accent">Inteligente</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Faça upload de uma foto de um móvel e nossa IA encontrará produtos 
              similares em nosso catálogo instantaneamente.
            </p>
          </div>

          {/* Upload Zone */}
          <UploadZone 
            onImageUpload={handleImageUpload}
            isScanning={isScanning}
            uploadedImage={uploadedImage}
          />

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["Análise em tempo real", "IA avançada", "Alta precisão"].map((feature) => (
              <div 
                key={feature}
                className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ProductGrid products={products} hasSearched={hasSearched} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Powered by Visual AI Technology</p>
        </div>
      </footer>
    </div>
  );
};

export default SpecificaAi;
