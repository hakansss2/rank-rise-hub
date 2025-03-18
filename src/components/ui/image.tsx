
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset loading state when src changes
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(placeholder);
    
    const img = new window.Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      if (externalOnLoad) externalOnLoad();
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setCurrentSrc(placeholder);
      setIsLoading(false);
      setHasError(true);
      if (externalOnError) externalOnError();
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder, externalOnLoad, externalOnError]);
  
  return (
    <div className="relative overflow-hidden">
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-all duration-500 ease-in-out",
          isLoading ? "scale-110 blur-md" : "scale-100 blur-0",
          hasError ? "opacity-50" : "opacity-100",
          className
        )}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-xs">
          Image Error
        </div>
      )}
    </div>
  );
};

export default Image;
