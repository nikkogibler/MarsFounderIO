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
    <div className="container mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6">
      <div className="border-b border-border pb-8 flex flex-col gap-4">
        <span className="wrap-break-word font-mono text-[11px] uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.35em]">
          Autonomous Deployment Framework
        </span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)] items-start">
        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24">
          <div className="flex min-w-0 flex-col gap-4 border border-border bg-card/40 p-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">ADF Index</h2>
            </div>

            <nav className="flex flex-col gap-2">
              {outline.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="wrap-break-word font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0 overflow-hidden border border-border bg-card/30 px-4 py-8 sm:px-6 md:px-8 md:py-10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => {
                const title = extractText(children);
                return (
                  <h1
                    id={slugify(title)}
                    className="mt-0 mb-5 wrap-break-word text-3xl font-black uppercase tracking-tighter text-foreground sm:text-4xl md:text-6xl"
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
                    className="mt-12 mb-5 wrap-break-word border-t border-border pt-8 text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl"
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
                    className="mt-8 mb-4 wrap-break-word text-xl font-black uppercase tracking-tight text-foreground md:text-2xl"
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
                    className="mt-10 mb-4 wrap-break-word text-lg font-black uppercase tracking-widest text-primary"
                  >
                    {children}
                  </h4>
                );
              },
              p: ({ children }) => (
                <p className="my-4 wrap-break-word font-mono text-sm leading-7 text-muted-foreground">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="my-5 flex flex-col gap-3 border-l border-primary/30 pl-5">{children}</ul>
              ),
              ol: ({ children }) => <ol className="my-5 list-decimal pl-6 space-y-3">{children}</ol>,
              li: ({ children }) => (
                <li className="wrap-break-word font-mono text-sm leading-7 text-muted-foreground">{children}</li>
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
                <td className="wrap-break-word border border-border px-3 py-2 align-top font-mono text-xs leading-6 text-muted-foreground">
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

      <div className="flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
        <p className="wrap-break-word font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Source: {SOURCE_LABEL}
        </p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/missions/new"
            className="font-mono text-sm uppercase tracking-widest text-primary underline decoration-primary/30 underline-offset-4 hover:text-accent"
          >
            Create A Mission
          </Link>
          <Link
            href="/roadmap"
            className="font-mono text-sm uppercase tracking-widest text-muted-foreground underline decoration-border underline-offset-4 hover:text-primary"
          >
            Back To Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}