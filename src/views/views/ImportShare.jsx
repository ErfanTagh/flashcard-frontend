import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Check, Download, ArrowRight, AlertCircle, Layers } from "lucide-react";

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
  const navigate = useNavigate();

  const [share, setShare] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/shares/${encodeURIComponent(shareId)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.status !== 200) setError(data.error || "This link is no longer available");
        else setShare(data);
      } catch {
        if (!cancelled) setError("Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shareId]);

  // "Log in to add it" states the intent already, so after the round trip
  // through Auth0 the import runs by itself -- no second button press. The
  // intent is remembered in localStorage because it must survive a full page
  // reload, and it is keyed to this share so it cannot import something else.
  useEffect(() => {
    if (!isAuthenticated || !user?.email || !share) return;
    if (localStorage.getItem("pending_share_import") !== shareId) return;
    localStorage.removeItem("pending_share_import");
    handleImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email, share]);

  const handleImport = async () => {
    if (!user?.email) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/shares/${encodeURIComponent(shareId)}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token: user.email }),
      });
      const data = await res.json();
      if (data.status !== 200) throw new Error(data.error || "Import failed");
      toast({
        title: "Added to your collections",
        description: `${data.imported} card${data.imported === 1 ? "" : "s"} copied into "${data.collection}".`,
      });
      navigate("/collections");
    } catch (e) {
      toast({ title: "Couldn't import", description: e.message, variant: "destructive" });
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

        {isAuthenticated ? (
          <div className="space-y-3">
            <Button onClick={handleImport} disabled={importing} className="w-full h-12 text-base">
              <Download className="h-5 w-5 mr-2" />
              {importing ? "Importing…" : "Import to my collections"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You get your own copy with a clean slate. Studying it won&rsquo;t
              affect the original.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() => {
                localStorage.setItem("pending_share_import", shareId);
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
