const CLOUD_NAME = 'giteeaam';
const API_KEY = '386458127481753';
const API_SECRET = '_djEzif0GQFAMw846YguG0htcL4';

/**
 * Uploads an image, document (PDF), or base64 file directly to Cloudinary.
 * Uses /auto/upload so both images and PDFs/documents are handled correctly.
 * Returns the permanent HTTPS CDN URL.
 */
export async function uploadToCloudinary(file) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const strToSign = `timestamp=${timestamp}${API_SECRET}`;

    const msgBuffer = new TextEncoder().encode(strToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    // Using auto/upload to support images, PDFs, and docs
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn('Cloudinary auto/upload failed, trying fallback raw/upload:', data.error);
      // Fallback for PDF raw uploads
      const rawRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
        method: 'POST',
        body: formData
      });
      const rawData = await rawRes.json();
      if (!rawRes.ok || rawData.error) {
        throw new Error(rawData.error?.message || data.error?.message || 'Failed to upload to Cloudinary');
      }
      return rawData.secure_url || rawData.url;
    }

    return data.secure_url || data.url;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
}

/**
 * Helper to convert a File/Blob to a base64 Data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
