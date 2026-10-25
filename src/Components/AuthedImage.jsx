import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

/**
 * An <img> for a picture that sits behind the API's authentication.
 *
 * A browser sends no Authorization header for an `<img src>`, so a picture
 * that needs a token cannot simply be pointed at. The bytes are fetched here,
 * with the token, and the tag is handed a blob URL instead.
 *
 * The pictures in a shared deck are a different case: they are authorised by
 * the share id in the URL and are readable by a signed-out visitor, so those
 * stay plain `<img src>` and keep the browser's own caching.
 */

// Fetching the same picture again on every mount would mean a request per card
// flip and per return to the deck list, so blob URLs are kept and reused. The
// bytes behind an id never change, which is what makes this safe.
const CACHE_LIMIT = 100;
const cache = new Map();

function remember(path, objectUrl) {
  cache.set(path, objectUrl);
  while (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    const stale = cache.get(oldest);
    cache.delete(oldest);
    // Nothing is rendering it any more; let the browser release the bytes.
    URL.revokeObjectURL(stale);
  }
}

/** The blob URL for an API picture path, or null while it loads or if it fails. */
export function useAuthedImage(path) {
  const [src, setSrc] = useState(() => (path ? cache.get(path) || null : null));

  useEffect(() => {
    if (!path) {
      setSrc(null);
      return;
    }

    const cached = cache.get(path);
    if (cached) {
      setSrc(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch(path);
        if (!response.ok) {
          if (!cancelled) setSrc(null);
          return;
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        remember(path, objectUrl);
        setSrc(objectUrl);
      } catch {
        // A missing picture is not worth an error in front of the reader; the
        // card still has its words.
        if (!cancelled) setSrc(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return src;
}

/** The path for a card picture or deck cover owned by the signed-in user. */
export function ownedImagePath(imageId) {
  return imageId ? `/api/images/${encodeURIComponent(imageId)}` : null;
}

export default function AuthedImage({ imageId, path, alt = "", ...props }) {
  const src = useAuthedImage(path || ownedImagePath(imageId));
  if (!src) return null;
  return <img src={src} alt={alt} {...props} />;
}
