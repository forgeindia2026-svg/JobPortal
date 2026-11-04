const CLOUD_NAME = 'giteeaam';
const API_KEY = '386458127481753';
const API_SECRET = '_djEzif0GQFAMw846YguG0htcL4';
// Unsigned upload preset (must be created in Cloudinary dashboard > Settings > Upload Presets)
// Set it to: "unsigned" mode, resource_type: auto, folder: offer_letters
const UNSIGNED_PRESET = 'offer_letters_unsigned';

/**
 * Uploads a file (PDF, image, etc.) to Cloudinary.
 * Tries unsigned preset first (works for all file types from browser).
 * Falls back to signed upload, then fileToBase64 as final fallback.
 * Returns the permanent HTTPS CDN URL.
 */
export async function uploadToCloudinary(file) {
  // --- Method 1: Unsigned preset (works for PDFs, all types, no CORS issues) ---
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UNSIGNED_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok && !data.error && (data.secure_url || data.url)) {
      return data.secure_url || data.url;
    }
    console.warn('Unsigned preset upload failed:', data.error?.message, '- trying signed upload...');
  } catch (err) {
    console.warn('Unsigned upload error:', err, '- trying signed upload...');
  }

  // --- Method 2: Signed upload ---
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

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok && !data.error && (data.secure_url || data.url)) {
      return data.secure_url || data.url;
    }
    console.warn('Signed upload failed:', data.error?.message, '- using base64 fallback');
  } catch (err) {
    console.warn('Signed upload error:', err, '- using base64 fallback');
  }

  // --- Method 3: Base64 Data URL fallback (always works, stored in MongoDB) ---
  return fileToBase64(file);
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
