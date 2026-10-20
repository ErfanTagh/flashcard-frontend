import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Layers, Compass, BarChart3 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

interface NavbarProps {
  user?: {
    given_name?: string;
    name?: string;
    picture?: string;
  };
  onLogout?: () => void;
}

/**
 * The places worth a permanent link.
 *
 * Deliberately three. Everything else in the app is reached from one of them
 * -- studying and the quiz from a deck, cards from a deck, a shared deck from
 * Explore -- and a bar that lists every route stops being navigation and
 * starts being a sitemap.
 */
const SECTIONS = [
  { to: "/collections", label: "Decks", icon: Layers },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/progress", label: "Progress", icon: BarChart3 },
];

const ModernNavbar = ({ user, onLogout }: NavbarProps) => {

  // Hide navbar entirely when no authenticated user is provided
  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-2 sm:gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 no-underline transition-opacity hover:opacity-80"
        >
          <img
            src="/recallcards-logo.svg"
            alt="RecallCards Logo"
            className="h-10 w-10 flex-shrink-0"
            width="40"
            height="40"
          />
          <span className="hidden font-bold text-lg text-foreground lg:inline-block">
            RecallCards
          </span>
        </Link>

        {/* The sections. Labels give way to icons on a narrow screen rather
            than the links themselves disappearing behind a menu: three items
            fit on a phone, and a menu would hide the whole app behind a tap. */}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {SECTIONS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  // 44px square on a phone, where the label is gone and the
                  // icon alone has to be big enough to hit with a thumb.
                  "inline-flex h-11 w-11 items-center justify-center gap-2 rounded-md text-sm font-medium no-underline transition-colors sm:h-10 sm:w-auto sm:justify-start sm:px-3",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* User menu, shown at every width */}
        <div className="flex shrink-0 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Your account">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                </div>
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

      </div>
    </nav>
  );
};

export default ModernNavbar;
