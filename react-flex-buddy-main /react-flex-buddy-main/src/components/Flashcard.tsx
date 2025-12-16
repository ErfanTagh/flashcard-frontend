import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface FlashcardProps {
  term: string;
  definition: string;
  className?: string;
}

export const Flashcard = ({ term, definition, className = "" }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      <div 
        className={`relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 hover:border-muted-foreground/20 transition-colors">
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {term}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Click to reveal definition
            </p>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-muted/30 border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-lg text-foreground leading-relaxed mb-4">
              {definition}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Click to see term again
            </p>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFlip}
          className="text-xs"
        >
          {isFlipped ? 'Show Term' : 'Show Definition'}
        </Button>
      </div>
    </div>
  );
};