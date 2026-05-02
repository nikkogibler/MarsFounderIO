import { Link } from "wouter";

export default function Roadmap() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-16 border-b border-border pb-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Roadmap</h1>
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          Current platform scope and planned capability expansion.
        </p>
      </div>

      <div className="flex flex-col gap-16 border-l-2 border-border pl-8 relative">
        
        {/* Shipped */}
        <div className="relative">
          <div className="absolute -left-8.75 top-1 w-4 h-4 bg-primary border-4 border-background rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">SHIPPED // V1.0</h2>
          
          <div className="flex flex-col gap-6">
            <div className="bg-card/50 border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-primary/10 to-transparent pointer-events-none" />
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Fleet Telemetry Dashboard</h3>
              <p className="font-mono text-sm text-muted-foreground">Operations dashboard for active missions, asset status, utilization, and credit exposure.</p>
            </div>
            
            <div className="bg-card/50 border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-primary/10 to-transparent pointer-events-none" />
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Dynamic Loadout Configurator</h3>
              <p className="font-mono text-sm text-muted-foreground">Chassis configuration with live mass, power, slot, and operating-cost calculations.</p>
            </div>

            <div className="bg-card/50 border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-primary/10 to-transparent pointer-events-none" />
              <h3 className="font-sans font-bold uppercase text-lg mb-2">AI Mission Feasibility</h3>
              <p className="font-mono text-sm text-muted-foreground">Feasibility analysis for mission duration, energy demand, expected cost, and operational risk.</p>
            </div>
          </div>
        </div>

        {/* Up Next */}
        <div className="relative opacity-80">
          <div className="absolute -left-8.75 top-1 w-4 h-4 bg-accent border-4 border-background rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 text-accent">UP NEXT // V1.1</h2>
          
          <div className="flex flex-col gap-6">
            <div className="bg-card/30 border border-border border-dashed p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Real-Time Video Feed</h3>
              <p className="font-mono text-sm text-muted-foreground">Low-framerate visual uplinks from active operations, adjusted for Earth-Mars communications latency.</p>
            </div>
            
            <div className="bg-card/30 border border-border border-dashed p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">ElevenLabs Voice Integration</h3>
              <p className="font-mono text-sm text-muted-foreground">Synthetic voice output for asset briefings, status reports, and mission-control summaries.</p>
            </div>
          </div>
        </div>

        {/* Eventually */}
        <div className="relative opacity-60">
          <div className="absolute -left-8.75 top-1 w-4 h-4 bg-muted-foreground border-4 border-background rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">EVENTUALLY // Q3 2026</h2>
          
          <div className="flex flex-col gap-6">
            <div className="bg-background border border-border p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Skill Marketplace</h3>
              <p className="font-mono text-sm text-muted-foreground">Partner-distributed autonomy packages for navigation, mining, survey, safety, and repair workflows.</p>
            </div>
            
            <div className="bg-background border border-border p-6">
              <h3 className="font-sans font-bold uppercase text-lg mb-2">Multi-Bot Orchestration</h3>
              <p className="font-mono text-sm text-muted-foreground">Coordinated mission plans that assign multiple asset classes to a shared surface objective.</p>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-24 pt-8 border-t border-border flex justify-between items-center">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          ROADMAP SUBJECT TO TECHNICAL VALIDATION, PARTNER DEMAND, AND SURFACE CONDITIONS.
        </div>
        <Link href="/missions/new" className="text-primary hover:text-accent font-mono text-sm tracking-widest underline decoration-primary/30 underline-offset-4 uppercase">
          CREATE A MISSION
        </Link>
      </div>
    </div>
  );
}
