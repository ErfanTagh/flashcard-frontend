import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Target, BookOpen, Plus, BarChart3 } from "lucide-react";





const Home = () => {
  const { isAuthenticated, loginWithRedirect, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* WelcomeSection (mapped) */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <div className="container py-8 px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Welcome{user?.given_name ? ` ${user.given_name}` : ''}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Ready to review your flashcards and learn something new?
              </p>
            </div>
          </div>
        </div>

        <main className="container py-8 px-4">
 

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Review Cards
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Practice with your existing flashcards and test your knowledge</p>
                <Link to="/flashcards" className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full no-underline">Start Reviewing</Link>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
                  <Plus className="h-5 w-5 text-primary" />
                  Add New Card
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Create new flashcards to expand your learning collection</p>
                <Link to="/addword" className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full no-underline">Add Card</Link>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <div className="p-6">
                <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Your Progress
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Track your learning progress and achievements</p>
                <Link to="/progress" className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full no-underline">View Stats</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/10 to-accent/10 border-b">
           <nav className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FlashLearn
            </span>
          </div>
          <Link
            to="#"
            onClick={(e) => { e.preventDefault(); loginWithRedirect(); }}
            className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 no-underline"
          >
            Get Started
          </Link>
        </nav>
      <main className="container px-4 py-16 md:py-24">
        <div className="flex flex-col items-stretch w-full">
          
          <div className="text-center w-full max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Master Anything with Smart Flashcards
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create, study, and track your learning progress with our beautiful and intuitive flashcard system
          </p>
  
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full mt-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-2 hover:border-primary/50 transition-colors">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">Smart Cards</h3>
              <p className="text-sm text-muted-foreground">
                Create beautiful flashcards with terms and definitions that help you learn faster
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-2 hover:border-primary/50 transition-colors">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">Quick Review</h3>
              <p className="text-sm text-muted-foreground">
                Interactive flip cards make studying engaging and help information stick better
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-2 hover:border-primary/50 transition-colors">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your learning journey and see how much you've improved over time
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
