import React, { useEffect, useState } from 'react';
import { Minimize2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  storage_path: string;
  name?: string;
  description?: string;
  price?: string;
  link?: string;
  is_blurred: boolean;
  is_main: boolean;
}

interface SlideshowDisplayProps {
  mediaItems: MediaItem[];
  currentIndex: number;
  isActive: boolean;
  className?: string;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const SlideshowDisplay: React.FC<SlideshowDisplayProps> = ({
  mediaItems,
  currentIndex,
  isActive,
  className = "",
  onMinimize,
  onClose
}) => {
  if (!isActive || mediaItems.length === 0) {
    return null;
  }

  const currentMedia = mediaItems[currentIndex];
  if (!currentMedia) {
    return null;
  }

  return (
    <div className={`slideshow-display ${className}`}>
      {/* Fullscreen Media Display */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {currentMedia.type === 'image' ? (
            <img
              src={`https://lgstvoixptdcqohsxkvo.supabase.co/storage/v1/object/public/media/${currentMedia.storage_path}`}
              alt={currentMedia.name || "Media"}
              className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                currentMedia.is_blurred ? 'blur-md' : ''
              }`}
            />
          ) : (
            <video
              src={`https://lgstvoixptdcqohsxkvo.supabase.co/storage/v1/object/public/media/${currentMedia.storage_path}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                currentMedia.is_blurred ? 'blur-md' : ''
              }`}
              autoPlay
              muted
              loop
            />
          )}

          {/* Price overlay */}
          {currentMedia.price && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              {(() => {
                try {
                  const priceConfig = typeof currentMedia.price === 'string' && currentMedia.price.startsWith('{') 
                    ? JSON.parse(currentMedia.price) 
                    : null;
                  
                  if (priceConfig) {
                    return (
                      <div
                        className={`font-bold px-4 py-2 rounded-lg text-2xl ${
                          priceConfig.hasBlinkAnimation ? 'animate-pulse' : ''
                        }`}
                        style={{
                          fontFamily: priceConfig.fontFamily,
                          fontSize: `${Math.max(priceConfig.fontSize * 1.5, 24)}px`,
                          color: priceConfig.textColor,
                          backgroundColor: priceConfig.isTransparent ? 'transparent' : priceConfig.backgroundColor,
                        }}
                      >
                        {currentMedia.is_blurred ? '🔒 ' : ''}{priceConfig.text}
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-black/70 text-white font-bold px-4 py-2 rounded-lg text-xl">
                        {currentMedia.is_blurred ? '🔒 ' : ''}{currentMedia.price}
                      </div>
                    );
                  }
                } catch {
                  return (
                    <div className="bg-black/70 text-white font-bold px-4 py-2 rounded-lg text-xl">
                      {currentMedia.is_blurred ? '🔒 ' : ''}{currentMedia.price}
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* Progress indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {mediaItems.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Slideshow indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
              🎬 Slideshow ({currentIndex + 1}/{mediaItems.length})
            </div>
          </div>

          {/* Control buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {onMinimize && (
              <Button
                onClick={onMinimize}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-sm border border-white/20 transition-all duration-300"
                title="Minimizar (continue navegando)"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full bg-red-500/70 hover:bg-red-600/90 backdrop-blur-sm border border-white/20 transition-all duration-300"
                title="Fechar slideshow"
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};