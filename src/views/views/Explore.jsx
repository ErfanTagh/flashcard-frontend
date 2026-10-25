import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, BookOpen, Plus, Check, Search, Library, Play } from "lucide-react";
import { apiFetch } from "@/lib/api";

/**
 * Decks anybody has published, for anybody to add.
 *
 * A share link only reaches the people it is sent to. This is the same
 * machinery pointed the other way: a published deck is an ordinary share that
 * agreed to be listed, so adding one from here behaves exactly like opening
 * its link -- live content, private progress, and the owner still in charge.
 */
function Explore() {
  const { user, isAuthenticated } = useAuth();
  const { fetchCollections } = useCollections();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const url = user?.email
        ? `/api/public/decks?email=${encodeURIComponent(user.email)}`
        : "/api/public/decks";
      const data = await (await apiFetch(url)).json();
      setDecks(Array.isArray(data.decks) ? data.decks : []);
    } catch {
      toast({ title: "Couldn't load the library", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.email]);

  const add = async (deck) => {
    if (!isAuthenticated || !user?.email) {
      navigate(`/import/${encodeURIComponent(deck.share_id)}`);
      return;
    }
    setBusy(deck.share_id);
    try {
      const data = await (await apiFetch(`/api/shares/${encodeURIComponent(deck.share_id)}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email }),
      })).json();
      if (data.status !== 200) throw new Error(data.error || "Couldn't add the deck");
      toast({
        title: `"${data.collection}" added`,
        description: "It stays up to date with the owner's copy.",
      });
      setDecks((current) => current.map((d) =>
        d.share_id === deck.share_id ? { ...d, following: true } : d));
      await fetchCollections();
    } catch (e) {
      toast({ title: "Couldn't add it", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? decks.filter((d) =>
        d.collection.toLowerCase().includes(needle) ||
        (d.owner_name || "").toLowerCase().includes(needle))
    : decks;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 px-4">
        <Button variant="ghost" onClick={() => navigate("/collections")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>

        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Explore
          </h1>
          <p className="mt-1 text-muted-foreground">
            Decks other people have published. Adding one keeps it up to date
            with the owner's copy, and your progress stays yours.
          </p>
        </div>

        {decks.length > 0 && (
          <div className="relative mb-5 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by deck or person"
              className="pl-9"
            />
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : decks.length === 0 ? (
          <Card className="p-10 text-center">
            <Library className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Nothing published yet</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Publish one of your own decks and it shows up here for everyone.
            </p>
            <Button asChild>
              <Link to="/collections">Go to my collections</Link>
            </Button>
          </Card>
        ) : visible.length === 0 ? (
          <p className="text-muted-foreground">Nothing matches “{query}”.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((deck) => (
              <Card
                key={deck.share_id}
                className="flex flex-wrap items-center gap-3 overflow-hidden p-3 transition-colors hover:border-primary/40 sm:flex-nowrap sm:gap-4 sm:p-4"
              >
                <Link
                  to={`/import/${encodeURIComponent(deck.share_id)}`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent sm:h-16 sm:w-16"
                >
                  {deck.cover ? (
                    <img
                      src={`/api/images/${encodeURIComponent(deck.cover)}?share=${encodeURIComponent(deck.share_id)}`}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-white/80" />
                  )}
                </Link>

                <div className="min-w-0 flex-1 md:min-w-[8rem]">
                  <Link
                    to={`/import/${encodeURIComponent(deck.share_id)}`}
                    className="block truncate font-semibold leading-tight no-underline text-foreground hover:text-primary"
                  >
                    {deck.collection}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {deck.card_count} card{deck.card_count === 1 ? "" : "s"} ·{" "}
                    {deck.mine ? "by you" : `by ${deck.owner_name || "someone"}`}
                  </p>
                </div>

                {/* Three states, and only one of them is an offer: a deck
                    already held is reported, not offered again. */}
                {deck.mine || deck.following ? (
                  <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Check className="h-4 w-4" />
                      {deck.mine ? "Yours" : "Added"}
                    </span>
                    <Button asChild variant="outline" className="max-sm:flex-1">
                      <Link to={`/flashcards?collection=${encodeURIComponent(deck.collection)}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Study
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => add(deck)}
                    disabled={busy === deck.share_id}
                    className="shrink-0 max-sm:w-full sm:min-w-[7rem]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {busy === deck.share_id ? "Adding…" : "Add"}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Explore;
