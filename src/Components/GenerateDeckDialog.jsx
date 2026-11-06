import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles, Upload, FileText, FileImage, File as FileIcon, X, AlertCircle, ArrowLeft, Trash2, Loader2, Plus,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { prepareImageForUpload } from "@/lib/image";
import { fileKind, makePreview, releasePreview } from "@/lib/filePreview";

/**
 * Build a deck from documents, with Claude.
 *
 * A full-screen dialog in two steps. First the person adds files -- a PDF,
 * photos of their notes, a screenshot, a text file -- and writes an optional
 * instruction. Each file shows as a tile with a preview: the photo itself, the
 * first page of a PDF, the opening lines of a text file. Then the generated
 * cards are shown for review: they can edit any card, drop ones they do not
 * want, name the deck, and only then save.
 *
 * Nothing is stored until they save. Generation returns the cards; saving goes
 * through the ordinary JSON-import endpoint, the one place that validates and
 * writes a deck, so this feature adds a way in without adding a second way to
 * store things.
 */

// Match the server (ai_generate.py). Shown so the limits are visible before an
// upload fails.
const MAX_FILES = 10;
const MAX_TOTAL_MB = 18;

const ACCEPT = ".pdf,.txt,.md,.csv,.json,image/*,application/pdf";

let nextId = 1;

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const KIND_ICON = { image: FileImage, pdf: FileText, text: FileText, other: FileIcon };
const KIND_LABEL = { image: "Image", pdf: "PDF", text: "Text", other: "File" };

