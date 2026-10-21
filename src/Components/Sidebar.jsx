import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Home, Layers, Compass, BarChart3, Play, GraduationCap } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

/**
 * The app's navigation, down the left.
 *
 * Grouped rather than listed: the first group is where things are, the second
 * is what you do with them. A heading over the second group says which is
 * which, so the list reads as two short menus instead of one long one.
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

// One row of the menu. Labels are present at every width and hidden only on a
// narrow screen, so a rule that fails to arrive leaves them cramped rather
// than gone.
const itemClasses = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors",
    "max-lg:justify-center max-lg:px-0",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");

const Sidebar = ({ user, onLogout }) => {
  if (!user) {
    return null;
  }

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r bg-card lg:w-60">
      {/* Brand */}
      <Link
        to="/"
        className="flex h-16 shrink-0 items-center gap-2 px-3 no-underline transition-opacity hover:opacity-80 lg:px-4"
      >
        <img
          src="/recallcards-logo.svg"
          alt="RecallCards"
          className="h-9 w-9 shrink-0"
          width="36"
          height="36"
        />
        <span className="max-lg:hidden text-lg font-bold tracking-tight text-foreground">
          RecallCards
        </span>
      </Link>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3 lg:px-3">
        {PLACES.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={itemClasses} title={label}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="max-lg:hidden truncate">{label}</span>
          </NavLink>
        ))}

        <hr className="my-3 border-t" />

        <p className="max-lg:hidden px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Start studying
        </p>
        {ACTIONS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={itemClasses} title={label}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="max-lg:hidden truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* The account sits at the foot of the column, out of the way of the
          navigation but reachable from every page. */}
      <div className="shrink-0 border-t p-2 lg:p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-2 py-2 max-lg:justify-center max-lg:px-0"
              aria-label="Your account"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="max-lg:hidden truncate text-sm font-medium">
                {user.name}
              </span>
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
