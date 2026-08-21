import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Plus, Search, Pencil, Trash2, Flag, FlagOff, ImageIcon, X, Play,
} from "lucide-react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "review", label: "Needs review" },
  { id: "new", label: "Not studied" },
];

/**
 * Everything in one deck, in one place: read, search, add, edit, delete.
 *
 * The study screen can only edit the card in front of you, which is no use for
 * "did I already add this?" or "fix that typo on the third card". This is the
 * list view that answers those.
 */
function ManageCards() {
  const { collectionName } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [editing, setEditing] = useState(null); // a card, or {} for a new one
  const [form, setForm] = useState({ term: "", definition: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropImage, setDropImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `/api/cards?email=${encodeURIComponent(user.email)}&collection=${encodeURIComponent(collectionName)}`
      );
      const data = await res.json();
      setCards(Array.isArray(data.cards) ? data.cards : []);
    } catch {
      toast({ title: "Couldn't load the cards", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, collectionName]);

  const counts = useMemo(() => ({
    all: cards.length,
    review: cards.filter((c) => c.needs_review).length,
    new: cards.filter((c) => c.seen === 0).length,
  }), [cards]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards
      .filter((c) => filter === "all"
        || (filter === "review" && c.needs_review)
        || (filter === "new" && c.seen === 0))
      .filter((c) => !q
        || c.term.toLowerCase().includes(q)
        || (c.definition || "").toLowerCase().includes(q));
  }, [cards, filter, query]);

  const openEditor = (card) => {
    setEditing(card || {});
    setForm({ term: card?.term || "", definition: card?.definition || "" });
    setImageFile(null);
    setImagePreview(null);
    setDropImage(false);
  };

  const closeEditor = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const pickImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Picture too large", description: "The limit is 5MB.", variant: "destructive" });
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setDropImage(false);
  };

  const save = async () => {
    const term = form.term.trim();
    const definition = form.definition.trim();
    const keepsImage = !dropImage && (imageFile || editing.image);
    if (!term || (!definition && !keepsImage)) {
      toast({
        title: "Missing information",
        description: "A card needs a term, and either a definition or a picture.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Upload first: a failed upload must not save a card without its picture.
      let image = dropImage ? "" : editing.image || "";
      if (imageFile) {
        const body = new FormData();
        body.append("file", imageFile);
        body.append("token", user.email);
        const up = await (await fetch("/api/images", { method: "POST", body })).json();
        if (up.status !== 200) throw new Error(up.error || "Couldn't upload the picture");
        image = up.image_id;
      }

      const isNew = !editing.term;
      const url = isNew ? "/api/sendwords" : "/api/editword";
      const payload = isNew
        ? { token: user.email, word: term, ans: definition, image, collection: collectionName }
        : { token: user.email, oldword: editing.term, word: term, ans: definition, image, collection: collectionName };

      const data = await (await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })).json();
      if (data.status !== 200) throw new Error(data.error || "Save failed");

      toast({ title: isNew ? "Card added" : "Card updated", description: `"${term}"` });
      closeEditor();
      await load();
    } catch (e) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const card = deleting;
    setDeleting(null);
    try {
      const data = await (await fetch(`/api/delword/${encodeURIComponent(card.term)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email, collection: collectionName }),
      })).json();
      if (data.status !== 200) throw new Error(data.error || "Delete failed");
      toast({ title: "Card deleted", description: `"${card.term}"` });
      await load();
    } catch (e) {
      toast({ title: "Couldn't delete", description: e.message, variant: "destructive" });
    }
  };

  const toggleFlag = async (card) => {
    try {
      await fetch("/api/editword", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          token: user.email, oldword: card.term, word: card.term,
          ans: card.definition, collection: collectionName,
          needs_review: !card.needs_review,
        }),
      });
      await load();
    } catch {
      toast({ title: "Couldn't update the card", variant: "destructive" });
    }
  };

  const imageUrl = (id) =>
    `/api/images/${encodeURIComponent(id)}?email=${encodeURIComponent(user?.email || "")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-w-0">
        <Button variant="ghost" onClick={() => navigate("/collections")} className="mb-4 self-start">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {collectionName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {counts.all} card{counts.all === 1 ? "" : "s"}
              {counts.review > 0 && ` · ${counts.review} to review`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={`/flashcards?collection=${encodeURIComponent(collectionName)}`}>
                <Play className="h-4 w-4 mr-2" />
                Study
              </Link>
            </Button>
            <Button onClick={() => openEditor(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms and definitions"
              className="pl-9"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={filter === f.id ? "default" : "outline"}
                onClick={() => setFilter(f.id)}
              >
                {f.label} {counts[f.id]}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 rounded-lg border bg-card/50">
            <p className="font-medium mb-1">
              {cards.length === 0 ? "This deck has no cards yet" : "Nothing matches"}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              {cards.length === 0
                ? "A card has a term on the front and its definition on the back."
                : "Try a different search or filter."}
            </p>
            {cards.length === 0 && (
              <Button onClick={() => openEditor(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add the first card
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((card) => (
              <li
                key={card.term}
                className="group flex items-start gap-3 rounded-lg border bg-card p-3 sm:p-4 transition-colors hover:border-primary/40"
              >
                {card.image && (
                  <img
                    src={imageUrl(card.image)}
                    alt=""
                    className="h-12 w-12 rounded object-cover shrink-0"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="m-0 font-semibold break-words">{card.term}</p>
                    {card.needs_review && (
                      <Badge className="bg-accent text-accent-foreground">Review</Badge>
                    )}
                    {card.seen === 0 && <Badge variant="outline">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground break-words mt-0.5">
                    {card.definition || <span className="italic">Picture only</span>}
                  </p>
                  {card.seen > 0 && (
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Seen {card.seen}× · {Math.round((card.correct / Math.max(card.correct + card.incorrect, 1)) * 100)}% correct
                    </p>
                  )}
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => toggleFlag(card)}
                    title={card.needs_review ? "Clear review flag" : "Flag for review"}
                  >
                    {card.needs_review ? <FlagOff className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEditor(card)} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => setDeleting(card)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && closeEditor()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.term ? "Edit card" : "New card"}</DialogTitle>
            <DialogDescription>In {collectionName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="term">Front — what you'll be asked</Label>
              <Input
                id="term" value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                placeholder="e.g. ephemeral" maxLength={200}
              />
            </div>
            {/* The picture is part of the answer, not decoration attached to
                the card: a card can be answered in words, in a picture, or in
                both, so the two live in one group rather than in sections that
                imply the picture is something else. */}
            <div className="space-y-2">
              <Label htmlFor="definition">Back — the answer</Label>
              <Textarea
                id="definition" value={form.definition}
                onChange={(e) => setForm({ ...form, definition: e.target.value })}
                placeholder="e.g. lasting for a very short time"
                className="min-h-[110px]"
              />

              {(imagePreview || (editing?.image && !dropImage)) ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2.5">
                  <img
                    src={imagePreview || imageUrl(editing.image)}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md border bg-background object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Shown with this answer</p>
                    <p className="text-xs text-muted-foreground">
                      The answer text is optional while a picture is attached.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" asChild>
                      <label className="cursor-pointer">
                        Replace
                        <input
                          type="file" accept="image/*" className="sr-only"
                          onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }}
                        />
                      </label>
                    </Button>
                    <Button
                      type="button" size="sm" variant="ghost"
                      aria-label="Remove the picture"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                        setImageFile(null); setImagePreview(null); setDropImage(true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" asChild>
                  <label className="cursor-pointer text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Answer with a picture instead
                    <input
                      type="file" accept="image/*" className="sr-only"
                      onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }}
                    />
                  </label>
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing?.term ? "Save changes" : "Add card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.term}&rdquo; will be removed from {collectionName}. Its
              review history goes with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ManageCards;
