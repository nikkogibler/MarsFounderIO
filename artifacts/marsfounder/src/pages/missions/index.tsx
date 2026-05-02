import { useListMissions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function MissionsList() {
  const { data: missions, isLoading } = useListMissions();

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Mission Log</h1>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
            Active and historical surface operations.
          </p>
        </div>
        <Link href="/missions/new" className="inline-block bg-primary hover:bg-accent text-primary-foreground px-6 py-3 font-bold font-mono uppercase tracking-widest transition-colors border border-primary hover:border-accent">
          NEW MISSION
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-none bg-border/50" />
          ))}
        </div>
      ) : missions?.length === 0 ? (
        <div className="border border-border p-16 text-center font-mono text-muted-foreground bg-card/30">
          <p className="mb-4 text-primary text-xl">NO MISSIONS DETECTED.</p>
          <p className="text-sm max-w-md mx-auto">Create a saved build before launching a surface mission.</p>
          <Link href="/missions/new" className="inline-block mt-8 border border-border px-6 py-2 hover:bg-primary/10 hover:text-primary transition-colors">
            CREATE MISSION
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 font-mono text-[10px] text-muted-foreground border-b border-border/50">
            <div className="col-span-3">DESIGNATION</div>
            <div className="col-span-2">OBJECTIVE</div>
            <div className="col-span-2">LOCATION</div>
            <div className="col-span-1">SOLS</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-2 text-right">PROGRESS</div>
          </div>
          
          {missions?.map((mission) => (
            <Link key={mission.id} href={`/missions/${mission.id}`} className="group block bg-card border border-border hover:border-primary transition-colors duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center">
                <div className="col-span-1 md:col-span-3">
                  <h3 className="font-sans font-black uppercase text-lg group-hover:text-primary transition-colors truncate">{mission.name}</h3>
                  <div className="font-mono text-[10px] text-muted-foreground">OPERATOR: {mission.founderHandle}</div>
                  {mission.missionBrief && (
                    <div className="font-mono text-[10px] text-muted-foreground/80 mt-2 line-clamp-2">
                      {mission.missionBrief}
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 md:col-span-2 flex items-center">
                  <span className="font-mono text-xs px-2 py-1 bg-secondary text-secondary-foreground border border-border/50">{mission.objective}</span>
                </div>
                
                <div className="col-span-1 md:col-span-2 font-mono text-xs text-muted-foreground">
                  <div className="truncate">{mission.locationName}</div>
                  <div className="text-[10px]">L {mission.latitude.toFixed(2)}° / l {mission.longitude.toFixed(2)}°</div>
                </div>
                
                <div className="col-span-1 font-mono text-xs text-foreground">
                  {mission.durationSols}
                </div>
                
                <div className="col-span-1 md:col-span-2 flex items-center">
                  <span className={`font-mono text-[10px] px-2 py-1 border flex items-center gap-2
                    ${mission.status === 'ACTIVE' ? 'border-primary text-primary bg-primary/10' : 
                      mission.status === 'COMPLETED' ? 'border-accent text-accent bg-accent/10' : 
                      mission.status === 'FAILED' ? 'border-destructive text-destructive bg-destructive/10' : 
                      mission.status === 'PAUSED_DUST_STORM' ? 'border-destructive text-destructive bg-destructive/10' :
                      'border-border text-muted-foreground bg-secondary'}`}
                  >
                    {mission.status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-primary animate-pulse" />}
                    {mission.status === 'PAUSED_DUST_STORM' && <span className="w-1.5 h-1.5 bg-destructive animate-pulse" />}
                    {mission.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="col-span-1 md:col-span-2 flex flex-col gap-2 mt-4 md:mt-0">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground">COMPLETION</span>
                    <span className="text-foreground">{mission.progressPercent}%</span>
                  </div>
                  <div className="h-1 bg-secondary w-full overflow-hidden">
                    <div 
                      className={`h-full ${mission.status === 'ACTIVE' ? 'bg-primary' : mission.status === 'COMPLETED' ? 'bg-accent' : mission.status === 'FAILED' ? 'bg-destructive' : 'bg-muted-foreground'}`}
                      style={{ width: `${mission.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
