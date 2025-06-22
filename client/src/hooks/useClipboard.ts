import { useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (imageUrl: string): Promise<void> => {
    // Check if we're on mobile/touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);

    // For mobile devices, try to copy image first, then fallback
    if (isMobile) {
      try {
        // Try to copy the actual image first (iOS Safari supports this)
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        if (navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
          } catch (clipboardError) {
            console.warn('Mobile image clipboard failed, trying canvas conversion:', clipboardError);
          }
        }

        // Try canvas conversion for mobile
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
                    console.warn('Mobile clipboard write failed, falling back to URL:', clipboardError);
                    await navigator.clipboard.writeText(window.location.origin + imageUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    resolve();
                  }
                } else {
                  // Final fallback: copy URL
                  await navigator.clipboard.writeText(window.location.origin + imageUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  resolve();
                }
              }, 'image/png');
            } catch (canvasError) {
              console.warn('Canvas conversion failed on mobile:', canvasError);
              try {
                await navigator.clipboard.writeText(window.location.origin + imageUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                resolve();
              } catch (urlError) {
                reject(urlError);
              }
            }
          };
          
          img.onerror = async () => {
            console.warn('Image load failed on mobile');
            try {
              await navigator.clipboard.writeText(window.location.origin + imageUrl);
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
        console.error('Mobile copy failed:', error);
        throw error;
      }
    }

    // Desktop approach - try to copy actual image
    try {
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
                  await navigator.clipboard.writeText(window.location.origin + imageUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  resolve();
                }
              } else {
                await navigator.clipboard.writeText(window.location.origin + imageUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                resolve();
              }
            }, 'image/png');
          } catch (canvasError) {
            console.warn('Canvas conversion failed, falling back to URL copy:', canvasError);
            try {
              await navigator.clipboard.writeText(window.location.origin + imageUrl);
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
            await navigator.clipboard.writeText(window.location.origin + imageUrl);
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
      try {
        await navigator.clipboard.writeText(window.location.origin + imageUrl);
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
