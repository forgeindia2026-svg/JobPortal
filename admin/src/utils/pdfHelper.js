import { jsPDF } from 'jspdf';
import { getDocumentPages } from './cloudinary';

/**
 * Fetches an image URL and converts it to a base64 Data URL using FileReader.
 * This completely avoids canvas rendering and guarantees 100% fidelity.
 */
async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load page image: HTTP ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Gets natural dimensions of an image to preserve aspect ratio.
 */
function getImageDimensions(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 595, height: img.naturalHeight || 842 });
    img.onerror = () => resolve({ width: 595, height: 842 });
    img.src = base64;
  });
}

/**
 * Compiles document pages or URL into a single multi-page jsPDF instance.
 */
export async function createMultiPagePdf(fileUrl, maxPages = 10) {
  if (!fileUrl) throw new Error('No document URL provided');

  // If already a base64 PDF Data URL, return Blob URL directly
  if (fileUrl.startsWith('data:application/pdf;base64,')) {
    const byteCharacters = atob(fileUrl.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    return {
      blob,
      blobUrl: URL.createObjectURL(blob),
      pageCount: 1,
      isPdfDoc: true
    };
  }

  // Otherwise, compile Cloudinary/image pages into a multi-page PDF
  const pages = getDocumentPages(fileUrl, maxPages);
  const pdf = new jsPDF('p', 'pt', 'a4');
  const a4Width = 595.28;
  const a4Height = 841.89;

  let addedPages = 0;

  for (let i = 0; i < pages.length; i++) {
    try {
      const base64Data = await fetchImageAsBase64(pages[i].url);
      const dims = await getImageDimensions(base64Data);

      if (addedPages > 0) {
        pdf.addPage();
      }

      // Preserve aspect ratio on A4
      const ratio = dims.width / dims.height;
      let renderW = a4Width;
      let renderH = a4Width / ratio;

      if (renderH > a4Height) {
        renderH = a4Height;
        renderW = a4Height * ratio;
      }

      const offsetX = (a4Width - renderW) / 2;
      const offsetY = (a4Height - renderH) / 2;

      pdf.addImage(base64Data, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
      addedPages++;
    } catch (err) {
      // If a higher page doesn't exist (e.g. page 4 on a 3-page document), stop gracefully
      if (addedPages > 0) break;
    }
  }

  if (addedPages === 0) {
    throw new Error('Unable to compile document pages into PDF');
  }

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  return {
    pdf,
    blob,
    blobUrl,
    pageCount: addedPages
  };
}

/**
 * Downloads the offer letter as a single .pdf file.
 */
export async function downloadOfferLetterAsPdf(fileUrl, candidateName = 'Candidate') {
  const safeName = (candidateName || 'Candidate').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `OfferLetter_${safeName}.pdf`;

  // 1. If base64 PDF Data URL
  if (fileUrl && fileUrl.startsWith('data:application/pdf')) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 2. Generate PDF from pages
  const compiled = await createMultiPagePdf(fileUrl);
  if (compiled.pdf) {
    compiled.pdf.save(filename);
  } else if (compiled.blobUrl) {
    const link = document.createElement('a');
    link.href = compiled.blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
