import { useState, useCallback, useEffect } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/specifica-ai/UploadZone";
import { ProductGrid, Product } from "@/components/specifica-ai/ProductGrid";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, tipo_produto, imagens, descricao')
          .eq('ativo', true);

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        // Map database structure to Product interface
        const mappedProducts: Product[] = (data || []).map(produto => {
          // Get first image from imagens array
          const imagens = produto.imagens as string[] | null;
          const imageUrl = imagens && imagens.length > 0 
            ? imagens[0] 
            : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop';

          return {
            id: produto.id,
            name: produto.nome,
            category: produto.tipo_produto || 'Móvel',
            imageUrl
          };
        });

        setProducts(mappedProducts);
        setAllProducts(mappedProducts);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsScanning(true);
    setHasSearched(false);

    try {
      // Perform visual search
      const results = await handleImageSearch(file, allProducts);
      setProducts(results);
      setHasSearched(true);
    } catch (error) {
      console.error("Error during image search:", error);
    } finally {
      setIsScanning(false);
    }
  }, [allProducts]);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setIsScanning(false);
    setHasSearched(false);
    setProducts(allProducts);
  }, [allProducts]);

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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-ai-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhum produto cadastrado ainda.</p>
              <p className="text-muted-foreground text-sm mt-2">
                A busca visual funcionará melhor quando houver mais produtos no catálogo.
              </p>
            </div>
          ) : (
            <ProductGrid products={products} hasSearched={hasSearched} />
          )}
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
