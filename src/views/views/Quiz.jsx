import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Check, X, RotateCcw, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Quiz() {
  const { user, isLoading } = useAuth();
  const { selectedCollection, setSelectedCollection } = useCollections();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collectionName = searchParams.get('collection') || selectedCollection || 'Default';

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffledCards, setShuffledCards] = useState([]);

  useEffect(() => {
    if (collectionName) {
      setSelectedCollection(collectionName);
      fetchCards();
    }
  }, [collectionName]);

  const fetchCards = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/words", { mode: "cors" });
      const data = await res.json();
      
      if (data && data[user.email] && data[user.email][collectionName]) {
        const collectionCards = data[user.email][collectionName];
        const cardEntries = Object.entries(collectionCards).map(([term, definition]) => ({
          term,
          definition: typeof definition === 'string' && definition.substring(definition.length - 16) === "FFFLASHBACKCARDS"
            ? definition.slice(0, -16)
            : definition
        }));
        
        // Shuffle cards for quiz
        const shuffled = [...cardEntries].sort(() => Math.random() - 0.5);
        setCards(cardEntries);
        setShuffledCards(shuffled);
        setScore({ correct: 0, total: shuffled.length });
      } else {
        setCards([]);
        setShuffledCards([]);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast({
        title: "Error",
        description: "Failed to load cards for quiz.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (shuffledCards.length === 0) {
      toast({
        title: "No Cards",
        description: "This collection has no cards to quiz.",
        variant: "destructive",
      });
      return;
    }
    setQuizStarted(true);
    setCurrentIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setScore({ correct: 0, total: shuffledCards.length });
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please enter an answer.",
        variant: "destructive",
      });
      return;
    }

    const currentCard = shuffledCards[currentIndex];
    const correctAnswer = currentCard.definition.trim().toLowerCase();
    const userAnswerLower = userAnswer.trim().toLowerCase();
    
    // Check if answer is correct (exact match or contains the correct answer)
    const correct = userAnswerLower === correctAnswer || 
                    correctAnswer.includes(userAnswerLower) ||
                    userAnswerLower.includes(correctAnswer);

    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast({
        title: "Correct!",
        description: "Well done!",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer is: ${currentCard.definition}`,
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
    } else {
      // Quiz completed
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const percentage = Math.round((score.correct / shuffledCards.length) * 100);
    toast({
      title: "Quiz Complete!",
      description: `You got ${score.correct} out of ${shuffledCards.length} correct (${percentage}%)`,
    });
    setQuizStarted(false);
    setCurrentIndex(0);
    setUserAnswer("");
    setShowResult(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showResult) {
      checkAnswer();
    } else if (e.key === 'Enter' && showResult) {
      handleNext();
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <main className="container py-8 px-4 flex-1">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/collections')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Button>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  Quiz: {collectionName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">
                    Test your knowledge! You'll be shown terms and need to type the correct definition.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="font-semibold">Quiz Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>You'll see the term, type the definition</li>
                      <li>Answers are case-insensitive</li>
                      <li>Partial matches are accepted</li>
                      <li>Total cards: {shuffledCards.length}</li>
                    </ul>
                  </div>
                </div>

                {shuffledCards.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No cards available in this collection.</p>
                    <Button onClick={() => navigate('/collections')}>
                      Go to Collections
                    </Button>
                  </div>
                ) : (
                  <Button onClick={startQuiz} size="lg" className="w-full">
                    Start Quiz
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <main className="container py-8 px-4 flex-1">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              setQuizStarted(false);
              navigate('/collections');
            }}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Question {currentIndex + 1} of {shuffledCards.length}</span>
              <Badge variant="outline">
                Score: {score.correct}/{score.total}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {currentCard.term}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showResult ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Type the definition:</Label>
                    <Input
                      id="answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the definition..."
                      className="text-lg"
                      autoFocus
                    />
                  </div>
                  <Button onClick={checkAnswer} size="lg" className="w-full" disabled={!userAnswer.trim()}>
                    Check Answer
                  </Button>
                </>
              ) : (
                <>
                  <div className={`p-6 rounded-lg border-2 ${
                    isCorrect 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {isCorrect ? (
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-xl font-bold ${
                        isCorrect 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">Your answer:</p>
                      <p className="text-muted-foreground">{userAnswer}</p>
                      <p className="font-semibold mt-4">Correct answer:</p>
                      <p className="text-foreground">{currentCard.definition}</p>
                    </div>
                  </div>
                  <Button onClick={handleNext} size="lg" className="w-full">
                    {currentIndex < shuffledCards.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {currentIndex === shuffledCards.length - 1 && showResult && (
            <Card className="mt-6 border-2 border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Trophy className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                  <p className="text-3xl font-bold text-primary">
                    {score.correct} / {score.total}
                  </p>
                  <p className="text-muted-foreground">
                    {Math.round((score.correct / score.total) * 100)}% Correct
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={startQuiz} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                    <Button onClick={() => navigate('/collections')}>
                      Back to Collections
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default Quiz;

