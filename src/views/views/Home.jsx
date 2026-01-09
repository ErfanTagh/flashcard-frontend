import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Target, BookOpen, BarChart3, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { isAuthenticated, loginWithRedirect, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* WelcomeSection */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
          <div className="container py-12 px-4">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                Welcome{user?.given_name ? ` ${user.given_name}` : ''}! 👋
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Ready to review your flashcards and learn something new?
              </p>
            </div>
          </div>
        </div>

        <main className="container py-12 px-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Link 
              to="/collections" 
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group no-underline"
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
                  Collections
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Manage and organize your flashcard collections</p>
                <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                  View Collections <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link 
              to="/progress" 
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group no-underline"
            >
              <div className="p-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
                  Your Progress
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Track your learning progress and achievements</p>
                <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                  View Stats <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Navigation */}
      <nav className="container py-6 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RecallCards
          </span>
        </div>
        <Button
          onClick={() => loginWithRedirect()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="container px-4 py-12 md:py-20">
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">Trusted by thousands of learners</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              Master Anything with
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                Smart Flashcards
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Create, study, and track your learning progress with our beautiful and intuitive flashcard system. 
              Transform how you learn, one card at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => loginWithRedirect()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const featuresSection = document.getElementById('features-section');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-lg px-8 py-6 h-auto border-2 hover:bg-accent/10 hover:border-accent transition-all"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features-section" className="grid md:grid-cols-3 gap-6 md:gap-8 w-full mb-16">
            <div className="rounded-xl border-2 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group">
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Smart Cards</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create beautiful flashcards with terms and definitions that help you learn faster and remember longer.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group">
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Quick Review</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Interactive flip cards make studying engaging and help information stick better in your memory.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group">
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Track Progress</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your learning journey and see how much you've improved over time with detailed analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="rounded-2xl border-2 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-8 md:p-12 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Why Choose RecallCards?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Organize cards into custom collections",
                  "Beautiful, intuitive interface",
                  "Track your learning progress",
                  "Works on all devices",
                  "Free forever - no hidden costs",
                  "Spaced repetition algorithm"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
