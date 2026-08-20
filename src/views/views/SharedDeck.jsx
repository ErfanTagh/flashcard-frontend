import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Search, Pencil, Users, X, Info } from "lucide-react";

/**
 * A deck someone else owns, opened through a link that allows editing.
 *
 * Deliberately not the same page as managing your own deck: what you can do
 * here is narrower. Cards can be added and corrected, and every change lands
 * in the owner's deck so the whole group sees it -- but nothing here deletes,
 * because a link travels further than the group it was meant for and this app
 * has no undo.
 */
function SharedDeck() {
  const { shareId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [share, setShare] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [editing, setEditing] = useState(null); // a card, or {} for a new one
  const [form, setForm] = useState({ term: "", definition: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const data = await (await fetch(`/api/shares/${encodeURIComponent(shareId)}${query}`)).json();
      if (data.status !== 200) setError(data.error || "This link is no longer available");
      else setShare(data);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId, user?.email]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cards = share?.cards || [];
    if (!q) return cards;
    return cards.filter((c) =>
      c.term.toLowerCase().includes(q) || (c.definition || "").toLowerCase().includes(q));
  }, [share, query]);

  const save = async () => {
    const term = form.term.trim();
    const definition = form.definition.trim();
    if (!term || !definition) {
      toast({ title: "A term and a definition are both needed", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const isNew = !editing.term;
      const url = isNew
        ? `/api/shares/${encodeURIComponent(shareId)}/cards`
        : `/api/shares/${encodeURIComponent(shareId)}/cards/edit`;
      const payload = isNew
        ? { token: user.email, word: term, ans: definition }
        : { token: user.email, oldword: editing.term, word: term, ans: definition };

      const data = await (await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })).json();
      if (data.status !== 200) throw new Error(data.error || "Save failed");

      toast({
        title: isNew ? "Card added for everyone" : "Card updated for everyone",
        description: `"${term}"`,
      });
      setEditing(null);
      await load();
    } catch (e) {
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error || !share?.allow_edit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full text-center rounded-lg border bg-card p-8">
          <Info className="h-9 w-9 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-lg font-semibold mb-2">
            {error || "This deck isn't open for edits"}
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            {error
              ? "The owner may have stopped sharing it."
              : "The owner shares it as a copy. You can still add it to your own collections."}
          </p>
          <Button asChild variant="outline">
            <Link to={`/import/${shareId}`}>Back to the deck</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full text-center rounded-lg border bg-card p-8">
          <Users className="h-9 w-9 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-lg font-semibold mb-2">Log in to help with this deck</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Changes you make are shared with everyone who has the link.
          </p>
          <Button onClick={() => loginWithRedirect({ appState: { returnTo: `/shared/${shareId}` } })}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-w-0">
        <Button variant="ghost" onClick={() => navigate(`/import/${shareId}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {share.collection}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {share.card_count} card{share.card_count === 1 ? "" : "s"} · shared by{" "}
              {share.owner_name || "someone"}
            </p>
          </div>
          <Button onClick={() => { setEditing({}); setForm({ term: "", definition: "" }); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-lg border bg-card/60 p-3 mb-5 text-xs text-muted-foreground">
          <Users className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            You&rsquo;re editing the shared deck — everyone with the link sees your
            changes. Only {share.owner_name || "the owner"} can delete cards.
          </p>
        </div>

        <div className="relative mb-4">
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

        {visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">Nothing matches.</p>
        ) : (
          <ul className="space-y-2">
            {visible.map((card) => (
              <li
                key={card.term}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 sm:p-4 hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold break-words">{card.term}</p>
                  <p className="text-sm text-muted-foreground break-words mt-0.5">
                    {card.definition || <span className="italic">Picture only</span>}
                  </p>
                </div>
                <Button
                  size="sm" variant="ghost" title="Edit"
                  onClick={() => {
                    setEditing(card);
                    setForm({ term: card.term, definition: card.definition || "" });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.term ? "Edit card" : "New card"}</DialogTitle>
            <DialogDescription>
              This changes the shared deck for everyone with the link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-term">Front — what you&rsquo;ll be asked</Label>
              <Input
                id="s-term" value={form.term} maxLength={200}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-def">Back — the answer</Label>
              <Textarea
                id="s-def" value={form.definition} className="min-h-[110px]"
                onChange={(e) => setForm({ ...form, definition: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing?.term ? "Save for everyone" : "Add for everyone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SharedDeck;
