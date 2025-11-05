import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

function Flashcard() {
  const [error, setError] = useState(null);
  const [card, setCard] = useState(["", ""]);
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuth0();

  const handleFlip = () => setIsFlipped((v) => !v);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/words/rand/" + user.email, { mode: "cors" });
      const data = await res.json();
      setCard(data);
      setIsFlipped(false);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Review Cards</h1>
            <p className="text-muted-foreground">Click the card to flip between term and definition.</p>
          </div>

          <div className="perspective-1000">
            <div
              className={`relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={handleFlip}
            >
              <Card className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 hover:border-muted-foreground/20 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">{card[0]}</h2>
                  <p className="text-sm text-muted-foreground mb-4">Click to reveal definition</p>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-muted/30 border-2 border-muted-foreground/20">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <p className="text-lg text-foreground leading-relaxed mb-4">{card[1]}</p>
                  <p className="text-sm text-muted-foreground mb-4">Click to see term again</p>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={fetchData} className="">Next Card</Button>
            <Button variant="outline" onClick={handleFlip}>{isFlipped ? "Show Term" : "Show Definition"}</Button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive-foreground">Failed to load card.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Flashcard;
