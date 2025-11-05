import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function AddFlashcard() {
  const { user } = useAuth0();
  const { toast } = useToast();
  const [inputs, setInputs] = useState({ title: "", ans: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputs.title.trim() || !inputs.ans.trim()) {
      toast({ title: "Missing Information", description: "Please fill in both fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email, word: inputs.title, ans: inputs.ans }),
      };
      const response = await fetch("/api/sendwords", requestOptions);
      const data = await response.json();
      if (data["status"] === 200) {
        toast({ title: "Card Added Successfully!", description: `"${inputs.title}" has been added.` });
        setInputs({ title: "", ans: "" });
      } else {
        toast({ title: "Error", description: "Failed to add the card.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => setInputs({ title: "", ans: "" });

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Add New Flashcard
            </h1>
            <p className="text-muted-foreground text-lg">Create a new card to expand your learning collection</p>
          </div>

          <Card className="mb-6 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-primary">New Flashcard</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Term *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Enter the term or concept"
                    value={inputs.title}
                    onChange={handleChange}
                    className="w-full border-primary/30 focus:border-primary focus:ring-primary/20"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{inputs.title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ans" className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Definition *
                  </Label>
                  <Textarea
                    id="ans"
                    name="ans"
                    placeholder="Enter the definition or explanation"
                    value={inputs.ans}
                    onChange={handleChange}
                    className="w-full min-h-[120px] resize-none border-accent/30 focus:border-accent focus:ring-accent/20"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{inputs.ans.length}/500 characters</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting || !inputs.title.trim() || !inputs.ans.trim()} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Add Card
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default AddFlashcard;