/** One picked file: a preview filling the tile, its name and size underneath. */
function FileTile({ entry, onRemove, disabled }) {
  const { file, preview } = entry;
  const kind = fileKind(file);
  const Icon = KIND_ICON[kind];
  const [broken, setBroken] = useState(false); // e.g. HEIC, which most browsers can't draw

  let body;
  if (!preview) {
    body = (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  } else if (preview.url && !broken) {
    body = (
      <img
        src={preview.url}
        alt=""
        onError={() => setBroken(true)}
        className={`h-full w-full ${kind === "pdf" ? "object-contain object-top bg-white" : "object-cover"}`}
      />
    );
  } else if (preview.text) {
    body = (
      <p className="h-full overflow-hidden whitespace-pre-wrap break-words bg-white p-3 text-left font-mono text-[10px] leading-snug text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
        {preview.text}
      </p>
    );
  } else {
    body = (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Icon className="h-10 w-10" />
        <span className="text-xs font-medium uppercase tracking-wide">{KIND_LABEL[kind]}</span>
      </div>
    );
  }

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden border-b bg-muted/60">
        {body}
        {kind === "pdf" && preview?.pages > 0 && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {preview.pages} page{preview.pages === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <div className="min-w-0 px-2.5 py-2">
        <p className="m-0 truncate text-xs font-medium text-foreground" title={file.name}>{file.name}</p>
        <p className="m-0 mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Icon className="h-3 w-3 shrink-0" />
          {KIND_LABEL[kind]} · {prettySize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white shadow transition-colors hover:bg-black/80 disabled:hidden"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function GenerateDeckDialog({ open, onOpenChange, userEmail, onImported }) {
  const { toast } = useToast();
  const fileInput = useRef(null);

  // [{id, file, preview}] -- preview is null until it has been made.
  const [entries, setEntries] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Review step.
  const [cards, setCards] = useState(null); // null until generated
  const [deckName, setDeckName] = useState("");
  const [saving, setSaving] = useState(false);

  // Object URLs outlive the component unless released; keep a handle on the
  // current set so unmounting can let them go.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  useEffect(() => () => entriesRef.current.forEach((e) => releasePreview(e.preview)), []);

  const files = entries.map((e) => e.file);

  const reset = () => {
    entries.forEach((e) => releasePreview(e.preview));
    setEntries([]);
    setPrompt("");
    setGenerating(false);
    setError(null);
    setDragging(false);
    setCards(null);
    setDeckName("");
    setSaving(false);
  };

  const addFiles = (chosen) => {
    setError(null);
    const incoming = Array.from(chosen || []);
    const seen = new Set(entries.map((e) => `${e.file.name}:${e.file.size}`));
    const fresh = [];
    for (const file of incoming) {
      const key = `${file.name}:${file.size}`;
      if (seen.has(key)) continue; // picking the same file twice does nothing
      seen.add(key);
      fresh.push({ id: nextId++, file, preview: null });
    }

    const room = MAX_FILES - entries.length;
    if (fresh.length > room) {
      setError(`You can add up to ${MAX_FILES} files at a time; ${fresh.length - Math.max(room, 0)} were left out.`);
    }
    const accepted = fresh.slice(0, Math.max(room, 0));
    if (accepted.length === 0) return;
    setEntries((current) => [...current, ...accepted]);

    // Previews arrive one by one; each tile shows a spinner until its own is ready.
    for (const entry of accepted) {
      makePreview(entry.file).then((preview) => {
        setEntries((current) => {
          if (!current.some((e) => e.id === entry.id)) {
            releasePreview(preview); // removed while its preview was being made
            return current;
          }
          return current.map((e) => (e.id === entry.id ? { ...e, preview } : e));
        });
      });
    }
  };

  const removeFile = (id) => {
    setEntries((current) => {
      const gone = current.find((e) => e.id === id);
      if (gone) releasePreview(gone.preview);
      return current.filter((e) => e.id !== id);
    });
  };

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  const overSize = totalBytes > MAX_TOTAL_MB * 1024 * 1024;
  const usedPercent = Math.min(100, (totalBytes / (MAX_TOTAL_MB * 1024 * 1024)) * 100);

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
        if (fileKind(file) === "image") {
          try { toSend = await prepareImageForUpload(file); } catch { toSend = file; }
        }
        body.append("files", toSend, toSend.name || file.name);
      }
      body.append("prompt", prompt);

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
  const pickFiles = () => fileInput.current?.click();

  const dropHandlers = {
    onDragOver: (e) => { e.preventDefault(); if (!generating) setDragging(true); },
    onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); },
    onDrop: (e) => { e.preventDefault(); setDragging(false); if (!generating) addFiles(e.dataTransfer.files); },
  };

  const errorLine = error && (
    <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {error}
    </p>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      {/* Full screen: the default dialog is a centred box, translated by -50%. */}
      <DialogContent className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:rounded-none data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0">
        {/* ---- Header ---- (a div: the site styles bare <header>/<footer> elements) */}
        <div className="shrink-0 border-b bg-background px-4 py-4 pr-14 sm:px-8">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            {reviewing ? "Review your deck" : "Generate a deck with AI"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {reviewing
              ? "Edit anything, drop cards you don't want, name the deck, then save. Nothing is saved until you do."
              : "Add PDFs, photos of your notes, screenshots or text. Claude reads them and writes the cards."}
          </DialogDescription>
        </div>

        {/* ---- Scrolling body ---- */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />

            {/* Step 1: files and instructions */}
            {!reviewing && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
                <section {...dropHandlers} className="min-w-0">
                  {entries.length === 0 ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={pickFiles}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pickFiles(); }}
                      className={`flex min-h-[45vh] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                        dragging ? "border-primary bg-primary/10" : "border-primary/30 bg-background hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-7 w-7 text-primary" />
                      </span>
                      <p className="text-base font-semibold text-foreground">Drop files here, or click to choose</p>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        PDF, images (JPEG, PNG, WEBP, GIF) or text files. Up to {MAX_FILES} files, {MAX_TOTAL_MB}MB in total.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {entries.length} of {MAX_FILES} file{MAX_FILES === 1 ? "" : "s"}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${overSize ? "bg-destructive" : "bg-primary"}`}
                                style={{ width: `${usedPercent}%` }}
                              />
                            </div>
                            <span className={`text-xs ${overSize ? "text-destructive" : "text-muted-foreground"}`}>
                              {prettySize(totalBytes)} of {MAX_TOTAL_MB}MB
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { entries.forEach((e) => releasePreview(e.preview)); setEntries([]); setError(null); }} disabled={generating}>
                            Clear all
                          </Button>
                          <Button variant="outline" size="sm" onClick={pickFiles} disabled={generating || entries.length >= MAX_FILES}>
                            <Plus className="mr-1.5 h-4 w-4" />Add files
                          </Button>
                        </div>
                      </div>

                      <ul
                        className={`m-0 grid list-none grid-cols-2 gap-3 rounded-2xl p-0 transition-colors sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 ${
                          dragging ? "outline-dashed outline-2 outline-offset-8 outline-primary" : ""
                        }`}
                      >
                        {entries.map((entry) => (
                          <FileTile key={entry.id} entry={entry} disabled={generating} onRemove={() => removeFile(entry.id)} />
                        ))}
                        {entries.length < MAX_FILES && !generating && (
                          <li>
                            <button
                              type="button"
                              onClick={pickFiles}
                              className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-background text-sm font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/5"
                            >
                              <Plus className="h-6 w-6" />
                              Add more
                            </button>
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </section>

                <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
                  <div className="space-y-2 rounded-2xl border bg-background p-4">
                    <Label htmlFor="gen-prompt">Instructions (optional)</Label>
                    <Textarea
                      id="gen-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Focus on definitions and dates. Make the questions in German. Skip the introduction."
                      className="min-h-[120px] resize-y"
                      maxLength={1000}
                      disabled={generating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Claude decides how many cards to make from your material.
                    </p>
                  </div>
                  {errorLine}
                </aside>
              </div>
            )}

            {/* Step 2: review */}
            {reviewing && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="w-full max-w-md space-y-2">
                    <Label htmlFor="gen-deck-name">Deck name</Label>
                    <Input
                      id="gen-deck-name"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      placeholder="Name this deck"
                      maxLength={60}
                      className="bg-background"
                    />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {cards.length} card{cards.length === 1 ? "" : "s"}
                  </p>
                </div>

                {cards.length === 0 ? (
                  <p className="rounded-2xl border border-dashed bg-background p-10 text-center text-sm text-muted-foreground">
                    No cards left. Go back and generate again.
                  </p>
                ) : (
                  <ul className="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
                    {cards.map((card, i) => (
                      <li key={i} className="flex gap-3 rounded-xl border bg-background p-3">
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
                            className="min-h-[64px] resize-y text-sm"
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
                {errorLine}
              </div>
            )}
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-background px-4 py-3 sm:px-8">
          {!reviewing ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={generating || files.length === 0 || overSize}>
                {generating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reading your documents…</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate deck</>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { setCards(null); setError(null); }}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
              <Button onClick={handleSave} disabled={saving || cards.length === 0}>
                {saving ? "Saving…" : "Save deck"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateDeckDialog;
