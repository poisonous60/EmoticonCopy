import { useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (imageUrl: string): Promise<void> => {
    // Check if we're on mobile/touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);

    console.log('Starting clipboard operation. Mobile detected:', isMobile);
    console.log('Image URL:', imageUrl);
    console.log('Clipboard API available:', !!navigator.clipboard);
    console.log('ClipboardItem available:', !!window.ClipboardItem);

    // For mobile devices, use simplified approach
    if (isMobile) {
      console.log('Attempting mobile clipboard copy');
      
      try {
        // Try to fetch and copy the image directly
        console.log('Fetching image blob...');
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        console.log('Blob fetched, type:', blob.type, 'size:', blob.size);
        
        if (navigator.clipboard && window.ClipboardItem) {
          console.log('Attempting clipboard write with blob...');
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          console.log('Successfully copied image to clipboard!');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } else {
          console.log('Clipboard API not available, falling back to URL copy');
          throw new Error('Clipboard API not supported');
        }
      } catch (error) {
        console.warn('Direct image copy failed, trying URL fallback:', error);
        
        // Fallback to copying URL
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.origin + imageUrl);
            console.log('URL copied to clipboard as fallback');
          } else {
            // Last resort: create temporary input for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.origin + imageUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            console.log('URL copied using fallback method');
          }
          
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch (fallbackError) {
          console.error('All mobile clipboard methods failed:', fallbackError);
          throw fallbackError;
        }
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
