const WORDMARK_FONT = "'Inter', 'Arial', sans-serif";

export function PoweredByBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-50 hover:opacity-70 transition-opacity duration-300">
      <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/70 whitespace-nowrap">
        Powered by
      </span>

      {/* xAI wordmark */}
      <svg
        viewBox="0 0 64 24"
        height="14"
        aria-label="xAI"
        fill="currentColor"
        className="text-foreground/80"
      >
        <text
          x="0"
          y="19"
          fontFamily={WORDMARK_FONT}
          fontWeight="800"
          fontSize="20"
          letterSpacing="-0.5"
        >
          xAI
        </text>
      </svg>

      <span className="w-px h-3 bg-border/50" aria-hidden="true" />

      {/* Grok wordmark */}
      <svg
        viewBox="0 0 72 24"
        height="14"
        aria-label="Grok"
        fill="currentColor"
        className="text-foreground/80"
      >
        <text
          x="0"
          y="19"
          fontFamily={WORDMARK_FONT}
          fontWeight="700"
          fontSize="20"
          letterSpacing="-0.5"
        >
          Grok
        </text>
      </svg>

      <span className="w-px h-3 bg-border/50" aria-hidden="true" />

      {/* SpaceX wordmark */}
      <svg
        viewBox="0 0 104 24"
        height="14"
        aria-label="SpaceX"
        fill="currentColor"
        className="text-foreground/80"
      >
        <text
          x="0"
          y="19"
          fontFamily={WORDMARK_FONT}
          fontWeight="800"
          fontSize="20"
          fontStyle="italic"
          letterSpacing="-0.5"
        >
          SpaceX
        </text>
      </svg>
    </div>
  );
}
