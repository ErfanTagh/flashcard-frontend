import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Zap, Target, BookOpen, BarChart3, ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPostLoginDest } from "@/lib/postLogin";
import { AppleIcon, AndroidIcon } from "@/Components/BrandIcons";

const Home = () => {
  const { isAuthenticated, loginWithRedirect, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* WelcomeSection */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
          <div className="container py-8 sm:py-12 px-4">
            <div className="text-center animate-fade-in">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
                Welcome{user?.given_name ? ` ${user.given_name}` : ''}! 👋
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Ready to review your flashcards and learn something new?
              </p>
            </div>
          </div>
        </div>

        <main className="container py-8 sm:py-12 px-4">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Link 
              to="/collections" 
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 sm:hover:-translate-y-1 group no-underline"
            >
              <div className="p-5 sm:p-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
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
              className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 sm:hover:-translate-y-1 group no-underline"
            >
              <div className="p-5 sm:p-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold leading-none tracking-tight mb-2 text-foreground">
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
      <nav className="container py-4 sm:py-6 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
            RecallCards
          </span>
        </div>
        <Button
          onClick={() => { setPostLoginDest("/collections"); loginWithRedirect(); }}
          className="shrink-0 h-9 px-3 text-sm sm:h-10 sm:px-4 sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          Get Started
          <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4" />
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="container px-4 py-8 sm:py-12 md:py-20">
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-10 sm:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-5 sm:mb-6">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">Your personal flashcard study tool</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Master Anything with
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                Smart Flashcards
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
              Create, study, and track your learning progress with our beautiful and intuitive flashcard system. 
              Transform how you learn, one card at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <Button
                size="lg"
                onClick={() => { setPostLoginDest("/collections"); loginWithRedirect(); }}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto shadow-xl hover:shadow-2xl sm:hover:scale-105 transition-all"
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
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto border-2 hover:bg-accent/10 hover:border-accent transition-all"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features-section" className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full mb-10 sm:mb-16">
            <div className="rounded-xl border-2 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group">
              <div className="p-6 sm:p-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Smart Cards</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create beautiful flashcards with terms and definitions that help you learn faster and remember longer.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group">
              <div className="p-6 sm:p-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Quick Review</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Interactive flip cards make studying engaging and help information stick better in your memory.
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group">
              <div className="p-6 sm:p-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Track Progress</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your learning journey and see how much you've improved over time with detailed analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="rounded-2xl border-2 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-6 sm:p-8 md:p-12 shadow-xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Why Choose RecallCards?
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
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

          {/* Apps in progress */}
          <div className="w-full max-w-4xl mx-auto mt-10 sm:mt-16">
            <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-6 sm:p-8 md:p-12 shadow-xl">
              {/* Brand-coloured glow, purely decorative */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 blur-3xl"
              />

              <div className="relative text-center mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))] mb-4">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                  In development
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Mobile apps are on the way
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Native apps for iPhone and Android, built on the same account you
                  already have. Your collections, review history and progress carry
                  across untouched.
                </p>
              </div>

              <div className="relative grid sm:grid-cols-2 gap-3 sm:gap-4">
                <PlatformCard
                  icon={<AppleIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                  name="iOS"
                  detail="iPhone &amp; iPad"
                />
                <PlatformCard
                  icon={<AndroidIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
                  name="Android"
                  detail="Phones &amp; tablets"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * One platform in the "coming soon" panel. Deliberately not a link or a store
 * badge: there is nothing to download yet, and a button that does nothing is
 * worse than no button.
 */
function PlatformCard({ icon, name, detail }) {
  return (
    <div className="group flex items-center gap-3 sm:gap-4 rounded-xl border bg-background/60 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
      <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md transition-transform duration-300 sm:group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-base sm:text-lg font-semibold text-foreground leading-tight">{name}</p>
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{detail}</p>
      </div>

      <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-[hsl(var(--primary))]">
        Soon
      </span>
    </div>
  );
};

export default Home;
