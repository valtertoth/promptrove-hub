import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onImageUpload: (file: File) => void;
  isScanning: boolean;
  uploadedImage: string | null;
}

export const UploadZone = ({ onImageUpload, isScanning, uploadedImage }: UploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      onImageUpload(files[0]);
    }
  }, [onImageUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  }, [onImageUpload]);

  if (uploadedImage && isScanning) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-foreground/5">
        {/* Uploaded Image */}
        <img 
          src={uploadedImage} 
          alt="Uploaded" 
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-[1px]" />
        
        {/* Scan Line Effect */}
        <div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ai-accent to-transparent animate-scan-line"
          style={{ boxShadow: "0 0 20px 5px hsl(var(--ai-accent))" }}
        />
        
        {/* Corner Brackets */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-ai-accent" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-ai-accent" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-ai-accent" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-ai-accent" />
        
        {/* Status Text */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-foreground/80 text-background px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 animate-pulse text-ai-accent" />
          <span className="text-sm font-medium">Analisando imagem...</span>
        </div>
      </div>
    );
  }

  if (uploadedImage) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-ai-accent bg-foreground/5">
        <img 
          src={uploadedImage} 
          alt="Uploaded" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-ai-accent text-ai-accent-foreground px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Imagem analisada</span>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-md mx-auto aspect-square rounded-2xl cursor-pointer transition-all duration-300",
        "border-2 border-dashed",
        isDragOver 
          ? "border-ai-accent bg-ai-accent/5 animate-pulse-glow" 
          : "border-muted-foreground/30 hover:border-ai-accent hover:bg-ai-accent/5",
        "group"
      )}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="hidden" 
      />
      
      <div className={cn(
        "flex flex-col items-center gap-4 transition-all duration-300",
        isDragOver ? "scale-110" : "group-hover:scale-105"
      )}>
        <div className={cn(
          "p-6 rounded-full transition-all duration-300",
          isDragOver 
            ? "bg-ai-accent text-ai-accent-foreground" 
            : "bg-muted text-muted-foreground group-hover:bg-ai-accent/20 group-hover:text-ai-accent"
        )}>
          {isDragOver ? (
            <ImageIcon className="w-10 h-10" />
          ) : (
            <Upload className="w-10 h-10" />
          )}
        </div>
        
        <div className="text-center">
          <p className={cn(
            "text-lg font-medium transition-colors",
            isDragOver ? "text-ai-accent" : "text-foreground"
          )}>
            {isDragOver ? "Solte a imagem aqui" : "Arraste uma imagem"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou clique para selecionar
          </p>
        </div>
      </div>

      {/* Decorative corners that glow on hover */}
      <div className={cn(
        "absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 transition-colors duration-300",
        isDragOver ? "border-ai-accent" : "border-muted-foreground/30 group-hover:border-ai-accent"
      )} />
      <div className={cn(
        "absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 transition-colors duration-300",
        isDragOver ? "border-ai-accent" : "border-muted-foreground/30 group-hover:border-ai-accent"
      )} />
      <div className={cn(
        "absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 transition-colors duration-300",
        isDragOver ? "border-ai-accent" : "border-muted-foreground/30 group-hover:border-ai-accent"
      )} />
      <div className={cn(
        "absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 transition-colors duration-300",
        isDragOver ? "border-ai-accent" : "border-muted-foreground/30 group-hover:border-ai-accent"
      )} />
    </label>
  );
};
