import { useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (imageUrl: string): Promise<void> => {
    // Check if we're on mobile/touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);

    // For mobile devices, use a simpler approach
    if (isMobile) {
      try {
        // First try copying the image URL
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(window.location.origin + imageUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
        
        // Fallback: create a temporary input element for mobile
        const tempInput = document.createElement('input');
        tempInput.value = window.location.origin + imageUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.left = '-999999px';
        tempInput.style.top = '-999999px';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);
        
        const successful = document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
        
        throw new Error('Mobile copy failed');
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
