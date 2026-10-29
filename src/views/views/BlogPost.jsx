import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Lightbulb, BookOpen } from "lucide-react";
import { getBlogPost } from "@/lib/blogPosts";
import PublicNav from "@/Components/PublicNav";

/** Inline **bold** and `code`. */
function renderInline(text, keyBase) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyBase}-${i}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.length > 1 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${keyBase}-${i}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/** Parse the lightweight markup into React elements. */
function renderContent(content) {
  const lines = content.trim().split("\n");
  const out = [];
  let steps = null;      // numbered setup steps
  let prompts = null;    // >> example prompts
  let checks = null;     // + reassurance items
  let bullets = null;    // - list
  let code = null;       // ``` fenced block

  const flush = () => {
    if (steps) {
      out.push(
        <ol key={`steps-${out.length}`} className="my-6 space-y-3">
          {steps.map((s, i) => {
            const [title, ...rest] = s.split(" | ");
            return (
              <li key={i} className="flex gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{renderInline(title, `st-${i}`)}</div>
                  {rest.length > 0 && (
                    <div className="mt-0.5 text-[15px] leading-relaxed text-muted-foreground">
                      {renderInline(rest.join(" | "), `sb-${i}`)}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      );
      steps = null;
    }
    if (prompts) {
      out.push(
        <div key={`prompts-${out.length}`} className="my-6 space-y-2.5">
          {prompts.map((p, i) => (
            <div key={i} className="rounded-2xl rounded-bl-md border border-primary/20 bg-primary/5 px-4 py-2.5 text-[15px] text-foreground">
              {renderInline(p, `pr-${i}`)}
            </div>
          ))}
        </div>
      );
      prompts = null;
    }
    if (checks) {
      out.push(
        <ul key={`checks-${out.length}`} className="my-6 space-y-3">
          {checks.map((c, i) => (
            <li key={i} className="flex gap-3 text-[16px] sm:text-[17px] leading-relaxed text-muted-foreground">
              <Check className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={2.5} />
              <span>{renderInline(c, `ck-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
      checks = null;
    }
    if (bullets) {
      out.push(
        <ul key={`list-${out.length}`} className="my-5 list-disc space-y-2 pl-6 text-[16px] leading-relaxed text-muted-foreground marker:text-primary">
          {bullets.map((b, i) => <li key={i}>{renderInline(b, `li-${i}`)}</li>)}
        </ul>
      );
      bullets = null;
    }
  };

  lines.forEach((line, index) => {
    const t = line.trim();

    if (t.startsWith("```")) {
      if (code === null) {
        flush();
        code = [];
      } else {
        out.push(
          <pre key={`code-${index}`} className="my-6 overflow-x-auto rounded-xl border bg-foreground/[0.04] p-4 text-sm">
            <code className="font-mono text-foreground">{code.join("\n")}</code>
          </pre>
        );
        code = null;
      }
      return;
    }
    if (code !== null) {
      code.push(line.replace(/^\s{0,4}/, ""));
      return;
    }

    if (/^\d+\.\s/.test(t)) {
      if (!steps) { flush(); steps = []; }
      steps.push(t.replace(/^\d+\.\s/, ""));
      return;
    }
    if (t.startsWith(">> ")) {
      if (!prompts) { flush(); prompts = []; }
      prompts.push(t.slice(3));
      return;
    }
    if (t.startsWith("+ ")) {
      if (!checks) { flush(); checks = []; }
      checks.push(t.slice(2));
      return;
    }
    if (t.startsWith("- ")) {
      if (!bullets) { flush(); bullets = []; }
      bullets.push(t.slice(2));
      return;
    }

    flush();

    if (t === "") return;
    if (t.startsWith("## ")) {
      out.push(<h2 key={index} className="mt-12 mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t.slice(3)}</h2>);
    } else if (t.startsWith("### ")) {
      out.push(<h3 key={index} className="mt-8 mb-2 text-lg sm:text-xl font-bold text-foreground">{t.slice(4)}</h3>);
    } else if (t.startsWith("!> ")) {
      out.push(
        <div key={index} className="my-6 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="m-0 text-[15px] leading-relaxed text-foreground">{renderInline(t.slice(3), `tip-${index}`)}</p>
        </div>
      );
    } else if (t.startsWith("> ")) {
      out.push(
        <blockquote key={index} className="my-6 border-l-4 border-primary/40 pl-4 text-[17px] italic text-muted-foreground">
          {renderInline(t.slice(2), `bq-${index}`)}
        </blockquote>
      );
    } else {
      out.push(
        <p key={index} className="my-4 text-[16px] sm:text-[17px] leading-relaxed text-muted-foreground">
          {renderInline(t, `p-${index}`)}
        </p>
      );
    }
  });

  flush();
  return out;
}

export default function BlogPost() {
  const { id } = useParams();
  const post = getBlogPost(id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
      <PublicNav />
        <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-primary no-underline hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      {/* Header band */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto max-w-3xl px-4 pt-10 pb-8 sm:pt-14">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{post.category}</span>
            <span>·</span><span>{post.date}</span>
            <span>·</span><span>{post.readTime}</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        </div>
      </div>

      {/* Body */}
      <article className="container mx-auto max-w-3xl px-4 py-8 sm:py-10">
        {renderContent(post.content)}

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <BookOpen className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="m-0 font-semibold text-foreground">Ready to try it?</p>
              <p className="m-0 text-sm text-muted-foreground">Add the connector in Claude and ask for your first deck.</p>
            </div>
          </div>
          <Link to="/" className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90">
            Open RecallCards
          </Link>
        </div>

        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}