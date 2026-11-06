/**
 * Previews for files picked in the browser, before they are uploaded.
 *
 *   image  -> an object URL of the file itself
 *   pdf    -> the first page rendered to a PNG, plus the page count
 *   text   -> the opening lines
 *
 * pdf.js is ~1MB, so it is imported only when the first PDF needs a preview;
 * nobody who never opens "Generate with AI" downloads it.
 *
 * Every URL handed out here is an object URL the caller must release with
 * releasePreview() once the tile is gone.
 */

const THUMB_WIDTH = 360; // px; tiles are ~180px wide, so this stays sharp on 2x screens

let pdfjsPromise = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export function fileKind(file) {
  const type = file.type || "";
  const name = (file.name || "").toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (type.startsWith("text/") || /\.(txt|md|csv|json)$/.test(name)) return "text";
  return "other";
}

async function pdfPreview(file) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: THUMB_WIDTH / base.width });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    // A PDF page has no background of its own; without this a transparent
    // page shows the tile colour through it.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return { kind: "pdf", url: blob ? URL.createObjectURL(blob) : null, pages: doc.numPages };
  } finally {
    doc.destroy();
  }
}

/** Resolves to {kind, url?, pages?, text?}. Never rejects: a failed preview falls back to an icon. */
export async function makePreview(file) {
  const kind = fileKind(file);
  try {
    if (kind === "image") return { kind, url: URL.createObjectURL(file) };
    if (kind === "pdf") return await pdfPreview(file);
    if (kind === "text") {
      const text = await file.slice(0, 1500).text();
      return { kind, text: text.trim() };
    }
  } catch (error) {
    console.warn("[preview] could not preview", file.name, error);
  }
  return { kind, failed: true };
}

export function releasePreview(preview) {
  if (preview?.url) URL.revokeObjectURL(preview.url);
}
