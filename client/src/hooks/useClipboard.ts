import { useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (imageUrl: string): Promise<void> => {
    try {
      // Create an image element and convert it to PNG using canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Could not get canvas context');
            }
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(async (pngBlob) => {
              if (pngBlob && navigator.clipboard && window.ClipboardItem) {
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({
                      'image/png': pngBlob
                    })
                  ]);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  resolve();
                } catch (clipboardError) {
                  console.warn('Clipboard image write failed, falling back to URL copy:', clipboardError);
                  // Fallback to URL copy
                  await navigator.clipboard.writeText(imageUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  resolve();
                }
              } else {
                // Fallback: copy the URL to clipboard
                await navigator.clipboard.writeText(imageUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                resolve();
              }
            }, 'image/png');
          } catch (canvasError) {
            console.warn('Canvas conversion failed, falling back to URL copy:', canvasError);
            // Fallback to URL copy
            try {
              await navigator.clipboard.writeText(imageUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              resolve();
            } catch (urlError) {
              reject(urlError);
            }
          }
        };
        
        img.onerror = async () => {
          console.warn('Image load failed, falling back to URL copy');
          try {
            await navigator.clipboard.writeText(imageUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            resolve();
          } catch (urlError) {
            reject(urlError);
          }
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Final fallback: try to copy URL
      try {
        await navigator.clipboard.writeText(imageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Even URL copy failed:', fallbackError);
        throw error;
      }
    }
  };

  const copyText = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
      throw error;
    }
  };

  return {
    copied,
    copyToClipboard,
    copyText
  };
}
