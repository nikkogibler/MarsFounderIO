import { Children, isValidElement, type ReactNode } from "react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import adfMarkdown from "../../../../documentation/Robotic Mars Pre-Deployment Program Projection.md?raw";

const SOURCE_LABEL = "documentation/Robotic Mars Pre-Deployment Program Projection.md";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripMarkdownDecorators(value: string) {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, "$1")
    .trim();
}

function extractText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (isValidElement<{ children?: ReactNode }>(child)) return extractText(child.props.children);
      return "";
    })
    .join("");
}

function getOutline(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = /^(##|####)\s+(.+)$/.exec(line.trim());
      if (!match) return [];

      const title = stripMarkdownDecorators(match[2]);
      if (match[1] === "####" && title !== "Works cited") return [];

      return [{ id: slugify(title), title }];
    });
}

const outline = getOutline(adfMarkdown);

export default function Adf() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl flex flex-col gap-10">
      <div className="border-b border-border pb-8 flex flex-col gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
          Autonomous Deployment Framework
        </span>
        <p className="font-mono text-sm leading-7 text-muted-foreground max-w-5xl">
          Rendered directly from {SOURCE_LABEL} so the site uses the repo document as the source of truth.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)] items-start">
        <aside className="xl:sticky xl:top-24 flex flex-col gap-4">
          <div className="border border-border bg-card/40 p-4 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">ADF Index</h2>
              <p className="mt-2 font-mono text-xs leading-6 text-muted-foreground uppercase tracking-wide">
                Pulled from the checked-in markdown document and rendered with the existing site theme.
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {outline.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="border border-border bg-card/30 px-6 py-8 md:px-8 md:py-10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => {
                const title = extractText(children);
                return (
                  <h1
                    id={slugify(title)}
                    className="mt-0 mb-5 text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground"
                  >
                    {children}
                  </h1>
                );
              },
              h2: ({ children }) => {
                const title = extractText(children);
                return (
                  <h2
                    id={slugify(title)}
                    className="mt-12 mb-5 border-t border-border pt-8 text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground"
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => {
                const title = extractText(children);
                return (
                  <h3
                    id={slugify(title)}
                    className="mt-8 mb-4 text-xl md:text-2xl font-black uppercase tracking-tight text-foreground"
                  >
                    {children}
                  </h3>
                );
              },
              h4: ({ children }) => {
                const title = extractText(children);
                return (
                  <h4
                    id={slugify(title)}
                    className="mt-10 mb-4 text-lg font-black uppercase tracking-widest text-primary"
                  >
                    {children}
                  </h4>
                );
              },
              p: ({ children }) => (
                <p className="my-4 font-mono text-sm leading-7 text-muted-foreground">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="my-5 flex flex-col gap-3 border-l border-primary/30 pl-5">{children}</ul>
              ),
              ol: ({ children }) => <ol className="my-5 list-decimal pl-6 space-y-3">{children}</ol>,
              li: ({ children }) => (
                <li className="font-mono text-sm leading-7 text-muted-foreground">{children}</li>
              ),
              strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary underline decoration-primary/30 underline-offset-4 hover:text-accent"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="my-6 overflow-x-auto border border-border bg-background/60">
                  <table className="min-w-full border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-secondary/30">{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
              th: ({ children }) => (
                <th className="border border-border px-3 py-2 text-left font-mono text-xs uppercase tracking-widest text-foreground">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-3 py-2 align-top font-mono text-xs leading-6 text-muted-foreground">
                  {children}
                </td>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt ?? ""} className="my-6 max-w-full border border-border bg-background/80 p-2" />
              ),
            }}
          >
            {adfMarkdown}
          </ReactMarkdown>
        </article>
      </div>

      <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Source: {SOURCE_LABEL}
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/missions/new"
            className="text-primary hover:text-accent font-mono text-sm tracking-widest underline decoration-primary/30 underline-offset-4 uppercase"
          >
            Create A Mission
          </Link>
          <Link
            href="/roadmap"
            className="text-muted-foreground hover:text-primary font-mono text-sm tracking-widest underline decoration-border underline-offset-4 uppercase"
          >
            Back To Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}