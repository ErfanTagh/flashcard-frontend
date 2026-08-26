/**
 * Preparing and uploading card pictures.
 *
 * A picture chosen on a phone is a camera photograph: several megabytes, a few
 * thousand pixels wide, for something that will be looked at inside a flashcard.
 * Sending that as-is is slow, fills the database with detail nobody sees, and --
 * on any deployment that puts a proxy in front of the app -- runs into a request
 * size limit that is nothing to do with this code.
 *
 * So a picture that is already small enough is uploaded untouched, and only a
 * picture that is too big gets redrawn smaller. That ordering matters: it keeps
 * PNG transparency, GIF animation and original quality in the common case, and
 * re-encodes only when there is no alternative.
 */

/** What we aim to send. Comfortably under a 1MB proxy limit, and far more
 *  detail than a card ever displays. */
const TARGET_BYTES = 900 * 1024;

/** Beyond this we do not even try to decode: a picture this big can exhaust
 *  memory on a phone before it can be shrunk. Set generously, because the
 *  point of this module is that a big picture still works -- a screenshot
 *  saved as PNG is many megabytes and shrinks perfectly well. */
const MAX_SOURCE_BYTES = 40 * 1024 * 1024;

/** Longest edge after shrinking. A card shows a picture a few hundred pixels
 *  wide, so this still leaves room to zoom without looking soft. */
const MAX_EDGE = 1600;

/** Tried in order until the result fits. */
const QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4];

export const IMAGE_SIZE_LIMIT_MB = MAX_SOURCE_BYTES / (1024 * 1024);

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be read as a picture."));
    };
    img.src = url;
  });
}

function toBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function draw(img, scale) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  // JPEG cannot store transparency, and un-filled pixels would encode as
  // black. White is what a transparent picture looked like on the card.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * The file to actually upload for a picture the user chose.
 *
 * Returns the original file when it is already small enough. Throws with a
 * message worth showing when the file is not a picture, is beyond what can be
 * decoded, or cannot be brought under the limit.
 */
export async function prepareImageForUpload(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a picture file.");
  }
  if (file.size <= TARGET_BYTES) {
    return file;
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error(`Pictures up to ${IMAGE_SIZE_LIMIT_MB}MB can be used. This one is larger.`);
  }

  const img = await loadImage(file);
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";

  // Shrink the longest edge first, then trade away quality, then shrink again.
  for (const edge of [MAX_EDGE, MAX_EDGE / 2]) {
    const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = draw(img, scale);
    for (const quality of QUALITY_STEPS) {
      const blob = await toBlob(canvas, quality);
      if (blob && blob.size <= TARGET_BYTES) {
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
  }

  throw new Error("This picture could not be made small enough. Try a smaller one.");
}

/**
 * Upload a picture and return the id a card refers to it by.
 *
 * A request that is rejected before it reaches the app comes back as the
 * proxy's own HTML error page, so the response is never assumed to be JSON --
 * parsing it as such turned a plain "too large" into an unreadable syntax
 * error in front of the user.
 */
export async function uploadImage(file, token) {
  const body = new FormData();
  body.append("file", file);
  body.append("token", token);

  const res = await fetch("/api/images", { method: "POST", body });

  if (res.status === 413) {
    throw new Error("The server refused the picture for being too large.");
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`The picture could not be uploaded (error ${res.status}).`);
  }

  if (!res.ok || data.status !== 200 || !data.image_id) {
    throw new Error(data.error || "The picture could not be uploaded.");
  }
  return data.image_id;
}
