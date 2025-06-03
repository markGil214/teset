/**
 * Utility function to load external scripts dynamically
 */
export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = (error) => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
};

/**
 * Load GSAP animation library
 */
export const loadGSAP = async (): Promise<void> => {
  try {
    // First try to load from CDN
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    console.log('GSAP loaded successfully from CDN');
  } catch (error) {
    console.error('Failed to load GSAP from CDN, check network connection', error);
    
    // Fallback: try to load from node_modules (if using Vite/Webpack)
    try {
      // This assumes you've installed GSAP via npm
      // The import will be handled by your bundler
      const gsap = await import('gsap');
      window.gsap = gsap;
      console.log('GSAP loaded successfully from local package');
    } catch (fallbackError) {
      console.error('Failed to load GSAP from local package', fallbackError);
    }
  }
};
