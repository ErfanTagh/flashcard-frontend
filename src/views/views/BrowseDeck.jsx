import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Lock, RotateCcw, Shuffle, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/Components/PublicNav";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { setPendingShare } from "@/lib/pendingShare";

/**
 * Flip through a deck published to Explore -- read-only, no account needed.
 *
 * Front, back, previous, next, shuffle; arrow keys and space work too. That is
 * all: no progress is recorded, nothing can be edited, and the "I know this"
 * buttons are shown disabled so visitors see what an account adds. Adding the
 * deck is what asks them to sign up (signed in, it is a normal follow).
 *
 * The API only sends the cards of a deck that is published (or to members);
 * for anything else this page points back to the share page.
 */
export default function BrowseDeck() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // While the card turns back to the front after moving on, the back face
  // keeps the card being left, so the next answer never flashes past.
  const [leavingCard, setLeavingCard] = useState(null);
  const leaveTimer = useRef(null);
  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch(`/api/shares/${encodeURIComponent(shareId)}`);
        const data = await res.json();
        if (!live) return;
        if (data.status !== 200) {
          setError(res.status === 404 ? "This deck is no longer available." : "Couldn't load this deck right now.");
          return;
        }
        setDeck(data);
        setCards(data.cards || []);
      } catch {
        if (live) setError("Couldn't reach the server.");
      }
    })();
    return () => {
      live = false;
    };
  }, [shareId]);

  const total = cards.length;
  const go = useCallback(
    (step) => {
      if (!total) return;
      clearTimeout(leaveTimer.current);
      if (flipped) {
        setLeavingCard(cards[index]);
        leaveTimer.current = setTimeout(() => setLeavingCard(null), 550);
      }
      setFlipped(false);
      setIndex((i) => (i + step + total) % total);
    },
    [total, flipped, cards, index]
  );

  const flip = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setLeavingCard(null);
    setFlipped((f) => !f);
  }, []);

  const shuffle = () => {
    setCards((current) => [...current].sort(() => Math.random() - 0.5));
    clearTimeout(leaveTimer.current);
    setLeavingCard(null);
    setIndex(0);
    setFlipped(false);
  };

  // Arrow keys to move, space or enter to flip.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, flip]);

  const addDeck = () => {
    // Signed out: sign up, then the deck is added by itself (App.jsx).
    // Signed in: the share page does the adding.
    if (!isAuthenticated) setPendingShare(shareId);
    const back = `/import/${shareId}`;
    navigate(isAuthenticated ? back : `/signup?returnTo=${encodeURIComponent(back)}&reason=add`);
  };

  const card = cards[index];
  const backCard = leavingCard || card;
  const imageSrc = backCard?.image
    ? `/api/images/${encodeURIComponent(backCard.image)}?share=${encodeURIComponent(shareId)}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="container max-w-3xl px-4 py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate("/explore")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Button>

        {error && (
          <Card className="p-8 text-center">
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button asChild variant="outline">
              <Link to="/explore">Browse other decks</Link>
            </Button>
          </Card>
        )}

        {!error && !deck && <p className="text-muted-foreground">Loading…</p>}

        {deck && total === 0 && (
          <Card className="p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              This deck isn't on Explore, so its cards are for members only.
            </p>
            <Button asChild>
              <Link to={`/import/${shareId}`}>See the deck</Link>
            </Button>
          </Card>
        )}

        {deck && total > 0 && (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">{deck.collection}</h1>
                <p className="text-sm text-muted-foreground">
                  {deck.owner_name ? `by ${deck.owner_name} · ` : ""}
                  {total} card{total === 1 ? "" : "s"}
                </p>
              </div>
              {!deck.is_owner && !deck.following_as && (
                <Button onClick={addDeck} className="gap-2">
                  <Users className="h-4 w-4" />
                  Add to my collections
                </Button>
              )}
            </div>

            <div className="perspective-1000 relative">
              <div
                role="button"
                tabIndex={0}
                aria-label={flipped ? "Show the front" : "Show the back"}
                onClick={flip}
                className={`relative h-[22rem] w-full cursor-pointer rounded-lg outline-none transition-transform duration-500 ease-out transform-style-preserve-3d focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4 sm:h-[26rem] ${
                  flipped ? "rotate-y-180" : ""
                }`}
              >
                <Card className="absolute inset-0 h-full w-full border-2 bg-card backface-hidden">
                  <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">{card.term}</h2>
                    <p className="mb-3 text-sm text-muted-foreground">Click to reveal the back</p>
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
                <Card className="absolute inset-0 h-full w-full rotate-y-180 border-2 bg-card backface-hidden">
                  <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                    {imageSrc && (
                      <img src={imageSrc} alt="" className="mb-4 max-h-[45%] max-w-full rounded-lg object-contain" />
                    )}
                    {backCard.definition && (
                      <p className="mb-4 whitespace-pre-line text-lg leading-relaxed text-foreground md:text-xl">{backCard.definition}</p>
                    )}
                    <p className="mb-3 text-sm text-muted-foreground">Click to see the front again</p>
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* What an account adds, shown but switched off. */}
            {!isAuthenticated && (
              <div className="mt-5">
                <div className="flex gap-3" title="Create a free account to track what you know">
                  <Button disabled size="lg" className="flex-1 bg-red-600 text-white">
                    <X className="mr-2 h-5 w-5" />
                    Need Review
                  </Button>
                  <Button disabled size="lg" className="flex-1 bg-green-600 text-white">
                    <Check className="mr-2 h-5 w-5" />
                    I Know This
                  </Button>
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <button type="button" onClick={addDeck} className="font-medium text-primary underline-offset-2 hover:underline">
                    Create a free account
                  </button>
                  to track what you know and study with quizzes.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <Button variant="outline" onClick={() => go(-1)} aria-label="Previous card">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <p className="flex-1 text-center text-sm font-medium text-muted-foreground">
                {index + 1} / {total}
              </p>
              <Button variant="outline" onClick={() => go(1)} aria-label="Next card">
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex justify-center">
              <Button variant="ghost" size="sm" onClick={shuffle} className="gap-2 text-muted-foreground hover:text-white">
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
