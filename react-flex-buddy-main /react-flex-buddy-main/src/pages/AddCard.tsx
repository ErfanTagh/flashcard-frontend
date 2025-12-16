import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Home, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AddCard = () => {
  // Mock user data
  const user = {
    given_name: "John",
    name: "John Doe",
    picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  };

  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!term.trim() || !definition.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the term and definition.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the data to your backend
      console.log("New card:", { term: term.trim(), definition: definition.trim() });
      
      toast({
        title: "Card Added Successfully!",
        description: `"${term}" has been added to your collection.`,
      });

      // Reset form
      setTerm("");
      setDefinition("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTerm("");
    setDefinition("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="container py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Add New Flashcard
            </h1>
            <p className="text-muted-foreground text-lg">
              Create a new card to expand your learning collection
            </p>
          </div>

          {/* Form Card */}
          <Card className="mb-6 border-primary/20 shadow-xl shadow-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-primary/10 px-8 py-6">
              <CardTitle className="text-primary text-xl">
                New Flashcard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Term Input */}
                <div className="space-y-3">
                  <Label htmlFor="term" className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    Term *
                  </Label>
                  <Input
                    id="term"
                    type="text"
                    placeholder="Enter the term or concept"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full h-12 px-4 border-primary/30 focus:border-primary focus:ring-primary/20 text-base"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    {term.length}/100 characters
                  </p>
                </div>

                {/* Definition Input */}
                <div className="space-y-3">
                  <Label htmlFor="definition" className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                    Definition *
                  </Label>
                  <Textarea
                    id="definition"
                    placeholder="Enter the definition or explanation"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    className="w-full min-h-[140px] p-4 resize-none border-accent/30 focus:border-accent focus:ring-accent/20 text-base leading-relaxed"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    {definition.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-border/50">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !term.trim() || !definition.trim()}
                    className="flex-1 h-12 text-base font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Add Card
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="h-12 px-6 text-base"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {(term.trim() || definition.trim()) && (
            <Card className="mb-6 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Term:</p>
                    <p className="text-lg font-semibold text-foreground">
                      {term.trim() || "Your term will appear here..."}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Definition:</p>
                    <p className="text-foreground leading-relaxed">
                      {definition.trim() || "Your definition will appear here..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/flashcards" className="flex items-center gap-2">
                Review Cards
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddCard;