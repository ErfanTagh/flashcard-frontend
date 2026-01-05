import * as React from "react";
import { useState, useEffect } from "react";
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
import { RotateCcw, Check, X, MoreHorizontal, Edit, Trash2, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

function Flashcard() {
  const [error, setError] = useState(null);
  const [card, setCard] = useState(["", ""]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isInReview, setIsInReview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInputs, setEditInputs] = useState({ term: "", definition: "" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { collections, selectedCollection, setSelectedCollection, loading: collectionsLoading } = useCollections();

  const REVIEW_KEY = "FFFLASHBACKCARDS";

  const processBack = (back) => {
    if (back && back.substring(back.length - 16) === REVIEW_KEY) {
      return back.slice(0, -16);
    }
    return back;
  };

  const handleFlip = () => {
    if (!editMode) {
      setIsFlipped((v) => !v);
    }
  };

  const fetchData = async (index = 0) => {
    try {
      const collection = selectedCollection || 'Default';
      const res = await fetch(`/api/words/rand/${user.email}?collection=${encodeURIComponent(collection)}&index=${index}`, { mode: "cors" });
      const data = await res.json();
      setCard(data);
      setIsFlipped(false);
      setEditMode(false);
      setCurrentIndex(index);
      
      // Check if card is in review state
      if (data[1] && data[1].substring(data[1].length - 16) === REVIEW_KEY) {
        setIsInReview(true);
      } else {
        setIsInReview(false);
      }
      
      setEditInputs({ term: data[0] || "", definition: processBack(data[1]) || "" });
    } catch (e) {
      setError(e);
      toast({
        title: "Error",
        description: "Failed to load card. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch total card count when collection changes
  useEffect(() => {
    const fetchCardCount = async () => {
      if (!user?.email || !selectedCollection) return;
      try {
        const res = await fetch(`/api/collections/${user.email}/stats`, { mode: "cors" });
        const data = await res.json();
        if (data.stats && data.stats[selectedCollection] !== undefined) {
          setTotalCards(data.stats[selectedCollection]);
        }
      } catch (e) {
        console.error('Error fetching card count:', e);
      }
    };
    fetchCardCount();
  }, [selectedCollection, user]);

  const handleNextCard = () => {
    if (currentIndex < totalCards - 1) {
      fetchData(currentIndex + 1);
    } else {
      // Loop back to first card
      fetchData(0);
    }
  };

  const handlePreviousCard = () => {
    if (currentIndex > 0) {
      fetchData(currentIndex - 1);
    } else {
      // Loop to last card
      fetchData(totalCards - 1);
    }
  };

  useEffect(() => {
    if (selectedCollection && !collectionsLoading) {
      setCurrentIndex(0); // Reset to first card when collection changes
      fetchData(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection, collectionsLoading]);

  const reviewStatusChanged = async (term, definition) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        token: user.email,
        oldword: term,
        word: term,
        ans: definition,
        collection: selectedCollection || 'Default',
      }),
    };

    try {
      const response = await fetch("/api/editword", requestOptions);
      const data = await response.json();
      if (data.status === 200) {
        return true;
      }
    } catch (error) {
      console.error("Error updating word:", error);
      return false;
    }
  };

  const handleKnown = async () => {
    const currentBack = card[1];
    if (currentBack && currentBack.substring(currentBack.length - 16) === REVIEW_KEY) {
      const newBack = currentBack.slice(0, -16);
      const success = await reviewStatusChanged(card[0], newBack);
      if (success) {
        setIsInReview(false);
        toast({
          title: "Card Marked as Known",
          description: "This card will not appear in review mode.",
        });
      }
    }
    handleNextCard();
  };

  const handleUnknown = async () => {
    const currentBack = card[1];
    if (!currentBack || currentBack.substring(currentBack.length - 16) !== REVIEW_KEY) {
      const newBack = currentBack + REVIEW_KEY;
      const success = await reviewStatusChanged(card[0], newBack);
      if (success) {
        setIsInReview(true);
        toast({
          title: "Card Marked for Review",
          description: "This card will appear in review mode.",
        });
      }
    }
    handleNextCard();
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditInputs({ term: card[0] || "", definition: processBack(card[1]) || "" });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditInputs({ term: card[0] || "", definition: processBack(card[1]) || "" });
  };

  const handleSaveEdit = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        token: user.email,
        oldword: card[0],
        word: editInputs.term,
        ans: editInputs.definition,
        collection: selectedCollection || 'Default',
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
        fetchData(currentIndex);
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
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ 
        token: user.email,
        collection: selectedCollection || 'Default'
      }),
    };

    try {
      const response = await fetch("/api/delword/" + encodeURIComponent(card[0]), requestOptions);
      const data = await response.json();
      if (data.status === 200) {
        toast({
          title: "Card Deleted",
          description: "Your flashcard has been deleted successfully.",
        });
        
        // Update total cards count
        const newTotal = Math.max(0, totalCards - 1);
        setTotalCards(newTotal);
        
        // After deletion, adjust index and fetch next card
        if (newTotal === 0) {
          setCard(["You Don't Have Anything to Memorize ", "Please Add Cards!"]);
        } else if (currentIndex >= newTotal && currentIndex > 0) {
          fetchData(currentIndex - 1);
        } else {
          fetchData(currentIndex);
        }
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
        <div className="max-w-2xl mx-auto">
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
              className={`relative w-full h-96 transition-transform duration-700 transform-style-preserve-3d ${
                editMode ? "" : "cursor-pointer"
              } ${isFlipped ? "rotate-y-180" : ""}`}
              onClick={handleFlip}
            >
              {/* Front of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 hover:border-muted-foreground/20 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  {editMode && isFlipped ? (
                    <Input
                      value={editInputs.term}
                      onChange={(e) => setEditInputs({ ...editInputs, term: e.target.value })}
                      className="text-2xl font-semibold text-center mb-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h2 className="text-2xl font-semibold text-foreground mb-4">{card[0]}</h2>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">Click to reveal definition</p>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-card border-2 hover:border-muted-foreground/20 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
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
                      <p className="text-lg text-foreground leading-relaxed mb-4">{processBack(card[1])}</p>
                      <p className="text-sm text-muted-foreground mb-4">Click to see term again</p>
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </CardContent>
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
