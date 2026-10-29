import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { setPostLoginDest } from "@/lib/postLogin";

/**
 * Top navigation for the public pages (blog, etc.). Signed-in visitors already
 * have the sidebar, so this renders only when signed out -- which is exactly
 * when the sidebar is absent and a page would otherwise have no header.
 */
export default function PublicNav() {
  const { isAuthenticated, loginWithRedirect } = useAuth();
  if (isAuthenticated) return null;

  return (
    <nav className="container flex items-center justify-between gap-2 px-4 py-4 sm:py-6">
      <Link to="/" className="flex min-w-0 items-center gap-2 no-underline sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg sm:h-10 sm:w-10">
          <BookOpen className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
        </span>
        <span className="truncate text-lg font-bold text-primary sm:text-2xl md:text-3xl">RecallCards</span>
      </Link>
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <Link
          to="/blog"
          className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-primary sm:inline-flex"
        >
          Blog
        </Link>
        <Button
          onClick={() => { setPostLoginDest("/collections"); loginWithRedirect(); }}
          className="h-9 bg-primary px-3 text-sm text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl sm:h-10 sm:px-4 sm:text-base"
        >
          Get Started
          <ArrowRight className="ml-1.5 h-4 w-4 sm:ml-2" />
        </Button>
      </div>
    </nav>
  );
}
