import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles, Upload, FileText, FileImage, X, AlertCircle, ArrowLeft, Trash2, Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { prepareImageForUpload } from "@/lib/image";

/**
 * Build a deck from documents, with Claude.
 *
 * Two steps in one dialog. First the person adds files -- a PDF, photos of
 * their notes, a screenshot, a text file -- writes an optional instruction and
 * picks how many cards. Then the generated cards are shown for review: they can
 * edit any card, drop ones they do not want, name the deck, and only then save.
 *
 * Nothing is stored until they save. Generation returns the cards; saving goes
 * through the ordinary JSON-import endpoint, the one place that validates and
 * writes a deck, so this feature adds a way in without adding a second way to
 * store things.
 */

const MAX_FILES = 10;
// Matches the server. Shown so the limits are visible before an upload fails.
const MAX_TOTAL_MB = 18;

const ACCEPT = ".pdf,.txt,.md,.csv,.json,image/*,application/pdf";

function isImage(file) {
  return (file.type || "").startsWith("image/");
}

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function GenerateDeckDialog({ open, onOpenChange, userEmail, onImported }) {
  const { toast } = useToast();
  const fileInput = useRef(null);

  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Review step.
  const [cards, setCards] = useState(null); // null until generated
  const [deckName, setDeckName] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setFiles([]);
    setPrompt("");
    setCount(20);
    setGenerating(false);
    setError(null);
    setCards(null);
    setDeckName("");
    setSaving(false);
  };

  const addFiles = (chosen) => {
    setError(null);
    const incoming = Array.from(chosen || []);
    setFiles((current) => {
      // De-duplicate by name+size so picking the same file twice does nothing.
      const seen = new Set(current.map((f) => `${f.name}:${f.size}`));
      const merged = [...current];
      for (const f of incoming) {
        const key = `${f.name}:${f.size}`;
        if (!seen.has(key)) { seen.add(key); merged.push(f); }
      }
      return merged.slice(0, MAX_FILES);
    });
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const overSize = totalBytes > MAX_TOTAL_MB * 1024 * 1024;

  const handleGenerate = async () => {
    setError(null);
    if (files.length === 0) {
      setError("Add at least one document or image first.");
      return;
    }
    if (overSize) {
      setError(`Those files add up to more than ${MAX_TOTAL_MB}MB. Remove one, or generate in two passes.`);
      return;
    }

    setGenerating(true);
    try {
      const body = new FormData();
      for (const file of files) {
        // Shrink big photos before upload -- a textbook photo is several MB and
        // reads perfectly well far smaller. PDFs, text and anything that will
        // not decode as an image (e.g. HEIC in this browser) are sent as-is;
        // the server reads those directly.
        let toSend = file;
        if (isImage(file)) {
          try { toSend = await prepareImageForUpload(file); } catch { toSend = file; }
        }
        body.append("files", toSend, toSend.name || file.name);
      }
      body.append("prompt", prompt);
      body.append("count", String(count));

      const res = await apiFetch("/api/generate-cards", { method: "POST", body });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch {
        throw new Error(`The server sent a response this app couldn't read (error ${res.status}).`);
      }
      if (!res.ok || data?.status !== 200) {
        throw new Error(data?.error || `Generation failed (error ${res.status}).`);
      }

      setCards(data.cards || []);
      setDeckName((data.name || "").slice(0, 60));
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const updateCard = (index, field, value) => {
    setCards((current) => current.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const removeCard = (index) => {
    setCards((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const clean = (cards || [])
      .map((c) => ({ term: (c.term || "").trim(), definition: (c.definition || "").trim() }))
      .filter((c) => c.term && c.definition);

    if (clean.length === 0) {
      setError("There are no complete cards to save.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/collections/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: userEmail, deck: { cards: clean }, name: deckName.trim() }),
      });
      const data = await res.json();
      if (data.status !== 200) {
        setError(data.error || "Couldn't save that deck.");
        return;
      }
      toast({
        title: `"${data.collection}" created`,
        description: `${data.imported} card${data.imported === 1 ? "" : "s"} saved.`,
      });
      reset();
      onOpenChange(false);
      onImported?.();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const reviewing = cards !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {reviewing ? "Review your deck" : "Generate a deck from your documents"}
          </DialogTitle>
          <DialogDescription>
            {reviewing
              ? "Edit anything, drop cards you don't want, name the deck, then save. Nothing is saved until you do."
              : "Upload PDFs, photos of your notes, screenshots or text. Claude reads them and writes the cards."}
          </DialogDescription>
        </DialogHeader>

        {/* ---- Step 1: inputs ---- */}
        {!reviewing && (
          <div className="space-y-5">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInput.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInput.current?.click(); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/10"
            >
              <Upload className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-foreground">Drop files here, or click to choose</p>
              <p className="text-xs text-muted-foreground">
                PDF, images (JPEG/PNG/WEBP/GIF) or text · up to {MAX_FILES} files, {MAX_TOTAL_MB}MB total
              </p>
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
                multiple
                className="sr-only"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
            </div>

            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li key={`${file.name}:${file.size}:${i}`} className="flex items-center gap-3 rounded-lg border bg-card p-2.5">
                    {isImage(file)
                      ? <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                      : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{prettySize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                <li className={`text-right text-xs ${overSize ? "text-destructive" : "text-muted-foreground"}`}>
                  {prettySize(totalBytes)} of {MAX_TOTAL_MB}MB
                </li>
              </ul>
            )}

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="gen-prompt">Instructions (optional)</Label>
                <Textarea
                  id="gen-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Focus on definitions and dates. Make the questions in German. Skip the introduction."
                  className="min-h-[72px] resize-none"
                  maxLength={1000}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gen-count">Cards</Label>
                <Input
                  id="gen-count"
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="w-24"
                />
                <p className="text-xs text-muted-foreground">1–50</p>
              </div>
            </div>

            {error && (
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}

        {/* ---- Step 2: review ---- */}
        {reviewing && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gen-deck-name">Deck name</Label>
              <Input
                id="gen-deck-name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Name this deck"
                maxLength={60}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {cards.length} card{cards.length === 1 ? "" : "s"}
              </p>
            </div>

            {cards.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No cards left. Go back and generate again.
              </p>
            ) : (
              <ul className="space-y-3">
                {cards.map((card, i) => (
                  <li key={i} className="flex gap-3 rounded-lg border bg-card p-3">
                    <span className="mt-2 w-5 shrink-0 text-right text-xs text-muted-foreground">{i + 1}</span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input
                        value={card.term}
                        onChange={(e) => updateCard(i, "term", e.target.value)}
                        placeholder="Term"
                        className="font-medium"
                        maxLength={200}
                      />
                      <Textarea
                        value={card.definition}
                        onChange={(e) => updateCard(i, "definition", e.target.value)}
                        placeholder="Definition"
                        className="min-h-[56px] resize-none text-sm"
                        maxLength={2000}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCard(i)}
                      className="mt-1 shrink-0 self-start rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove card ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {!reviewing ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={generating || files.length === 0 || overSize}>
                {generating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reading your documents…</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate {count} cards</>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { setCards(null); setError(null); }}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
              <Button onClick={handleSave} disabled={saving || cards.length === 0}>
                {saving ? "Saving…" : `Save deck`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateDeckDialog;
