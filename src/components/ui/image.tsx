
import React, { useState } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className, placeholder, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const fallbackSrc = placeholder || "https://placehold.co/600x400/222/444?text=Image";
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    console.error(`Failed to load image: ${src}`);
  };
  
  return (
    <>
      {isLoading && (
        <div className={`bg-gray-700/50 animate-pulse ${className}`} />
      )}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt || "Image"}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
};

export default Image;
