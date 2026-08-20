import { useState } from "react";
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
import { Copy, Upload, Sparkles, FileJson, AlertCircle } from "lucide-react";

/** The shape the API accepts, shown to the user verbatim. */
const FORMAT_EXAMPLE = `{
  "name": "Spanish Basics",
  "cards": [
    { "term": "hola", "definition": "hello" },
    { "term": "gracias", "definition": "thank you" }
  ]
}`;

/**
 * A prompt that reliably produces the format above.
 *
 * Spelled out rather than left to the model's judgement: the failure modes in
 * practice are code fences around the JSON, commentary before it, and
 * definitions that restate the term.
 */
const AI_PROMPT = `Make a flashcard deck about TOPIC (for example: Spanish verbs).

Reply with JSON only — no code fences, no explanation — in exactly this shape:

{
  "name": "Short deck name",
  "cards": [
    { "term": "front of the card", "definition": "back of the card" }
  ]
}

Rules:
- 20 cards, unless I ask for a different number.
- "term" is what I will be shown and have to recall: a word, a phrase or a question. Under 80 characters.
- "definition" is the answer. One or two sentences, under 300 characters, and do not restate the term inside it.
- Every term must be unique.
- Plain text only: no markdown, no HTML, no bullet points inside a field.
- Write in the same language as this message unless I say otherwise.`;

function ImportDeckDialog({ open, onOpenChange, userEmail, onImported }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setName("");
    setText("");
    setError(null);
  };

  const copy = async (value, what) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${what} copied` });
    } catch {
      toast({ title: "Select it and copy manually", variant: "destructive" });
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const contents = await file.text();
    setText(contents);
    setError(null);
    // A filename is a reasonable default deck name.
    if (!name) setName(file.name.replace(/\.json$/i, ""));
  };

  const handleImport = async () => {
    setError(null);

    let parsed;
    try {
      // Tolerate the code fences models add despite being asked not to.
      const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      setError("That isn't valid JSON. Check for a missing comma or bracket.");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/collections/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: userEmail, deck: parsed, name: name.trim() }),
      });
      const data = await res.json();
      if (data.status !== 200) {
        setError(data.error || "Couldn't import that deck.");
        return;
      }

      toast({
        title: `"${data.collection}" created`,
        description: `${data.imported} card${data.imported === 1 ? "" : "s"} imported.${
          data.warnings?.length ? ` ${data.warnings[0]}` : ""
        }`,
      });
      reset();
      onOpenChange(false);
      onImported?.();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setImporting(false);
    }
  };

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
            <FileJson className="h-5 w-5" />
            Import a deck from JSON
          </DialogTitle>
          <DialogDescription>
            Paste JSON or upload a file. To build a deck with an AI, copy the
            prompt below, swap in your subject, and paste back what it replies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Prompt for an AI
              </p>
              <Button size="sm" variant="outline" onClick={() => copy(AI_PROMPT, "Prompt")}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Replace <span className="font-mono">TOPIC</span> with the subject you
              want cards about — &ldquo;Spanish verbs&rdquo;, &ldquo;the French
              Revolution&rdquo;, &ldquo;React hooks&rdquo;. The AI names the deck
              itself; you can change that below.
            </p>

            {/* Shown, not just copyable: a hidden prompt gives no way to tell
                what TOPIC is, or to adjust the card count before sending it. */}
            <pre className="max-h-44 overflow-y-auto rounded-md border bg-background/70 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
              {AI_PROMPT}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <Label className="text-sm font-semibold">Expected format</Label>
              <Button size="sm" variant="ghost" onClick={() => copy(FORMAT_EXAMPLE, "Example")}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </Button>
            </div>
            <pre className="rounded-lg border bg-muted/40 p-3 text-xs overflow-x-auto">
              {FORMAT_EXAMPLE}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-mono">front</span>/<span className="font-mono">back</span> and{" "}
              <span className="font-mono">question</span>/<span className="font-mono">answer</span>{" "}
              work too, and a bare list of cards is accepted. Up to 500 cards.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deck-name">Deck name</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Taken from the JSON if you leave this blank"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="deck-json">JSON</Label>
              <Button size="sm" variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload a file
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="sr-only"
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </Button>
            </div>
            <Textarea
              id="deck-json"
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              placeholder='{ "name": "…", "cards": [ … ] }'
              className="min-h-[160px] font-mono text-xs"
            />
          </div>

          {error && (
            <p className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!text.trim() || importing}>
            {importing ? "Importing…" : "Create deck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImportDeckDialog;
