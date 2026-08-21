import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Check, X, MoreHorizontal, Edit, Trash2, FolderOpen, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { attributionLine } from "@/lib/attribution";
import { Input } from "@/components/ui/input";

function Flashcard() {
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  // Whether this deck has more than one author. A deck one person built is
  // the common case, and there attribution would be noise on every card.
  const [multiAuthor, setMultiAuthor] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInputs, setEditInputs] = useState({ term: "", definition: "" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { collections, selectedCollection, setSelectedCollection, loading: collectionsLoading } = useCollections();
  const [searchParams] = useSearchParams();

  // Must match the duration-500 on the flip container below.
  const FLIP_MS = 500;
  const flipTimer = useRef(null);

  useEffect(() => () => clearTimeout(flipTimer.current), []);

  const collection = selectedCollection || "Default";
  const totalCards = cards.length;
  const card = cards[currentIndex] || null;
  const isInReview = Boolean(card?.needs_review);
  // Only ever shown on the definition side: the term side is a recall test,
  // and nothing that is not the question belongs on it.
  const attribution = attributionLine(card, multiAuthor);

  const frontText = card ? card.term : "You Don't Have Anything to Memorize";
  const backText = card ? card.definition : "Please Add Cards!";
  // Pictures are served by id and scoped to the owner, so the email travels
  // with the request the same way it does everywhere else in this API.
  const backImage =
    card && card.image && user?.email
      ? `/api/images/${encodeURIComponent(card.image)}?email=${encodeURIComponent(user.email)}`
      : null;

  const handleFlip = () => {
    if (!editMode) {
      setIsFlipped((v) => !v);
    }
  };

  // The whole collection arrives in one request and is paged through locally,
  // which also replaces the separate card-count lookup this page used to make.
  const fetchCards = async (keepIndex = 0) => {
    if (!user?.email) return;

    try {
      const res = await fetch(
        `/api/cards?email=${encodeURIComponent(user.email)}&collection=${encodeURIComponent(collection)}`,
        { mode: "cors" }
      );
      const data = await res.json();
      const list = Array.isArray(data.cards) ? data.cards : [];

      setCards(list);
      setMultiAuthor(Boolean(data.multi_author));
      setCurrentIndex(list.length ? Math.min(keepIndex, list.length - 1) : 0);
      setIsFlipped(false);
      setEditMode(false);
      setError(null);
    } catch (e) {
      setError(e);
      toast({
        title: "Error",
        description: "Failed to load cards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const requestedCollection = searchParams.get("collection");
  useEffect(() => {
    if (!requestedCollection || collectionsLoading) return;
    if (collections.includes(requestedCollection) && requestedCollection !== selectedCollection) {
      setSelectedCollection(requestedCollection);
    }
  }, [requestedCollection, collectionsLoading, collections, selectedCollection, setSelectedCollection]);

  useEffect(() => {
    setEditInputs({ term: card?.term || "", definition: card?.definition || "" });
  }, [card?.term, card?.definition]);

  // Moving on while the definition is showing means the card rotates back to
  // its term. Swapping the data straight away would paint the next card's
  // definition onto the back face while it is still turned towards the user, so
  // hold the swap until the card is edge-on and neither face is readable.
  const goToCard = (index) => {
    clearTimeout(flipTimer.current);

    const settle = () => {
      setCurrentIndex(index);
      setEditMode(false);
    };

    if (isFlipped) {
      setIsFlipped(false);
      flipTimer.current = setTimeout(settle, FLIP_MS / 2);
    } else {
      settle();
    }
  };

  const handleNextCard = () => {
    if (!totalCards) return;
    goToCard(currentIndex < totalCards - 1 ? currentIndex + 1 : 0);
  };

  const handlePreviousCard = () => {
    if (!totalCards) return;
    goToCard(currentIndex > 0 ? currentIndex - 1 : totalCards - 1);
  };

  useEffect(() => {
    if (selectedCollection && !collectionsLoading) {
      fetchCards(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection, collectionsLoading, user?.email]);

  // Every answer is recorded, so the progress page can report what was actually
  // studied rather than inferring it from the text of the definition.
  const recordOutcome = async (outcome) => {
    if (!card) return false;

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          token: user.email,
          collection,
          word: card.term,
          outcome,
        }),
      });
      const data = await response.json();

      if (data.status === 200 && data.card) {
        setCards((prev) => prev.map((c) => (c.term === data.card.term ? data.card : c)));
        return true;
      }
    } catch (e) {
      console.error("Error recording review:", e);
    }

    toast({
      title: "Error",
      description: "Could not save your answer. Please try again.",
      variant: "destructive",
    });
    return false;
  };

  const handleKnown = async () => {
    await recordOutcome("correct");
    handleNextCard();
  };

  const handleUnknown = async () => {
    await recordOutcome("incorrect");
    handleNextCard();
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditInputs({ term: card?.term || "", definition: card?.definition || "" });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditInputs({ term: card?.term || "", definition: card?.definition || "" });
  };

  const handleSaveEdit = async () => {
    if (!card) return;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        token: user.email,
        oldword: card.term,
        word: editInputs.term,
        ans: editInputs.definition,
        collection,
      }),
    };

    try {
      const response = await fetch("/api/editword", requestOptions);
      const data = await response.json();
      if (data.status === 200) {
        toast({
          title: "Card Updated",
          description: "Your flashcard has been updated successfully.",
        });
        setEditMode(false);
        fetchCards(currentIndex);
      } else {
        toast({
          title: "Error",
          description: "Failed to update card. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!card) return;

    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        token: user.email,
        collection,
      }),
    };

    try {
      const response = await fetch("/api/delword/" + encodeURIComponent(card.term), requestOptions);
      const data = await response.json();
      if (data.status === 200) {
        toast({
          title: "Card Deleted",
          description: "Your flashcard has been deleted successfully.",
        });

        // fetchCards clamps the index to the shortened list, so the page lands
        // on the neighbouring card (or the empty state) on its own.
        setIsFlipped(false);
        fetchCards(currentIndex);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete card. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Error",
        description: "Failed to delete card. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 px-4">
        <div className="w-full max-w-[800px] mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/collections")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Review Cards</h1>
            <p className="text-muted-foreground mb-4">Click the card to flip between term and definition.</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCollection} onValueChange={setSelectedCollection} disabled={collectionsLoading}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection} value={collection}>
                      {collection}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="perspective-1000 relative">
            {/* Review Badge */}
            {isInReview && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="px-3 py-1 bg-accent text-accent-foreground">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reviewing
                </Badge>
              </div>
            )}

            {/* Dropdown Menu */}
            {isFlipped && !editMode && (
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Card
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div
              className={`relative w-full h-[26rem] sm:h-[30rem] lg:h-[34rem] transition-transform duration-500 ease-out transform-style-preserve-3d ${
                editMode ? "" : "cursor-pointer"
              } ${isFlipped ? "rotate-y-180" : ""}`}
              onClick={handleFlip}
            >
              {/* Front of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 hover:border-muted-foreground/20 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-8 md:p-10 text-center">
                  {editMode && isFlipped ? (
                    <Input
                      value={editInputs.term}
                      onChange={(e) => setEditInputs({ ...editInputs, term: e.target.value })}
                      className="text-2xl font-semibold text-center mb-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{frontText}</h2>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">Click to reveal definition</p>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-card border-2 hover:border-muted-foreground/20 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-8 md:p-10 text-center">
                  {editMode ? (
                    <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editInputs.term}
                        onChange={(e) => setEditInputs({ ...editInputs, term: e.target.value })}
                        placeholder="Term"
                        className="mb-2"
                      />
                      <Input
                        value={editInputs.definition}
                        onChange={(e) => setEditInputs({ ...editInputs, definition: e.target.value })}
                        placeholder="Definition"
                        className="mb-4"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleSaveEdit} size="sm">
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {backImage && (
                        <img
                          src={backImage}
                          alt=""
                          className="max-h-[45%] max-w-full object-contain rounded-lg mb-4"
                        />
                      )}
                      {backText && (
                        <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-4">{backText}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-4">Click to see term again</p>
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </CardContent>

                {!editMode && attribution && (
                  <p
                    title={attribution}
                    className="absolute bottom-2 inset-x-4 truncate text-right text-[10px] leading-none text-muted-foreground/50"
                  >
                    {attribution}
                  </p>
                )}
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          {!editMode && (
            <div className="mt-6 flex flex-col gap-3">
              {/* Only show "I Know This" and "Need Review" when card is flipped to definition side */}
              {isFlipped && (
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleUnknown}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Need Review
                  </Button>
                  <Button
                    onClick={handleKnown}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    I Know This
                  </Button>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-center gap-3">
                  <Button onClick={handlePreviousCard} variant="outline" disabled={totalCards === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button onClick={handleNextCard} variant="outline" className="flex-1" disabled={totalCards === 0}>
                    Next Card
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {totalCards > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Card {currentIndex + 1} of {totalCards}
                  </p>
                )}
                <Button variant="outline" onClick={handleFlip} className="w-full">
                  {isFlipped ? "Show Term" : "Show Definition"}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-destructive text-center">Failed to load card.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Flashcard;
