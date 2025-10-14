import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (disabled) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Tamanho máximo: 5MB`);
        return;
      }
    }

    // Convert files to data URLs for preview (temporary)
    const newImageUrls: string[] = [];
    for (const file of filesToUpload) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImageUrls.push(dataUrl);
    }

    onImagesChange([...images, ...newImageUrls]);
    toast.success(`${filesToUpload.length} imagem(ns) adicionada(s)`);
  }, [images, maxImages, onImagesChange, disabled]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Imagem removida');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('image-upload-input')?.click()}
        >
          <input
            id="image-upload-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileInput}
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Fazendo upload...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Clique ou arraste imagens aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP até 5MB (máximo {maxImages} imagens)
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled={disabled}>
                  Selecionar Arquivos
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {!disabled && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma imagem adicionada ainda</p>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <p className="text-xs text-muted-foreground">
        {images.length} de {maxImages} imagens • As imagens serão salvas quando você salvar o veículo
      </p>
    </div>
  );
}

