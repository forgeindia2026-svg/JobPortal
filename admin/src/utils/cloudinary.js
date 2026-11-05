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

  const wrapped = new String(resultUrl);
  wrapped.url = resultUrl;
  wrapped.pages = Number(data.pages) || 1;
  wrapped.format = data.format || '';
  return wrapped;
}

/**
 * Returns an array of page objects for a Cloudinary document: [{ page: 1, url: '...' }, ...].
 * If pages count is known, generates pg_1 through pg_N.
 * If unknown, defaults up to 10 pages, and the viewer prunes nonexistent pages on error.
 */
export function getDocumentPages(url, maxPages = 10) {
  if (!url) return [];
  const base = String(url).trim();
  if (!base.includes('res.cloudinary.com') || !base.includes('/image/upload/')) {
    return [{ page: 1, url: base }];
  }
  const cleanBase = base.replace(/\/image\/upload\/(pg_\d+\/)?/, '/image/upload/');
  const count = Math.max(1, Math.min(Number(maxPages) || 10, 20));
  const pages = [];
  for (let p = 1; p <= count; p++) {
    pages.push({
      page: p,
      url: cleanBase.replace('/image/upload/', `/image/upload/pg_${p}/`)
    });
  }
  return pages;
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
