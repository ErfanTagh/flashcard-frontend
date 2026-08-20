/**
 * Diagnostic trail for the share-import flow.
 *
 * The flow crosses several full page loads (Auth0, sometimes an
 * email-verification detour), so plain console output disappears exactly when
 * it is needed. Every line is therefore also kept in localStorage, capped at
 * the last 50, surviving reloads. In any console, at any point afterwards:
 *
 *     __shareDebug()      -- prints the trail
 *     __shareDebug(true)  -- prints it and clears it
 */
const KEY = "share_debug_log";

export function shareLog(...parts) {
  const line = parts
    .map((p) => (typeof p === "string" ? p : JSON.stringify(p)))
    .join(" ");
  console.info("[share]", line);
  try {
    const log = JSON.parse(localStorage.getItem(KEY) || "[]");
    log.push(new Date().toISOString().slice(11, 23) + " " + line);
    localStorage.setItem(KEY, JSON.stringify(log.slice(-50)));
  } catch {
    // Logging must never break the app.
  }
}

if (typeof window !== "undefined") {
  window.__shareDebug = (clear) => {
    let log = [];
    try { log = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { /* ignore */ }
    console.log(log.length ? log.join("\n") : "(no share log entries)");
    if (clear) localStorage.removeItem(KEY);
    return `${log.length} entries${clear ? ", cleared" : ""}`;
  };
}
