import { Link } from "react-router-dom";
import { BookOpen, Github, Globe, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto w-full">
      <div className="container mx-auto max-w-6xl px-6 lg:px-8">
        <div className="py-12">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-10">
            {/* Brand Section */}
            <div className="lg:max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-slate-900">RecallCards</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
                Master your learning with interactive flashcards. Build knowledge, track progress, and achieve your goals.
              </p>
            </div>

            {/* Links Columns */}
            <div className="grid grid-cols-3 gap-16">
              {/* Quick Links */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      to="/home"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/collections"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                    >
                      Collections
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/progress"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                    >
                      Progress
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  Resources
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="https://recallcards.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/ErfanTagh/flashcard-frontend"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      Frontend Repo
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/ErfanTagh/flashcard-backend"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      Backend Repo
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  Contact
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="https://erfantagh.github.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Get in Touch
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200">
        <div className="container mx-auto max-w-6xl px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>© {currentYear} RecallCards. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a
                href="https://recallcards.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors no-underline"
              >
                Privacy Policy
              </a>
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