const CLOUD_NAME = 'giteeaam';
// Unsigned upload preset - created in Cloudinary dashboard
// Settings: unsigned=true, resource_type=auto, folder=offer_letters
// Supports: pdf, jpg, jpeg, png, webp
const UNSIGNED_PRESET = 'offer_letters_unsigned';

/**
 * Uploads any file (PDF, image) to Cloudinary using unsigned preset.
 * Returns a permanent HTTPS CDN URL.
 * MongoDB stores ONLY this URL — never the file data itself.
 */
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UNSIGNED_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  return data.secure_url || data.url;
}

/**
 * Fallback: converts a File/Blob to a base64 Data URL.
 * Used only if Cloudinary upload fails.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
