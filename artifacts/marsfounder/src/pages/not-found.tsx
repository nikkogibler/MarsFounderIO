import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container mx-auto px-6 py-32 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-8">
        <div className="inline-block border border-destructive text-destructive px-3 py-1 font-mono text-xs tracking-widest bg-destructive/10 mb-6">
          CRITICAL ERROR 404
        </div>
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-foreground mb-4">
          Off-Nominal.
        </h1>
        <h2 className="text-2xl font-mono text-muted-foreground uppercase tracking-widest mb-12">
          No route or telemetry endpoint found for this request.
        </h2>
      </div>
      
      <div className="flex flex-col gap-4 font-mono text-sm max-w-lg mb-12 border-l-2 border-primary pl-6 text-left">
        <p className="text-foreground">
          The requested page is outside the current application map.
        </p>
        <p className="text-muted-foreground">
          Return to mission control or use the primary navigation to continue.
        </p>
      </div>

      <Link href="/" className="bg-primary hover:bg-accent text-primary-foreground px-8 py-4 font-bold font-mono uppercase tracking-widest transition-colors border border-primary hover:border-accent">
        RETURN TO MISSION CONTROL
      </Link>
    </div>
  );
}
