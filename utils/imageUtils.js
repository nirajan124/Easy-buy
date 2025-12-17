// Compress image before converting to base64 (aggressive compression for smaller payload)
const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions (more aggressive)
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (lower quality for smaller size)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Log compression info
        const originalSize = file.size;
        const compressedSize = (compressedBase64.length * 3) / 4;
        const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        console.log(`Image compressed: ${(originalSize / 1024).toFixed(2)}KB -> ${(compressedSize / 1024).toFixed(2)}KB (${compressionRatio}% reduction)`);
        
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

// Convert file to base64 (with compression for all images to reduce size)
export const fileToBase64 = async (file) => {
  // Compress all images to reduce payload size
  // Only skip compression for very small files (< 100KB)
  if (file.size > 100 * 1024) {
    return await compressImage(file);
  }
  
  // For very small files, convert directly
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Convert multiple files to base64 (with compression)
export const filesToBase64 = async (files) => {
  const promises = Array.from(files).map(file => fileToBase64(file));
  return Promise.all(promises);
};

