import { Link } from "react-router-dom";
import { Home, BookOpen, BarChart3, Mail, Github, Sparkles } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">RecallCards</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Master your learning with interactive flashcards. Build knowledge, track progress, and achieve your goals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/home"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 no-underline"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/flashcards"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 no-underline"
                >
                  <BookOpen className="h-4 w-4" />
                  Review Cards
                </Link>
              </li>
              <li>
                <Link
                  to="/progress"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 no-underline"
                >
                  <BarChart3 className="h-4 w-4" />
                  Progress
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
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
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 no-underline"
                >
                  <Github className="h-4 w-4" />
                  Frontend Repo
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ErfanTagh/flashcard-backend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 no-underline"
                >
                  <Github className="h-4 w-4" />
                  Backend Repo
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://erfantagh.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 no-underline"
                >
                  <Mail className="h-4 w-4" />
                  Get in Touch
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} RecallCards. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://recallcards.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                Privacy Policy
              </a>
              <a
                href="https://recallcards.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
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
