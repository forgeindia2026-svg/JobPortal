const CLOUD_NAME = 'giteeaam';
const UNSIGNED_PRESET = 'offer_letters_unsigned';

/**
 * Uploads a file (PDF document or image) to Cloudinary using the unsigned preset.
 * PDFs are routed to /raw/upload, images to /auto/upload.
 * Returns the permanent HTTPS CDN URL.
 */
export async function uploadToCloudinary(file) {
  if (!file) throw new Error('No file provided for upload');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UNSIGNED_PRESET);

  // Determine resource endpoint based on file type / extension
  const isPdf =
    file.type === 'application/pdf' ||
    (typeof file.name === 'string' && file.name.toLowerCase().endsWith('.pdf'));

  const endpoint = isPdf ? 'raw' : 'auto';

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error('Cloudinary upload error:', data.error);
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }

  const resultUrl = data.secure_url || data.url;
  if (!resultUrl) {
    throw new Error('Cloudinary response missing URL');
  }

  return resultUrl;
}

/**
 * Fallback: converts a File/Blob to a base64 Data URL.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
