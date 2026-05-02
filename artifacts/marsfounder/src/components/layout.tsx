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
  const [now, setNow] = useState(Date.now());
  
  // Poll time
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: marsTime } = useGetMarsTime({ query: { queryKey: getGetMarsTimeQueryKey(), refetchInterval: 1000 } });
  const { data: lightDelay } = useGetLightDelay({ query: { queryKey: getGetLightDelayQueryKey(), refetchInterval: 30000 } });
  const { data: dustStorm } = useGetDustStorm({ query: { queryKey: getGetDustStormQueryKey(), refetchInterval: 60000 } });

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-dvh flex flex-col font-sans bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {dustStorm?.active && (
        <div className="bg-destructive text-destructive-foreground px-4 py-1 text-xs font-mono font-bold tracking-widest text-center border-b border-destructive-foreground/20 uppercase flex justify-between items-center z-50 relative">
          <span>HAZARD DETECTED</span>
          <span>{dustStorm.message} [OPACITY: {dustStorm.opacityTau.toFixed(1)}]</span>
          <span>HAZARD DETECTED</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-4 h-4 bg-primary rounded-none group-hover:bg-accent transition-colors duration-300" />
            <span className="font-sans font-black text-xl tracking-tighter uppercase text-foreground">
              Mars<span className="text-primary">Founder</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
            <Link href="/bots" className={`hover:text-primary transition-colors ${isActive('/bots') ? 'text-primary' : 'text-muted-foreground'}`}>Fleet</Link>
            <Link href="/configure" className={`hover:text-primary transition-colors ${isActive('/configure') ? 'text-primary' : 'text-muted-foreground'}`}>Config</Link>
            <Link href="/missions" className={`hover:text-primary transition-colors ${isActive('/missions') || location.startsWith('/missions/') ? 'text-primary' : 'text-muted-foreground'}`}>Missions</Link>
            <Link href="/adf" className={`hover:text-primary transition-colors ${isActive('/adf') ? 'text-primary' : 'text-muted-foreground'}`}>ADF</Link>
            <Link href="/registry" className={`hover:text-primary transition-colors ${isActive('/registry') ? 'text-primary' : 'text-muted-foreground'}`}>Registry</Link>
            <Link href="/dashboard" className={`hover:text-primary transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>Telemetry</Link>
            <Link href="/marketplace" className={`hover:text-primary transition-colors ${isActive('/marketplace') ? 'text-primary' : 'text-muted-foreground'}`}>Skills</Link>
            <Link href="/roadmap" className={`hover:text-primary transition-colors ${isActive('/roadmap') ? 'text-primary' : 'text-muted-foreground'}`}>Roadmap</Link>
          </nav>

          <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground bg-card/50 border border-border px-3 py-1.5">
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
        </div>
        
        {/* Scan line effect */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50 relative overflow-hidden">
          <div className="absolute inset-0 w-1/4 h-full bg-primary/80 blur-[2px] animate-[scan_4s_ease-in-out_infinite]" />
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card py-8 px-6 mt-24 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 font-mono text-xs text-muted-foreground">
          <div className="flex flex-col gap-2">
            <span className="font-sans font-black text-lg tracking-tighter uppercase text-foreground">
              Mars<span className="text-primary">Founder</span>
            </span>
            <p>ROBOTIC SURFACE OPERATIONS FOR MARS INFRASTRUCTURE.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-right">
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
        
        <div className="max-w-7xl mx-auto mt-12 pt-4 border-t border-border/50 flex justify-between items-center text-[10px] font-mono text-muted-foreground/50">
          <span>© 2026 MARSFOUNDER INC.</span>
          <span>NOT AFFILIATED WITH NASA OR SPACEX.</span>
        </div>
      </footer>
    </div>
  );
}
