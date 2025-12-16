import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Home, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";

const FlashcardReview = () => {
  // Mock user data
  const user = {
    given_name: "John",
    name: "John Doe",
    picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  };

  // Mock flashcard data
  const [flashcards] = useState([
    {
      id: 1,
      term: "Algorithm",
      definition: "A step-by-step procedure or formula for solving a problem or completing a task in computing."
    },
    {
      id: 2,
      term: "Variable",
      definition: "A storage location in programming that has an associated name and contains data that can be modified during program execution."
    },
    {
      id: 3,
      term: "Function",
      definition: "A reusable block of code that performs a specific task and can accept parameters and return values."
    },
    {
      id: 4,
      term: "Array",
      definition: "A data structure that stores multiple elements of the same type in a sequential manner, accessible by index."
    },
    {
      id: 5,
      term: "Loop",
      definition: "A programming construct that repeats a block of code multiple times until a specified condition is met."
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCard = flashcards[currentIndex];

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const shuffleCards = () => {
    setCurrentIndex(Math.floor(Math.random() * flashcards.length));
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="container py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Review Flashcards
            </h1>
            <p className="text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <Flashcard
              term={currentCard.term}
              definition={currentCard.definition}
              className="mx-auto max-w-md"
            />
          </div>

          {/* Navigation Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center gap-4">
                <Button
                  variant="outline"
                  onClick={previousCard}
                  disabled={flashcards.length <= 1}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={shuffleCards}
                  className="px-6"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={nextCard}
                  disabled={flashcards.length <= 1}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button asChild variant="ghost">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlashcardReview;