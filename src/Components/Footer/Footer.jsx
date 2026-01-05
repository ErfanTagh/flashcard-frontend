import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-auto w-full">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">RecallCards</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Master your learning with interactive flashcards. Build knowledge, track progress, and achieve your goals.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-base">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/home"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    to="/progress"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Progress
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-base">
                Resources
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://recallcards.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ErfanTagh/flashcard-frontend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Frontend Repo
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ErfanTagh/flashcard-backend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Backend Repo
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-base">
                Contact
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://erfantagh.github.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    Get in Touch
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Completely separate from main content */}
      <div className="border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>© {currentYear} RecallCards. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://recallcards.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors no-underline"
              >
                Privacy Policy
              </a>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://recallcards.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors no-underline"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;