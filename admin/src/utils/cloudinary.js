const CLOUD_NAME = 'giteeaam';
const UNSIGNED_PRESET = 'offer_letters_unsigned';

/**
 * Uploads a document (PDF or image) to Cloudinary.
 * For PDFs, returns the delivery URL with .jpg extension so Cloudinary renders
 * all pages cleanly in the browser without 401 ACL blocks.
 * Returns permanent HTTPS CDN URL.
 */
export async function uploadToCloudinary(file) {
  if (!file) throw new Error('No file provided for upload');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UNSIGNED_PRESET);

  // Upload to auto/upload (or image/upload) which accepts both images and PDFs
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    console.error('Cloudinary upload error:', data.error);
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }

  let resultUrl = data.secure_url || data.url;
  if (!resultUrl) {
    throw new Error('Cloudinary response missing URL');
  }

  // Cloudinary blocks direct raw .pdf downloads on standard accounts with 401 ACL.
  // Converting .pdf -> .jpg instructs Cloudinary to render the document pages
  // with full 200 OK access in all browsers and mobile webviews!
  if (resultUrl.includes('/raw/upload/')) {
    resultUrl = resultUrl.replace('/raw/upload/', '/image/upload/');
  }
  if (resultUrl.toLowerCase().endsWith('.pdf')) {
    resultUrl = resultUrl.replace(/\.pdf$/i, '.jpg');
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
