import { Link } from "wouter";

export default function Roadmap() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-16 border-b border-border pb-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Roadmap</h1>
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          What's shipped. What's next. What's eventually.
        </p>
      </div>

      <div className="flex flex-col gap-16 border-l-2 border-border pl-8 relative">
        
        {/* Shipped */}
        <div className="relative">
          <div className="absolute -left-[35px] top-1 w-4 h-4 bg-primary border-4 border-background rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">SHIPPED // V1.0</h2>
          
          <div className="flex flex-col gap-6">
            <div className="bg-card/50 border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Fleet Telemetry Dashboard</h3>
              <p className="font-mono text-sm text-muted-foreground">Live operations dashboard. Track active missions, bot status, and credit burn across all sectors.</p>
            </div>
            
            <div className="bg-card/50 border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Dynamic Loadout Configurator</h3>
              <p className="font-mono text-sm text-muted-foreground">Swap drills for welders. Live power and mass calculation to ensure your bot doesn't brick itself mid-mission.</p>
            </div>

            <div className="bg-card/50 border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              <h3 className="font-sans font-bold uppercase text-lg mb-2">AI Mission Feasibility</h3>
              <p className="font-mono text-sm text-muted-foreground">Simulate operations against environmental parameters before burning credits. We tell you if it's a suicide run.</p>
            </div>
          </div>
        </div>

        {/* Up Next */}
        <div className="relative opacity-80">
          <div className="absolute -left-[35px] top-1 w-4 h-4 bg-accent border-4 border-background rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6 text-accent">UP NEXT // V1.1</h2>
          
          <div className="flex flex-col gap-6">
            <div className="bg-card/30 border border-border border-dashed p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Real-Time Video Feed</h3>
              <p className="font-mono text-sm text-muted-foreground">Latency is still a physics problem, but we're rolling out low-framerate direct visual uplinks from active operations.</p>
            </div>
            
            <div className="bg-card/30 border border-border border-dashed p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">ElevenLabs Voice Integration</h3>
              <p className="font-mono text-sm text-muted-foreground">Real synthetic voices land when we trust 'em. We're testing the integration to ensure bots don't sound like generic corporate assistents when reporting a drill failure.</p>
            </div>
          </div>
        </div>

        {/* Eventually */}
        <div className="relative opacity-60">
          <div className="absolute -left-[35px] top-1 w-4 h-4 bg-muted-foreground border-4 border-background rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">EVENTUALLY // Q3 2026</h2>
          
          <div className="flex flex-col gap-6">
            <div className="bg-background border border-border p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Skill Marketplace</h3>
              <p className="font-mono text-sm text-muted-foreground">Over-the-air behavioral upgrades. Buy custom mining algorithms or surveying scripts from other founders. We take a cut, obviously.</p>
            </div>
            
            <div className="bg-background border border-border p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Multi-Bot Orchestration</h3>
              <p className="font-mono text-sm text-muted-foreground">Coordinate squads of bots on a single mission parameter. Have a surveyor scout ahead while a constructor clears the path.</p>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-24 pt-8 border-t border-border flex justify-between items-center">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          PLANS SUBJECT TO CHANGE BASED ON MARTIAN WEATHER AND FUNDING.
        </div>
        <Link href="/missions/new" className="text-primary hover:text-accent font-mono text-sm tracking-widest underline decoration-primary/30 underline-offset-4 uppercase">
          IGNORE THIS AND LAUNCH A MISSION
        </Link>
      </div>
    </div>
  );
}