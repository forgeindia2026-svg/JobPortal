const CLOUD_NAME = 'giteeaam';
const API_KEY = '386458127481753';
const API_SECRET = '_djEzif0GQFAMw846YguG0htcL4';

/**
 * Uploads an image file or base64 string directly to Cloudinary.
 * Returns the permanent HTTPS CDN URL.
 */
export async function uploadToCloudinary(file) {
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

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
  }

  return data.secure_url;
}
