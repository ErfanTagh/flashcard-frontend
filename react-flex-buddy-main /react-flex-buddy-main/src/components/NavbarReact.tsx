import { useState } from "react";
import { Menu, User, LogOut, Home, BookOpen, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarReactProps {
  user?: {
    given_name?: string;
    name?: string;
    picture?: string;
  };
  onLogout?: () => void;
}

export const NavbarReact = ({ user, onLogout }: NavbarReactProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link 
        to="/home" 
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      <Link 
        to="/flashcards" 
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <BookOpen className="h-4 w-4" />
        Review Cards
      </Link>
      <Link 
        to="/addword" 
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <Plus className="h-4 w-4" />
        Add Card
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary"></div>
            <span className="hidden font-bold sm:inline-block">FlashCards</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <NavLinks />
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative h-10 w-10 rounded-full bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {user.name?.charAt(0)}
                  </span>
                )}
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg z-50">
                  <div className="flex items-center justify-start gap-2 p-3 border-b">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{user.name}</p>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-10 w-10 rounded-md hover:bg-muted transition-colors flex items-center justify-center"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            {user && (
              <div className="flex items-center space-x-3 pb-4 border-b">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {user.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <NavLinks />
            </div>
            
            {user && (
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    onLogout?.();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};