import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, FileText, BookOpen } from "lucide-react";
import { CLAUDE_MARK } from "@/Components/claudeMark";

/**
 * Homepage demo of the RecallCards Claude connector: the user hands Claude a
 * document, types a prompt, the connector's tools run, and a deck fills with
 * cards beside the chat. Loops while on screen; shows the finished state
 * without motion when the viewer prefers reduced motion.
 */

const DOC = "Essential Spanish Phrases.pdf";
const DECK = "Essential Spanish Phrases";
const PROMPT = "Turn the key phrases in this into a RecallCards deck so I can review them later.";
const REPLY =
  "Done! I pulled 6 key phrases from your document into a new “Essential Spanish Phrases” deck. Open RecallCards whenever you want to start reviewing.";

const CARDS = [
  { term: "Buenos días", def: "Good morning" },
  { term: "¿Cómo estás?", def: "How are you?" },
  { term: "Por favor", def: "Please" },
  { term: "Gracias", def: "Thank you" },
  { term: "¿Cuánto cuesta?", def: "How much is it?" },
  { term: "¿Dónde está el baño?", def: "Where's the bathroom?" },
];

const PHASES = ["typing", "sent", "tool1", "tool1done", "tool2", "updated", "reply"];
const DURATION = {
  typing: 450,
  sent: 700,
  tool1: 950,
  tool1done: 350,
  tool2: 1300,
  updated: 1500,
  reply: 5200,
};
const TYPE_MS = 34;

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function ClaudeMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={CLAUDE_MARK} />
    </svg>
  );
}

/** The little RecallCards logo mark used in the tool rows + deck window. */
function BrandMark({ className }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent ${className}`}>
      <BookOpen className="h-3.5 w-3.5 text-white" />
    </span>
  );
}

export function ClaudeConnectorDemo() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [reduced] = useState(prefersReducedMotion);
  const [phase, setPhase] = useState(reduced ? "reply" : "typing");
  const [typed, setTyped] = useState(reduced ? Number.MAX_SAFE_INTEGER : 0);

  // Run only while on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) setVisible(true);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    let id;
    if (phase === "typing" && typed < PROMPT.length) {
      id = window.setTimeout(() => setTyped((n) => n + 1), TYPE_MS);
    } else {
      id = window.setTimeout(() => {
        const next = PHASES.indexOf(phase) + 1;
        if (next < PHASES.length) {
          setPhase(PHASES[next]);
        } else {
          setTyped(0);
          setPhase("typing");
        }
      }, DURATION[phase]);
    }
    return () => window.clearTimeout(id);
  }, [phase, typed, visible, reduced]);

  const at = (p) => PHASES.indexOf(phase) >= PHASES.indexOf(p);
  const typing = phase === "typing";
  const updated = at("updated");

  return (
    <section ref={sectionRef} className="w-full">
      {/* Heading */}
      <div className="mx-auto mb-6 sm:mb-10 max-w-2xl text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 py-1 pl-1 pr-3 text-sm font-medium text-foreground">
          <span className="rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            New
          </span>
          <ClaudeMark className="h-4 w-4 fill-[#D97757]" />
          Works with Claude
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Turn anything into a deck, just by asking Claude
        </h2>
        <p className="mt-3 text-sm sm:text-lg text-muted-foreground">
          Connect RecallCards to Claude once. Hand it a document and say what you want —
          your decks and cards appear on their own.
        </p>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
        {/* --- Claude chat --- */}
        <div className="flex h-[540px] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl lg:h-auto lg:min-h-[440px]">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ClaudeMark className="h-5 w-5 fill-[#D97757]" />
              Claude
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              RecallCards connected
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-5 py-5 lg:justify-start">
            {at("sent") && (
              <div className="ml-auto max-w-[88%] space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* The attached document */}
                <div className="ml-auto flex w-fit items-center gap-2.5 rounded-xl border bg-muted/60 px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-[13px] font-medium text-foreground">{DOC}</div>
                    <div className="text-[11px] text-muted-foreground">PDF document</div>
                  </div>
                </div>
                {/* The prompt */}
                <div className="rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5 text-[15px] text-foreground">
                  {PROMPT}
                </div>
              </div>
            )}

            {at("tool1") && <ToolRow name="create_collection" done={at("tool1done")} />}
            {at("tool2") && <ToolRow name="add_card" done={updated} />}

            {/* Phones: the deck window is hidden, so show the result inline. */}
            {updated && (
              <div className="rounded-xl border bg-muted/40 p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-500 lg:hidden">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <BrandMark className="h-5 w-5" />
                    {DECK}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    6 cards
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CARDS.slice(0, 4).map((card) => (
                    <div key={card.term} className="rounded-lg border bg-card px-2.5 py-1.5">
                      <div className="truncate text-[12px] font-semibold text-primary">{card.term}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{card.def}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {at("reply") && (
              <div className="flex gap-2.5 text-[15px] leading-relaxed text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ClaudeMark className="mt-1 h-4 w-4 shrink-0 fill-[#D97757]" />
                <p>{REPLY}</p>
              </div>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex min-h-[48px] items-center rounded-xl border px-4 py-2.5 text-[15px]">
              {typing ? (
                <span className="text-foreground">
                  {PROMPT.slice(0, typed)}
                  <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-foreground" />
                </span>
              ) : (
                <span className="text-muted-foreground">Reply to Claude…</span>
              )}
            </div>
          </div>
        </div>

        {/* --- The deck on RecallCards (larger screens) --- */}
        <div className="hidden min-h-[440px] flex-col overflow-hidden rounded-2xl border bg-card shadow-xl lg:flex">
          <div className="flex items-center gap-2 border-b bg-muted/40 px-5 py-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
              recallcards.net
            </span>
          </div>

          <div className="relative flex-1 px-6 py-6">
            {/* Deck header */}
            <div className="flex items-center gap-3">
              <BrandMark className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xl font-bold text-foreground">{DECK}</span>
                  {updated && (
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 animate-in fade-in zoom-in-90 duration-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900">
                      <Check className="h-3 w-3" strokeWidth={3} />
                      Added via Claude
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {updated ? "6 cards · by you" : "Waiting for cards…"}
                </div>
              </div>
            </div>

            <div className="my-5 h-px bg-border" />

            {/* Cards appear here, staggered */}
            {updated ? (
              <div className="grid grid-cols-2 gap-3">
                {CARDS.map((card, i) => (
                  <div
                    key={card.term}
                    className="rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5 px-3.5 py-3 animate-in fade-in zoom-in-95 fill-mode-both"
                    style={{ animationDelay: `${i * 110}ms`, animationDuration: "500ms" }}
                  >
                    <div className="truncate text-[15px] font-bold text-primary">{card.term}</div>
                    <div className="mt-0.5 truncate text-[13px] text-muted-foreground">{card.def}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {CARDS.map((_, i) => (
                  <div key={i} className="h-[62px] rounded-xl border border-dashed bg-muted/30" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolRow({ name, done }) {
  return (
    <div className="flex w-fit items-center gap-2.5 rounded-xl border bg-muted/40 px-3 py-2 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BrandMark className="h-6 w-6" />
      <span className="font-semibold text-foreground">RecallCards</span>
      <span className="font-mono text-[13px] text-muted-foreground">{name}</span>
      {done ? (
        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
