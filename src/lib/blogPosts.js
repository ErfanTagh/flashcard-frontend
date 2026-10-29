// RecallCards blog posts. Content uses a small set of markers the BlogPost
// renderer understands:
//   "## "  / "### "        headings
//   "N. Title | body"      a numbered setup step
//   ">> text"              an example prompt, shown as a chat bubble
//   "+ text"               a reassurance item, shown with a check
//   "!> text"              a tip callout
//   "> text"               a blockquote
//   "- text"               a bullet
//   ```                    a fenced code block
//   **bold**  `code`       inline

export const BLOG_POSTS = [
  {
    id: "claude-connector",
    title: "Build Flashcard Decks Just by Asking Claude",
    excerpt:
      "RecallCards now works inside Claude. Hand it a document or just name a topic, and a full deck appears in your account. Here's how to connect it in a minute.",
    category: "AI Tools",
    readTime: "2 min read",
    date: "Oct 30, 2026",
    tags: ["AI", "Claude", "MCP", "How-To"],
    content: `
Tell Claude what you want to study, and a deck of flashcards appears in your RecallCards account in seconds. Hand it a PDF, paste your notes, or just name a topic — no typing cards out by hand.

## Set it up in 1 minute

1. Open connectors in Claude | Go to **Settings → Connectors** (in some versions **Customize → Connectors**) and click **Add custom connector**.
2. Add RecallCards | Name it RecallCards and paste the address \`https://recallcards.net/mcp\`.
3. Log in and allow | Sign in with your RecallCards account and click **Allow**.

## Then just ask

>> Show me my decks on RecallCards
>> Make 30 cards of the most useful Spanish phrases for me
>> Turn this PDF into a deck I can review later
>> Add "mitochondria → the powerhouse of the cell" to my Biology deck
>> How am I doing on my Spanish deck?

!> Mention "RecallCards" in your message, so Claude knows you mean your flashcards.

## Your data stays yours

+ Claude only sees and edits **your own** decks, and only after you click Allow
+ Claude never sees your password — you log in on RecallCards itself
+ Your study progress stays private to you
+ You can disconnect the connector anytime, from Claude's settings

## Using Claude Code?

Add the connector with one command, then type \`/mcp\` and sign in:

\`\`\`
claude mcp add --transport http --scope user recallcards https://recallcards.net/mcp
\`\`\`

## Questions

### Does it cost extra?

Not on RecallCards. Your Claude plan decides how much you can use Claude, and whether you can add custom connectors.

### What can Claude actually do?

Create and rename decks, add, edit and delete cards, record your reviews, read your progress, and share or publish decks — the same things you can do on the site, just by asking.

### What is a connector?

It gives Claude secure access to one app — here your RecallCards account — so it can manage your decks when you ask. It is built on MCP, the open standard Claude uses to connect to apps.
`,
  },
];

export const getBlogPosts = () => BLOG_POSTS;
export const getBlogPost = (id) => BLOG_POSTS.find((p) => p.id === id);
