
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  placeholder = "/placeholder.svg", 
  className,
  onLoad: externalOnLoad,
  onError: externalOnError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset loading state when src changes
    setIsLoading(true);
    setHasError(false);
    
    // Use a conditional to check if the src exists
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    // Use HTMLImageElement instead of the global Image constructor
    // This avoids the name collision with our React component
    const imgElement = document.createElement('img');
    imgElement.src = src;
    
    imgElement.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      if (externalOnLoad) externalOnLoad();
    };
    
    imgElement.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setHasError(true);
      setIsLoading(false);
      if (externalOnError) externalOnError();
    };
    
    return () => {
      imgElement.onload = null;
      imgElement.onerror = null;
    };
  }, [src, placeholder, externalOnLoad, externalOnError]);
  
  return (
    <div className="relative overflow-hidden">
      {hasError ? (
        <div className="flex flex-col items-center justify-center bg-valorant-gray/20 rounded w-full h-full min-h-[64px]">
          <ImageOff className="h-6 w-6 text-valorant-gray/60" />
          <span className="text-xs text-valorant-gray/60 mt-1">Resim Yüklenemedi</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "transition-all duration-300 ease-in-out",
            isLoading ? "scale-105 blur-sm" : "scale-100 blur-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default Image;
