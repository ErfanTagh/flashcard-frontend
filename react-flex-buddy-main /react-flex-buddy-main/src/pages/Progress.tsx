import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react";

interface Stats {
  totalCards: number;
  reviewedCards: number;
  masteredCards: number;
  learningCards: number;
}

const Progress = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    reviewedCards: 0,
    masteredCards: 0,
    learningCards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Mock data for now - replace with actual database queries when flashcards table is created
        setStats({
          totalCards: 0,
          reviewedCards: 0,
          masteredCards: 0,
          learningCards: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (authLoading || !user) {
    return null;
  }

  const masteryPercentage = stats.totalCards > 0 
    ? Math.round((stats.masteredCards / stats.totalCards) * 100) 
    : 0;
  const reviewProgress = stats.totalCards > 0
    ? Math.round((stats.reviewedCards / stats.totalCards) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar 
        user={{
          name: user.email || "User",
          picture: undefined,
          given_name: undefined
        }} 
        onLogout={handleLogout} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-lg text-muted-foreground">Track your learning journey and celebrate your achievements</p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.totalCards}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cards in your deck</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-accent/5 animate-fade-in [animation-delay:100ms]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    {stats.reviewedCards}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{reviewProgress}% of total</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 animate-fade-in [animation-delay:200ms]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mastered</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.masteredCards}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{masteryPercentage}% mastery</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-accent/5 animate-fade-in [animation-delay:300ms]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    {stats.learningCards}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cards in progress</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 animate-fade-in [animation-delay:400ms]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Mastery Progress
                  </CardTitle>
                  <CardDescription>
                    {stats.masteredCards} out of {stats.totalCards} cards mastered
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <ProgressBar 
                      value={masteryPercentage} 
                      className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent transition-all duration-500" 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-muted-foreground">{masteryPercentage}% complete</p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {masteryPercentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50 bg-gradient-to-br from-card to-accent/5 animate-fade-in [animation-delay:500ms]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Review Progress
                  </CardTitle>
                  <CardDescription>
                    {stats.reviewedCards} out of {stats.totalCards} cards reviewed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <ProgressBar 
                      value={reviewProgress} 
                      className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary transition-all duration-500" 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-muted-foreground">{reviewProgress}% reviewed</p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {reviewProgress}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Progress;
