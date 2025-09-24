import React from 'react';
import { Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

interface MediaVitrineProps {
  currentMedia?: {
    id: string;
    type: 'image' | 'video';
    url: string;
    name?: string;
    description?: string;
  };
  onUploadVideo: () => void;
  onUploadImage: () => void;
  className?: string;
  visibilitySettings?: {
    showUploadButtons?: boolean;
  };
}

export const MediaVitrine = ({
  currentMedia,
  onUploadVideo,
  onUploadImage,
  className = "",
  visibilitySettings
}: MediaVitrineProps) => {
  const { t } = useLanguage();
  return (
    <Card className={`relative p-6 bg-card ${className}`}>
      <div className="flex justify-between items-center gap-6">
        
        {/* Media Content Area */}
        <div className="flex-1 flex items-center justify-center min-h-[200px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
          {currentMedia ? (
            <div className="relative w-full h-full">
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.name || "Media preview"}
                  className="w-full h-full object-contain rounded-lg"
                  title={currentMedia.description}
                />
              ) : (
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain rounded-lg"
                  title={currentMedia.description}
                  controls
                  muted
                />
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('vitrine.noMedia')}</p>
              <p className="text-sm">{t('vitrine.useButtons')}</p>
            </div>
          )}
        </div>

        {/* Side Action Icons - Only show if showUploadButtons is true */}
        {(visibilitySettings?.showUploadButtons ?? true) && (
          <div className="flex flex-col gap-3 items-center">
            <Button
              onClick={onUploadVideo}
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg transition-all duration-300 group"
              title={t('vitrine.uploadVideo')}
            >
              <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </Button>
            
            <Button
              onClick={onUploadImage}
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg transition-all duration-300 group"
              title={t('vitrine.addImage')}
            >
              <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </Button>
            
            {/* Optional: Add more action buttons */}
            <div className="w-px h-6 bg-border my-2" />
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-medium">{t('vitrine.actions')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Media Info (if present) */}
      {currentMedia && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              {currentMedia.name && (
                <h4 className="font-medium text-foreground">{currentMedia.name}</h4>
              )}
              {currentMedia.description && (
                <p className="text-sm text-muted-foreground mt-1">{currentMedia.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded-md">
                {currentMedia.type === 'image' ? t('vitrine.image') : t('vitrine.video')}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};