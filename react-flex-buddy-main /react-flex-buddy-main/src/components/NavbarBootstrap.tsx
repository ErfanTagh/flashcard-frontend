import { useState } from "react";
import { Menu, User, LogOut, Home, BookOpen, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarBootstrapProps {
  user?: {
    given_name?: string;
    name?: string;
    picture?: string;
  };
  onLogout?: () => void;
}

export const NavbarBootstrap = ({ user, onLogout }: NavbarBootstrapProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <div 
            className="me-2 rounded" 
            style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#3b82f6' 
            }}
          ></div>
          <span className="fw-bold d-none d-sm-inline">FlashCards</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/home" className="nav-link d-flex align-items-center">
                <Home className="me-2" style={{ width: '16px', height: '16px' }} />
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/flashcards" className="nav-link d-flex align-items-center">
                <BookOpen className="me-2" style={{ width: '16px', height: '16px' }} />
                Review Cards
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/addword" className="nav-link d-flex align-items-center">
                <Plus className="me-2" style={{ width: '16px', height: '16px' }} />
                Add Card
              </Link>
            </li>
          </ul>

          {/* Desktop User Menu */}
          {user && (
            <div className="dropdown">
              <button
                className="btn btn-link dropdown-toggle d-flex align-items-center p-0 border-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="rounded-circle"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-medium"
                    style={{ width: '40px', height: '40px' }}
                  >
                    {user.name?.charAt(0)}
                  </div>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li className="px-3 py-2 border-bottom">
                  <div className="fw-medium small">{user.name}</div>
                </li>
                <li>
                  <Link to="/profile" className="dropdown-item d-flex align-items-center">
                    <User className="me-2" style={{ width: '16px', height: '16px' }} />
                    Profile
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={onLogout}
                    className="dropdown-item d-flex align-items-center w-100 border-0 bg-transparent"
                  >
                    <LogOut className="me-2" style={{ width: '16px', height: '16px' }} />
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? (
            <X style={{ width: '24px', height: '24px' }} />
          ) : (
            <Menu style={{ width: '24px', height: '24px' }} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="navbar-collapse collapse show d-lg-none border-top bg-white">
          <div className="container py-3">
            {user && (
              <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="rounded-circle me-3"
                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-medium me-3"
                    style={{ width: '48px', height: '48px' }}
                  >
                    {user.name?.charAt(0)}
                  </div>
                )}
                <div className="fw-medium">{user.name}</div>
              </div>
            )}
            
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link 
                  to="/home" 
                  className="nav-link d-flex align-items-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="me-2" style={{ width: '16px', height: '16px' }} />
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/flashcards" 
                  className="nav-link d-flex align-items-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="me-2" style={{ width: '16px', height: '16px' }} />
                  Review Cards
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/addword" 
                  className="nav-link d-flex align-items-center py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="me-2" style={{ width: '16px', height: '16px' }} />
                  Add Card
                </Link>
              </li>
            </ul>
            
            {user && (
              <div className="mt-3 pt-3 border-top">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link 
                      to="/profile" 
                      className="nav-link d-flex align-items-center py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="me-2" style={{ width: '16px', height: '16px' }} />
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button 
                      onClick={() => {
                        onLogout?.();
                        setIsMenuOpen(false);
                      }}
                      className="nav-link d-flex align-items-center py-2 w-100 border-0 bg-transparent text-start"
                    >
                      <LogOut className="me-2" style={{ width: '16px', height: '16px' }} />
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};