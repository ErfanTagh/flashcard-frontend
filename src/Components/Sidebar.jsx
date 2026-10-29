import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Home, Layers, Compass, BarChart3, Play, GraduationCap, Newspaper } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

/**
 * Medium-style left rail:
 *
 * - One brand (hamburger + logo + name) stays fixed top-left always.
 * - Open: full column with links and account.
 * - Closed: the rail width goes to zero -- no icons. Brand stays so you can
 *   open it again. Slide + fade, not a hard cut.
 */

const PLACES = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/collections", label: "Your decks", icon: Layers },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/blog", label: "Blog", icon: Newspaper },
];

const ACTIONS = [
  { to: "/flashcards", label: "Study", icon: Play },
  { to: "/quiz", label: "Quiz", icon: GraduationCap },
];

const STORAGE_KEY = "sidebar-collapsed";
const RAIL_WIDTH = "w-60";
const MOTION = "duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]";

const MenuIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M20.6006 17.5098C20.8286 17.5563 21 17.7583 21 18C21 18.2417 20.8286 18.4437 20.6006 18.4902L20.5 18.5H3.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5H20.5L20.6006 17.5098ZM20.6006 11.5098C20.8286 11.5563 21 11.7583 21 12C21 12.2417 20.8286 12.4437 20.6006 12.4902L20.5 12.5H3.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5H20.5L20.6006 11.5098ZM20.6006 5.50977C20.8286 5.55629 21 5.75829 21 6C21 6.24171 20.8286 6.44371 20.6006 6.49023L20.5 6.5H3.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5H20.5L20.6006 5.50977Z"
      fill="currentColor"
    />
  </svg>
);

/** Always fixed top-left -- never remounts when the rail opens or closes. */
const SidebarBrand = ({ collapsed, onToggle }) => (
  <div className="fixed left-0 top-0 z-30 flex h-[4.5rem] w-max items-center gap-1.5 bg-background px-3 pr-4">
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="h-11 w-11 shrink-0 p-0 text-muted-foreground hover:text-foreground"
      aria-label={collapsed ? "Open the menu" : "Close the menu"}
      aria-expanded={!collapsed}
      title={collapsed ? "Open the menu" : "Close the menu"}
    >
      <MenuIcon className="h-6 w-6" />
    </Button>

    <Link to="/" className="flex shrink-0 items-center gap-1.5 no-underline">
      <img
        src="/recallcards-logo.svg"
        alt="RecallCards"
        className="h-10 w-10 shrink-0"
        width="40"
        height="40"
      />
      <span className="whitespace-nowrap text-xl font-bold tracking-tight text-foreground">
        RecallCards
      </span>
    </Link>
  </div>
);

const SidebarNav = () => {
  const item = ({ isActive }) =>
    [
      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    ].join(" ");

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-hidden px-3 pb-3">
      {PLACES.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={item} title={label}>
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}

      <hr className="my-3 border-t" />

      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        Start studying
      </p>
      {ACTIONS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={item} title={label}>
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

const SidebarAccount = ({ user, onLogout }) => (
  <div className="shrink-0 border-t p-3">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-3 px-2 py-2"
          aria-label="Your account"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.picture} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{user.name}</span>
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
);

const Sidebar = ({ user, onLogout }) => {
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

  return (
    <>
      <SidebarBrand
        collapsed={collapsed}
        onToggle={() => setCollapsed((wasCollapsed) => !wasCollapsed)}
      />

      <aside
        className={[
          "sticky top-0 h-screen shrink-0 overflow-hidden bg-muted/40",
          `transition-[width] ${MOTION}`,
          collapsed ? "w-0 border-0" : `${RAIL_WIDTH} border-r`,
        ].join(" ")}
        aria-hidden={collapsed || undefined}
      >
        {/* Fixed open width so closing clips instead of reflowing labels. */}
        <div
          className={[
            `flex h-full ${RAIL_WIDTH} flex-col`,
            `transition-[opacity,transform] ${MOTION}`,
            collapsed ? "pointer-events-none -translate-x-2 opacity-0" : "translate-x-0 opacity-100",
          ].join(" ")}
        >
          {/* Clears the fixed brand above. */}
          <div className="h-[4.5rem] shrink-0" aria-hidden="true" />
          <SidebarNav />
          <SidebarAccount user={user} onLogout={onLogout} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
