import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  fabricaId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload = ({ fabricaId, images, onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Limite de imagens',
        description: `Você pode adicionar no máximo ${maxImages} imagens.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size (5MB)
        if (file.size > 5242880) {
          toast({
            title: 'Arquivo muito grande',
            description: `${file.name} excede o limite de 5MB.`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
          toast({
            title: 'Formato inválido',
            description: `${file.name} não é um formato válido (JPG, PNG ou WebP).`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${fabricaId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('produtos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast({
          title: 'Upload concluído',
          description: `${newImages.length} imagem(ns) adicionada(s) com sucesso!`,
        });
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Erro no upload',
        description: 'Erro ao fazer upload das imagens. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async (imageUrl: string) => {
    try {
      // Extract file path from URL
      const path = imageUrl.split('/produtos/')[1];
      
      if (path) {
        const { error } = await supabase.storage
          .from('produtos')
          .remove([path]);

        if (error) throw error;
      }

      onImagesChange(images.filter(img => img !== imageUrl));
      
      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida com sucesso.',
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover imagem.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading || images.length >= maxImages}
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Enviando...' : 'Adicionar Imagens'}
            </span>
          </Button>
        </label>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages} imagens
        </span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Imagem ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(imageUrl)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, WebP (máx. 5MB por imagem)
      </p>
    </div>
  );
};

export default ImageUpload;
