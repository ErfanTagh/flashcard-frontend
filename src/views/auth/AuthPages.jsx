import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Inbox,
  KeyRound,
  Loader2,
  LogIn,
  MousePointerClick,
  Sparkles,
  UserPlus,
  XCircle,
} from "lucide-react";
import EmailSentAnimation from "@/Components/EmailSentAnimation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { setPostLoginDest } from "@/lib/postLogin";

/*
 * Sign in, sign up, confirm an email, reset a password.
 *
 * None of these pages navigates after signing someone in. App.jsx already
 * does that the moment it sees a user -- to a pending share, to the page that
 * asked for a login, or to the decks -- so doing it here as well would race it.
 */

const PASSWORD_MIN = 8;

// Round badge above the title, tinted by what the page is about.
const BADGE_TONES = {
  brand: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  error: "bg-destructive/10 text-destructive",
};

function AuthShell({ icon: Icon, badge, tone = "brand", title, subtitle, children, footer }) {
  // A screen that replaces a long form (signup -> "check your email") would
  // otherwise open at the form's scroll position, with its badge out of view.
  // "instant": the site sets scroll-behavior: smooth, and a smooth scroll gets
  // cut short by the layout change of the screen swapping in.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const titleTone =
    tone === "success" ? "text-emerald-600 dark:text-emerald-400" : tone === "error" ? "text-destructive" : "text-foreground";

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 px-4 py-12">
      <div className="w-full max-w-md motion-safe:animate-fade-in">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 no-underline">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-2xl font-bold text-primary">RecallCards</span>
        </Link>
        <div className="rounded-2xl border bg-card p-6 shadow-elevated sm:p-8">
          <div className="mb-6 text-center">
            {badge ||
              (Icon && (
                <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${BADGE_TONES[tone]}`}>
                  <Icon className="h-8 w-8" />
                </div>
              ))}
            <h1 className={`mb-2 text-2xl font-bold sm:text-3xl ${titleTone}`}>{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

function Notice({ tone = "error", children }) {
  const styles =
    tone === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-primary/30 bg-primary/10 text-foreground";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-4 rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}

function Field({ id, label, ...props }) {
  return (
    <div className="mb-4">
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
      </Label>
      <Input id={id} name={id} {...props} />
    </div>
  );
}

function SubmitButton({ busy, children }) {
  return (
    <Button type="submit" disabled={busy} className="mt-2 w-full">
      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

/** A path on this site, never a way off it (//host, a scheme, a backslash). */
function isSafePath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

/** Remember where a ?returnTo asked to go, for App.jsx to act on. */
function useReturnTo() {
  const [params] = useSearchParams();
  const raw = params.get("returnTo");
  const returnTo = isSafePath(raw) ? raw : null;
  useEffect(() => {
    if (returnTo) setPostLoginDest(returnTo);
  }, [returnTo]);
  return returnTo;
}

function withReturnTo(path, returnTo, reason) {
  const query = new URLSearchParams();
  if (returnTo) query.set("returnTo", returnTo);
  if (reason) query.set("reason", reason);
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

// Why a signed-out visitor was sent here, said above the form.
const REASONS = {
  deck: "Create a free account to see this deck. You'll go straight back to it.",
  explore: "Create a free account to browse decks other learners have shared.",
  add: "Create a free account to add this deck. You'll come straight back and it's added for you.",
};

// --- Continue with Google ----------------------------------------------------

let providersPromise = null;
function useGoogleEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    providersPromise ??= fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
    let live = true;
    providersPromise.then((p) => live && setEnabled(Boolean(p?.google)));
    return () => {
      live = false;
    };
  }, []);
  return enabled;
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** A full-page trip to Google and back, via the API (accounts.py). */
function GoogleSignIn({ returnTo, label = "Continue with Google" }) {
  const enabled = useGoogleEnabled();
  if (!enabled) return null;
  const href = `/api/auth/google/start${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ""}`;
  return (
    <>
      <Button asChild variant="outline" className="h-11 w-full gap-3 bg-background text-foreground">
        <a href={href} className="no-underline">
          <GoogleMark />
          {label}
        </a>
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}

const GOOGLE_ERRORS = {
  google: "Google sign-in didn't work. Please try again.",
  google_cancelled: "Google sign-in was cancelled.",
  google_unavailable: "Google sign-in isn't available right now. Use your email and password instead.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
};

// --- Check your inbox -----------------------------------------------------

const NEXT_STEPS = [
  { icon: Inbox, text: "Open the email from RecallCards" },
  { icon: MousePointerClick, text: "Click the link to activate your account" },
  { icon: Sparkles, text: "You're signed in and ready to study" },
];

function CheckInbox({ email, title = "Check your email!", message, next }) {
  const { resendVerification } = useAuth();
  const [state, setState] = useState({ busy: false, info: "", error: "" });

  const resend = async () => {
    setState({ busy: true, info: "", error: "" });
    try {
      await resendVerification(email, next);
      setState({ busy: false, info: "A new link is on its way.", error: "" });
    } catch (error) {
      setState({ busy: false, info: "", error: error.message });
    }
  };

  return (
    <AuthShell
      badge={<EmailSentAnimation />}
      title={<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{title}</span>}
      subtitle={
        message || (
          <>
            We sent a link to <strong className="break-all text-foreground">{email}</strong>.
          </>
        )
      }
    >
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
        <p className="mb-3 text-sm font-semibold text-foreground">What's next?</p>
        <ol className="m-0 list-none space-y-2.5 p-0">
          {NEXT_STEPS.map(({ icon: StepIcon, text }, index) => (
            <li
              key={text}
              className="flex items-center gap-3 text-sm text-foreground motion-safe:animate-fade-in"
              style={{ animationDelay: `${300 + index * 150}ms`, animationFillMode: "both" }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <StepIcon className="h-3.5 w-3.5" />
              </span>
              {text}
            </li>
          ))}
        </ol>
      </div>

      <p className="mb-4 text-center text-sm text-muted-foreground">
        Didn't get it? It can take a minute. Check your spam folder too.
      </p>
      {state.info && <Notice tone="info">{state.info}</Notice>}
      {state.error && <Notice>{state.error}</Notice>}

      <Button asChild size="lg" className="mb-3 w-full">
        <Link to="/login">Go to sign in</Link>
      </Button>
      <Button variant="outline" className="w-full" disabled={state.busy} onClick={resend}>
        {state.busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send the link again
      </Button>
    </AuthShell>
  );
}

// --- Sign in ----------------------------------------------------------------

export function Login() {
  const { signIn } = useAuth();
  const returnTo = useReturnTo();
  const [params] = useSearchParams();
  const reason = params.get("reason");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => GOOGLE_ERRORS[params.get("error")] || "");
  const [unverified, setUnverified] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      if (err.code === "email_not_verified") {
        setUnverified(true);
      } else {
        setError(err.message);
      }
      setBusy(false);
    }
  };

  if (unverified) {
    return (
      <CheckInbox
        email={email.trim()}
        next={returnTo}
        title="Confirm your email first"
        message={
          <>
            Your account for <strong className="break-all">{email.trim()}</strong> isn't activated yet. Open the link
            we emailed you, or ask for a new one.
          </>
        }
      />
    );
  }

  return (
    <AuthShell
      icon={LogIn}
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New to RecallCards?{" "}
          <Link to={withReturnTo("/signup", returnTo, reason)} className="font-medium text-primary">
            Create an account
          </Link>
        </>
      }
    >
      {REASONS[reason] && !error && <Notice tone="info">{REASONS[reason]}</Notice>}
      {error && <Notice>{error}</Notice>}
      <GoogleSignIn returnTo={returnTo} />
      <form onSubmit={submit} noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="-mt-2 mb-4 text-right">
          <Link to="/forgot-password" className="text-sm text-primary">
            Forgot password?
          </Link>
        </div>
        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>
    </AuthShell>
  );
}

// --- Sign up ----------------------------------------------------------------

export function Signup() {
  const { signUp } = useAuth();
  const returnTo = useReturnTo();
  const [params] = useSearchParams();
  const reason = params.get("reason");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < PASSWORD_MIN) {
      setError(`Use at least ${PASSWORD_MIN} characters for your password.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), password, name.trim(), returnTo);
      setSentTo(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) return <CheckInbox email={sentTo} next={returnTo} />;

  return (
    <AuthShell
      icon={UserPlus}
      title="Create your account"
      subtitle="Free. We'll email you a link to activate it."
      footer={
        <>
          Already have an account?{" "}
          <Link to={withReturnTo("/login", returnTo, reason)} className="font-medium text-primary">
            Sign in
          </Link>
        </>
      }
    >
      {REASONS[reason] && <Notice tone="info">{REASONS[reason]}</Notice>}
      {error && <Notice>{error}</Notice>}
      <GoogleSignIn returnTo={returnTo} label="Sign up with Google" />
      <form onSubmit={submit} noValidate>
        <Field
          id="name"
          label="Name (optional)"
          autoComplete="given-name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label={`Password (at least ${PASSWORD_MIN} characters)`}
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}

// --- The emailed activation link -------------------------------------------

export function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token");
  const next = params.get("next");
  const [state, setState] = useState(token ? "working" : "failed");
  const [error, setError] = useState(token ? "" : "This link is missing its code.");
  const started = useRef(false);

  useEffect(() => {
    // Once: the link is single use, and StrictMode runs effects twice.
    if (!token || started.current) return;
    started.current = true;
    // Where they were going when they signed up -- a deck link, say. Carried
    // in the email itself, so it works on whichever device opens it.
    if (isSafePath(next)) setPostLoginDest(next);
    verifyEmail(token)
      .then(() => setState("done"))
      .catch((err) => {
        setError(err.message);
        setState("failed");
      });
  }, [token, verifyEmail]);

  if (state === "working") {
    return (
      <AuthShell
        badge={
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
        title="Activating your account"
        subtitle="One moment while we confirm your email…"
      />
    );
  }

  if (state === "done") {
    return (
      <AuthShell
        badge={
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 motion-safe:animate-pop-in dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        }
        tone="success"
        title="Email confirmed!"
        subtitle="Your account is active and you're signed in."
      >
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Taking you to your decks…
        </div>
        <Button asChild className="w-full">
          <Link to="/collections">Go to my decks</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon={XCircle}
      tone="error"
      title="This link didn't work"
      footer={
        <>
          Already activated? <Link to="/login" className="font-medium text-primary">Sign in</Link>
        </>
      }
    >
      <p className="mb-4 text-center text-sm">{error}</p>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Links work once and expire after two days. Sign in with your email and password and we'll offer to send a new
        one.
      </p>
      <Button asChild className="w-full">
        <Link to="/login">Sign in</Link>
      </Button>
    </AuthShell>
  );
}

// --- Forgot / reset password --------------------------------------------------

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      icon={KeyRound}
      badge={sent ? <EmailSentAnimation /> : undefined}
      title={sent ? "Check your email!" : "Reset your password"}
      subtitle={sent ? undefined : "We'll email you a link to choose a new one."}
      footer={
        <>
          Remembered it? <Link to="/login" className="font-medium text-primary">Sign in</Link>
        </>
      }
    >
      {sent ? (
        <Notice tone="info">
          If there's an account for <strong className="break-all">{email.trim()}</strong>, a reset link is on its way.
          It works for one hour.
        </Notice>
      ) : (
        <>
          {error && <Notice>{error}</Notice>}
          <form onSubmit={submit} noValidate>
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <SubmitButton busy={busy}>Send reset link</SubmitButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(token ? "" : "This link is missing its code. Ask for a new one.");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < PASSWORD_MIN) {
      setError(`Use at least ${PASSWORD_MIN} characters for your password.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell
      icon={KeyRound}
      title="Choose a new password"
      footer={
        <Link to="/forgot-password" className="font-medium text-primary">
          Need a new link?
        </Link>
      }
    >
      {error && <Notice>{error}</Notice>}
      <form onSubmit={submit} noValidate>
        <Field
          id="password"
          label={`New password (at least ${PASSWORD_MIN} characters)`}
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          id="confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <SubmitButton busy={busy} disabled={!token}>
          Save and sign in
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

// --- Back from Google ----------------------------------------------------------

export function OAuthCallback() {
  const { exchangeGoogleCode } = useAuth();
  const [params] = useSearchParams();
  const code = params.get("code");
  const next = params.get("next");
  const [error, setError] = useState(code ? "" : "This sign-in link is incomplete.");
  const started = useRef(false);

  useEffect(() => {
    // Once: the code works a single time, and StrictMode runs effects twice.
    if (!code || started.current) return;
    started.current = true;
    if (isSafePath(next)) setPostLoginDest(next);
    // Keep the one-time code out of the address bar and history.
    window.history.replaceState({}, document.title, "/auth/callback");
    exchangeGoogleCode(code).catch((err) => setError(err.message));
  }, [code, next, exchangeGoogleCode]);

  if (error) {
    return (
      <AuthShell icon={XCircle} tone="error" title="Google sign-in didn't work">
        <p className="mb-4 text-center text-sm">{error}</p>
        <Button asChild className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge={
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
      title="Signing you in"
      subtitle="One moment…"
    />
  );
}
