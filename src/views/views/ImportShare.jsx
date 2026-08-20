import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Check, ArrowRight, AlertCircle, Layers, Users } from "lucide-react";
import { setPendingShare, readPendingShare, clearPendingShare } from "@/lib/pendingShare";
import { shareLog } from "@/lib/shareDebug";

/**
 * The receiving end of a share link.
 *
 * Readable without an account, because the first thing a link needs to do is
 * show what is behind it -- asking someone to log in before they can see what
 * they are being offered loses them. Logging in is only required to import,
 * since the copy has to land in an account.
 */
function ImportShare() {
  const { shareId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth();
  const { toast } = useToast();
  const { fetchCollections } = useCollections();
  const navigate = useNavigate();

  const [share, setShare] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Identify the viewer so the API can flag their own deck back to them.
        const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
        const res = await fetch(`/api/shares/${encodeURIComponent(shareId)}${query}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.status !== 200) {
          shareLog("share", shareId, "failed to load:", data.error || data.status);
          setError(data.error || "This link is no longer available");
          // A dead link must also kill the pending marker, or the app-level
          // recovery would bounce the user back here forever.
          if (readPendingShare() === shareId) clearPendingShare();
        } else {
          shareLog("share", shareId, "loaded:", data.collection, `(${data.card_count} cards)`);
          setShare(data);
        }
      } catch {
        if (!cancelled) setError("Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shareId, user?.email]);

  // "Log in to add it" states the intent already, so after the round trip
  // through Auth0 the import runs by itself -- no second button press. The
  // intent is remembered in localStorage because it must survive a full page
  // reload, and it is keyed to this share so it cannot import something else.
  // One line per visit saying how the page found the user. If the trail shows
  // "signed out" right after an Auth0 round trip, the login itself is what
  // failed -- not the return address, not the import.
  useEffect(() => {
    if (authLoading) return;
    shareLog("share page auth state:",
             isAuthenticated ? `signed in as ${user?.email}` : "signed out");
  }, [authLoading, isAuthenticated, user?.email]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !share) return;
    const pending = readPendingShare();
    shareLog("on share page, signed in as", user.email, "- marker:", pending ?? "(none)");
    if (pending !== shareId) return;
    clearPendingShare();
    if (share.is_owner) {
      shareLog("own deck, not importing");
      return;
    }
    shareLog("auto-follow starting for", shareId);
    handleFollow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email, share]);

  const handleFollow = async () => {
    if (!user?.email) return;
    setImporting(true);
    try {
      const data = await (await fetch(`/api/shares/${encodeURIComponent(shareId)}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email }),
      })).json();
      if (data.status !== 200) throw new Error(data.error || "Couldn't add the deck");
      toast({
        title: data.already ? "Already in your collections" : "Added to your collections",
        description: `"${data.collection}" stays up to date with the owner's copy.`,
      });
      await fetchCollections();
      navigate("/collections");
    } catch (e) {
      toast({ title: "Couldn't add it", description: e.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 px-6">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-semibold mb-2">{error}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The person who shared it may have stopped sharing, renamed it, or
              deleted it.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Go to RecallCards</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border-2 bg-card shadow-xl overflow-hidden mb-6">
          {/* Cover, or the brand gradient when the deck has no picture */}
          <div className="relative h-40 sm:h-52 w-full bg-gradient-to-br from-primary to-accent">
            {share.cover && (
              <img
                src={`/api/images/${encodeURIComponent(share.cover)}?share=${encodeURIComponent(shareId)}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {!share.cover && (
              <BookOpen className="absolute inset-0 m-auto h-14 w-14 text-white/90" />
            )}
          </div>

          <div className="p-5 sm:p-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">
                {share.owner_name || "Someone"}
              </span>{" "}
              shared a deck with you
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {share.collection}
            </h1>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              {share.card_count} card{share.card_count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {share.allow_edit && !share.is_owner && isAuthenticated && (
          <div className="mb-4 rounded-lg border bg-card p-4">
            <p className="text-sm font-medium mb-1">This deck is open for edits</p>
            <p className="text-xs text-muted-foreground mb-3">
              You can add cards and fix mistakes, and everyone with the link
              sees them. Only the owner can delete cards.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/shared/${encodeURIComponent(shareId)}`}>
                Open the shared deck
              </Link>
            </Button>
          </div>
        )}

        {share.is_owner ? (
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full h-12 text-base">
              <Link to="/collections">Go to my collections</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              This is your own deck — this is the link other people open.
            </p>
          </div>
        ) : isAuthenticated ? (
          <div className="space-y-3">
            <Button onClick={handleFollow} disabled={importing} className="w-full h-12 text-base">
              <Users className="h-5 w-5 mr-2" />
              {importing ? "Adding…" : "Add to my collections"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              The deck stays live: every change the group makes shows up for
              you. Your own progress stays private.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => {
                shareLog("login clicked on share page for", shareId);
                setPendingShare(shareId);
                loginWithRedirect({ appState: { returnTo: `/import/${shareId}` } });
              }}
              className="w-full h-12 text-base"
            >
              Log in to add it
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              After you log in or sign up, you come straight back here and the
              deck is added for you.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5" />
          Cards only — the sharer&rsquo;s progress stays private
        </div>
      </div>
    </div>
  );
}

export default ImportShare;
