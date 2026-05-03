import { Link, useLocation } from "wouter";
import { 
  useGetMarsTime, 
  useGetLightDelay, 
  useGetDustStorm,
  getGetMarsTimeQueryKey,
  getGetLightDelayQueryKey,
  getGetDustStormQueryKey,
} from "@workspace/api-client-react";
import { useEffect, useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  const { data: marsTime } = useGetMarsTime({ query: { queryKey: getGetMarsTimeQueryKey(), refetchInterval: 1000 } });
  const { data: lightDelay } = useGetLightDelay({ query: { queryKey: getGetLightDelayQueryKey(), refetchInterval: 30000 } });
  const { data: dustStorm } = useGetDustStorm({ query: { queryKey: getGetDustStormQueryKey(), refetchInterval: 60000 } });

  const isActive = (path: string) => location === path;

  const navLinks = [
    { href: "/bots", label: "Fleet" },
    { href: "/configure", label: "Config" },
    { href: "/missions", label: "Missions" },
    { href: "/adf", label: "ADF" },
    { href: "/registry", label: "Registry" },
    { href: "/dashboard", label: "Telemetry" },
    { href: "/marketplace", label: "Skills" },
    { href: "/roadmap", label: "Roadmap" },
  ];

  return (
    <div className="min-h-dvh flex flex-col font-sans bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {dustStorm?.active && (
        <div className="bg-destructive text-destructive-foreground px-4 py-1 text-xs font-mono font-bold tracking-widest text-center border-b border-destructive-foreground/20 uppercase flex justify-between items-center z-50 relative">
          <span className="hidden sm:inline">HAZARD DETECTED</span>
          <span className="truncate">{dustStorm.message} [OPACITY: {dustStorm.opacityTau.toFixed(1)}]</span>
          <span className="hidden sm:inline">HAZARD DETECTED</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="h-4 w-4 shrink-0 bg-primary rounded-none transition-colors duration-300 group-hover:bg-accent" />
            <span className="truncate font-sans text-lg font-black tracking-tighter uppercase text-foreground sm:text-xl">
              Mars<span className="text-primary">Founder</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-primary transition-colors ${
                  isActive(href) || (href === '/missions' && location.startsWith('/missions/'))
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {/* Status bar — hidden on small screens */}
            <div className="hidden sm:flex items-center gap-6 font-mono text-xs text-muted-foreground bg-card/50 border border-border px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>MTC {marsTime?.mtc || "00:00:00"}</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-primary">Δt</span>
                <span>{lightDelay?.formatted || "12m 47s"}</span>
              </div>
            </div>

            {/* Hamburger button — visible only on mobile */}
            <button
              type="button"
              className="lg:hidden flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 border border-border bg-card/50 transition-colors hover:border-primary"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
            >
              <span
                className={`block w-5 h-px bg-foreground transition-all duration-200 ${mobileNavOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
              />
              <span
                className={`block w-5 h-px bg-foreground transition-all duration-200 ${mobileNavOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-px bg-foreground transition-all duration-200 ${mobileNavOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
              />
            </button>
          </div>
        </div>
        
        {/* Scan line effect */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50 relative overflow-hidden">
          <div className="absolute inset-0 w-1/4 h-full bg-primary/80 blur-[2px] animate-[scan_4s_ease-in-out_infinite]" />
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile nav drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-background border-l border-border flex flex-col transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-sans font-black text-lg tracking-tighter uppercase text-foreground">
            Mars<span className="text-primary">Founder</span>
          </span>
          <button
            className="relative w-10 h-10 border border-border hover:border-primary transition-colors flex items-center justify-center"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <span className="absolute block w-5 h-px bg-foreground rotate-45" />
            <span className="absolute block w-5 h-px bg-foreground -rotate-45" />
          </button>
        </div>

        <nav className="flex flex-col flex-1 overflow-y-auto py-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-bold tracking-widest uppercase border-b border-border/50 transition-colors min-h-[56px] ${
                isActive(href) || (href === '/missions' && location.startsWith('/missions/'))
                  ? 'text-primary bg-primary/5 border-l-2 border-l-primary'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
              onClick={() => setMobileNavOpen(false)}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/waitlist"
            className="mx-6 mt-6 bg-primary text-primary-foreground px-6 py-4 font-bold font-mono uppercase tracking-widest text-center transition-colors hover:bg-accent border border-primary hover:border-accent min-h-[56px] flex items-center justify-center"
            onClick={() => setMobileNavOpen(false)}
          >
            Request Access
          </Link>
        </nav>

        <div className="px-6 py-4 border-t border-border font-mono text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>MTC {marsTime?.mtc || "00:00:00"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">Δt</span>
              <span>{lightDelay?.formatted || "12m 47s"}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card py-8 px-4 sm:px-6 mt-16 md:mt-24 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 font-mono text-xs text-muted-foreground">
          <div className="flex flex-col gap-2">
            <span className="font-sans font-black text-lg tracking-tighter uppercase text-foreground">
              Mars<span className="text-primary">Founder</span>
            </span>
            <p>ROBOTIC SURFACE OPERATIONS FOR MARS INFRASTRUCTURE.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-2 text-right">
            <span className="text-left text-foreground">STATUS</span>
            <span className="text-accent">NOMINAL</span>
            
            <span className="text-left text-foreground">CURRENT SOL</span>
            <span>{marsTime?.sol || "WAITING"}</span>
            
            <span className="text-left text-foreground">SEASON</span>
            <span>{marsTime?.season?.replace('_', ' ') || "UNKNOWN"}</span>
            
            <span className="text-left text-foreground">LIGHT DELAY</span>
            <span>{lightDelay?.seconds ? `${lightDelay.seconds}s (${lightDelay.trend})` : "CALCULATING"}</span>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 sm:mt-12 pt-4 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] font-mono text-muted-foreground/50">
          <span>© 2026 MARSFOUNDER INC.</span>
          <span>NOT AFFILIATED WITH NASA OR SPACEX.</span>
        </div>
      </footer>
    </div>
  );
}
