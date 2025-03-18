
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  placeholder = "/placeholder.svg", 
  className,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  
  useEffect(() => {
    // Reset loading state when src changes
    setIsLoading(true);
    setCurrentSrc(placeholder);
    
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setCurrentSrc(placeholder);
      setIsLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);
  
  return (
    <div className="relative overflow-hidden">
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-all duration-500 ease-in-out",
          isLoading ? "scale-110 blur-md" : "scale-100 blur-0",
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Image;
