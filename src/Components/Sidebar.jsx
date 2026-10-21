import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Home, Layers, Compass, BarChart3, Play, GraduationCap } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

/**
 * The app's navigation, down the left, open or closed.
 *
 * Grouped rather than listed: the first group is where things are, the second
 * is what you do with them. A heading over the second says which is which, so
 * it reads as two short menus instead of one long one.
 *
 * Open and closed are driven by state rather than by breakpoints, because the
 * reader gets the final say: the width only decides what it opens as.
 */

const PLACES = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/collections", label: "Your decks", icon: Layers },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/progress", label: "Progress", icon: BarChart3 },
];

const ACTIONS = [
  { to: "/flashcards", label: "Study", icon: Play },
  { to: "/quiz", label: "Quiz", icon: GraduationCap },
];

const STORAGE_KEY = "sidebar-collapsed";

const MenuIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M20.6006 17.5098C20.8286 17.5563 21 17.7583 21 18C21 18.2417 20.8286 18.4437 20.6006 18.4902L20.5 18.5H3.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5H20.5L20.6006 17.5098ZM20.6006 11.5098C20.8286 11.5563 21 11.7583 21 12C21 12.2417 20.8286 12.4437 20.6006 12.4902L20.5 12.5H3.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5H20.5L20.6006 11.5098ZM20.6006 5.50977C20.8286 5.55629 21 5.75829 21 6C21 6.24171 20.8286 6.44371 20.6006 6.49023L20.5 6.5H3.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5H20.5L20.6006 5.50977Z"
      fill="currentColor"
    />
  </svg>
);

const Sidebar = ({ user, onLogout }) => {
  // Remembered, because a reader who closed it did not mean "until the next
  // page". A narrow window only decides what it opens as the first time.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === "true";
    } catch {
      // Private browsing, or storage blocked: fall through to the width.
    }
    return typeof window !== "undefined" && window.innerWidth < 1024;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Not remembering the choice is survivable; failing to render is not.
    }
  }, [collapsed]);

  if (!user) {
    return null;
  }

  const item = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium no-underline transition-colors",
      collapsed ? "justify-center px-0" : "px-3",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    ].join(" ");

  return (
    <aside
      className={[
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      ].join(" ")}
    >
      {/* Brand and the control that closes the column. Closed, the toggle
          takes the row on its own -- the logo would only repeat what the
          first menu icon already says. */}
      <div className={["flex h-16 shrink-0 items-center gap-2", collapsed ? "justify-center px-2" : "px-3"].join(" ")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((open) => !open)}
          className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? "Open the menu" : "Close the menu"}
          aria-expanded={!collapsed}
          title={collapsed ? "Open the menu" : "Close the menu"}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        {!collapsed && (
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2 no-underline transition-opacity hover:opacity-80"
          >
            <img
              src="/recallcards-logo.svg"
              alt="RecallCards"
              className="h-9 w-9 shrink-0"
              width="36"
              height="36"
            />
            <span className="truncate text-lg font-bold tracking-tight text-foreground">
              RecallCards
            </span>
          </Link>
        )}
      </div>

      <nav className={["flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-3", collapsed ? "px-2" : "px-3"].join(" ")}>
        {PLACES.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={item} title={label}>
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        <hr className="my-3 border-t" />

        {!collapsed && (
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Start studying
          </p>
        )}
        {ACTIONS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={item} title={label}>
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* The account sits at the foot of the column, out of the way of the
          navigation but reachable from every page. */}
      <div className={["shrink-0 border-t", collapsed ? "p-2" : "p-3"].join(" ")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={["h-auto w-full gap-3 py-2", collapsed ? "justify-center px-0" : "justify-start px-2"].join(" ")}
              aria-label="Your account"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <span className="truncate text-sm font-medium">{user.name}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top" forceMount>
            <div className="px-2 py-1.5">
              <p className="truncate font-medium">{user.name}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default Sidebar;
