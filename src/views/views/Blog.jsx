import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { getBlogPosts } from "@/lib/blogPosts";

export default function Blog() {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header band */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto max-w-4xl px-4 pt-12 pb-10 text-center sm:pt-16">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary">The RecallCards Blog</h1>
          <p className="mx-auto mt-3 max-w-xl text-base sm:text-lg text-muted-foreground">
            Tips and guides for studying smarter — and getting the most out of RecallCards.
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group flex flex-col rounded-2xl border bg-card p-6 no-underline shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{post.category}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
