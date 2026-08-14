import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, TrendingUp, Calendar, FolderOpen, ArrowLeft } from "lucide-react";

const EMPTY_STATS = {
  total: 0,
  studied: 0,
  unseen: 0,
  needs_review: 0,
  known: 0,
  attempts: 0,
  accuracy: 0,
  last_reviewed: null,
};

function Progress() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { collections, selectedCollection, setSelectedCollection, loading: collectionsLoading } = useCollections();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || isLoading || !selectedCollection) return;

      try {
        // The backend derives these from recorded review outcomes, so the page
        // no longer has to infer progress from the shape of the definition text.
        const res = await fetch(
          `/api/progress?email=${encodeURIComponent(user.email)}&collection=${encodeURIComponent(selectedCollection)}`,
          { mode: "cors" }
        );
        const data = await res.json();
        setStats({ ...EMPTY_STATS, ...data });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(EMPTY_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isLoading, selectedCollection]);

  if (isLoading || !user) {
    return null;
  }

  const pct = (value) => (stats.total > 0 ? Math.round((value / stats.total) * 100) : 0);
  const knownPercentage = pct(stats.known);
  const studiedPercentage = pct(stats.studied);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <main className="w-full max-w-full px-6 py-8 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-lg text-muted-foreground mb-4">Track your learning journey and celebrate your achievements</p>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCollection} onValueChange={setSelectedCollection} disabled={collectionsLoading}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <div className="flex flex-col gap-8">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-start">
              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.total}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cards in your deck</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-accent/5 animate-fade-in [animation-delay:100ms]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium">Studied</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    {stats.studied}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.unseen} not opened yet</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 animate-fade-in [animation-delay:200ms]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium">Known</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stats.known}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{knownPercentage}% of deck</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-accent/5 animate-fade-in [animation-delay:300ms]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                  <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    {stats.needs_review}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Flagged to revisit</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 animate-fade-in [animation-delay:400ms]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Known
                  </CardTitle>
                  <CardDescription>
                    {stats.known} of {stats.total} cards answered correctly and not flagged
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <ProgressBar 
                      value={knownPercentage}
                      className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent transition-all duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stats.attempts > 0
                        ? `${stats.accuracy}% accuracy over ${stats.attempts} answers`
                        : "No answers recorded yet"}
                    </p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {knownPercentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50 bg-gradient-to-br from-card to-accent/5 animate-fade-in [animation-delay:500ms]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Coverage
                  </CardTitle>
                  <CardDescription>
                    {stats.studied} of {stats.total} cards studied at least once
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <ProgressBar
                      value={studiedPercentage}
                      className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary transition-all duration-500"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stats.unseen > 0 ? `${stats.unseen} still to open` : "Whole deck seen"}
                    </p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {studiedPercentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Progress;

