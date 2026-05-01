import { useListBots } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function BotsList() {
  const { data: bots, isLoading } = useListBots();

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col">
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Fleet Roster</h1>
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          Hardware deployed on the Martian surface. Ready for tasking.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-border p-6 h-[300px] flex flex-col justify-between">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24 rounded-none bg-border/50" />
                <Skeleton className="h-6 w-16 rounded-none bg-border/50" />
              </div>
              <div>
                <Skeleton className="h-10 w-3/4 rounded-none bg-border/50 mb-4" />
                <Skeleton className="h-4 w-full rounded-none bg-border/50" />
              </div>
            </div>
          ))}
        </div>
      ) : bots?.length === 0 ? (
        <div className="border border-border p-12 text-center font-mono text-muted-foreground bg-card/30">
          <p className="mb-4 text-primary">NO ASSETS DETECTED IN SECTOR.</p>
          <p className="text-xs">Either our telemetry is down or someone bought the entire fleet. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots?.map((bot) => (
            <Link key={bot.id} href={`/bots/${bot.id}`} className="group block bg-card border border-border hover:border-primary transition-colors duration-300 relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2" style={{ backgroundColor: bot.accentColor || 'var(--primary)' }} />
                    <span className="font-mono text-xs text-primary tracking-widest uppercase">{bot.role}</span>
                  </div>
                  <span className="font-mono text-sm text-foreground bg-secondary px-2 py-1">{bot.hourlyCredits} CR/HR</span>
                </div>
                
                <div className="mt-auto mb-6">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{bot.codename}</h2>
                  <p className="font-mono text-sm text-muted-foreground mt-2 min-h-[40px]">{bot.tagline}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50 mt-auto font-mono text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-1">MASS</span>
                    <span className="text-foreground">{bot.massKg} KG</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">POWER</span>
                    <span className="text-foreground">{bot.powerWatts} W</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">SLOTS</span>
                    <span className="text-foreground">{bot.toolSlots}T / {bot.addonSlots}A</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">RANGE</span>
                    <span className="text-foreground">{bot.rangeKm} KM</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/50 px-6 py-3 font-mono text-xs tracking-widest text-right border-t border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors flex justify-between items-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">ACCESS TERMINAL</span>
                <span>[{bot.id.substring(0, 8)}]</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}