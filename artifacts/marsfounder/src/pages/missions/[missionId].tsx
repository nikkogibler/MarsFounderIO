import { useRoute, Link } from "wouter";
import { useGetMission, useEstimateMissionFeasibility, useGetLightDelay, useGetMarsTime, useGetBuild, getGetMissionQueryKey, getGetLightDelayQueryKey, getGetBuildQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MissionDetail() {
  const [, params] = useRoute("/missions/:missionId");
  const missionId = params?.missionId;
  const { toast } = useToast();

  const { data: mission, isLoading } = useGetMission(missionId || "", {
    query: {
      queryKey: getGetMissionQueryKey(missionId || ""),
      enabled: !!missionId,
      refetchInterval: 5000,
    },
  });

  const { data: lightDelay } = useGetLightDelay({
    query: { queryKey: getGetLightDelayQueryKey(), refetchInterval: 30000 },
  });

  const { data: build } = useGetBuild(mission?.buildId || "", {
    query: {
      queryKey: getGetBuildQueryKey(mission?.buildId || ""),
      enabled: !!mission?.buildId,
    },
  });

  const estimateFeasibility = useEstimateMissionFeasibility();
  const [feasibilityReport, setFeasibilityReport] = useState<any>(null);
  const telemetryEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    telemetryEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mission?.telemetry]);

  const handleRequestFeasibility = () => {
    if (!mission) return;
    
    toast({ title: "COMPUTING FEASIBILITY", description: "Running AI simulation for current parameters..." });
    
    estimateFeasibility.mutate({ missionId: mission.id }, {
      onSuccess: (data) => {
        setFeasibilityReport(data);
      },
      onError: (err) => {
        toast({
          title: "SIMULATION FAILED",
          description: (err as any)?.data?.error || (err as Error)?.message || "Could not compute feasibility.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 flex flex-col gap-12">
        <Skeleton className="h-32 w-full bg-border/50 rounded-none" />
        <Skeleton className="h-96 w-full bg-border/50 rounded-none" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-black text-destructive uppercase tracking-tighter mb-4">MISSION NOT FOUND</h1>
        <p className="font-mono text-muted-foreground mb-8">This operation does not exist in our telemetry.</p>
        <Link href="/missions" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-bold font-mono uppercase tracking-widest hover:bg-accent transition-colors">
          RETURN TO MISSIONS
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      
      {/* Top Bar HUD */}
      <div className="border-b border-border bg-card p-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <span className={`font-mono text-[10px] px-2 py-1 flex items-center gap-2 border font-bold tracking-widest ${
              mission.status === 'ACTIVE' ? 'border-primary text-primary bg-primary/10' : 
              mission.status === 'COMPLETED' ? 'border-accent text-accent bg-accent/10' : 
              mission.status === 'FAILED' ? 'border-destructive text-destructive bg-destructive/10' : 
              mission.status === 'PAUSED_DUST_STORM' ? 'border-destructive text-destructive bg-destructive/10' :
              'border-border text-muted-foreground bg-secondary'
            }`}>
              {(mission.status === 'ACTIVE' || mission.status === 'PAUSED_DUST_STORM') && <span className={`w-1.5 h-1.5 ${mission.status === 'ACTIVE' ? 'bg-primary' : 'bg-destructive'} animate-pulse`} />}
              {mission.status.replace(/_/g, ' ')}
            </span>
            <span className="font-mono text-xs text-muted-foreground tracking-widest">ID: {mission.id.substring(0, 8)}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground">
            {mission.name}
          </h1>
          <p className="font-mono text-muted-foreground mt-2 text-sm tracking-widest uppercase">
            OBJECTIVE: {mission.objective} {mission.targetMaterial ? `[${mission.targetMaterial}]` : ''} • OPERATOR: {mission.founderHandle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/50 border border-border w-full lg:w-auto">
          <div className="bg-card p-4 flex flex-col min-w-[120px]">
            <span className="font-mono text-[10px] text-muted-foreground mb-1 tracking-widest">CURRENT SOL</span>
            <span className="font-mono text-2xl text-foreground">{mission.currentSol} <span className="text-xs text-muted-foreground">/ {mission.durationSols}</span></span>
          </div>
          <div className="bg-card p-4 flex flex-col min-w-[120px]">
            <span className="font-mono text-[10px] text-muted-foreground mb-1 tracking-widest">ENERGY</span>
            <span className={`font-mono text-2xl ${mission.energyRemainingPercent < 20 ? 'text-destructive' : 'text-accent'}`}>{mission.energyRemainingPercent}%</span>
          </div>
          <div className="bg-card p-4 flex flex-col min-w-[120px]">
            <span className="font-mono text-[10px] text-muted-foreground mb-1 tracking-widest">COMPLETION</span>
            <span className="font-mono text-2xl text-foreground">{mission.progressPercent}%</span>
          </div>
          <div className="bg-card p-4 flex flex-col min-w-[120px]">
            <span className="font-mono text-[10px] text-muted-foreground mb-1 tracking-widest">LOCATION</span>
            <span className="font-mono text-xs text-foreground mt-1 truncate max-w-[100px]">{mission.locationName}</span>
            <span className="font-mono text-[9px] text-muted-foreground">L {mission.latitude.toFixed(2)}° l {mission.longitude.toFixed(2)}°</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-[500px]">
        {/* Left: Telemetry Log */}
        <div className="lg:w-2/3 border-r border-border flex flex-col bg-card/10">
          {mission.missionBrief && (
            <div className="border-b border-border bg-background/70 p-6">
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-3">
                MISSION BRIEF / ROBOT PROMPT
              </div>
              <p className="font-mono text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {mission.missionBrief}
              </p>
            </div>
          )}
          <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center">
            <h3 className="font-sans font-black uppercase tracking-tight text-sm">SECURE TELEMETRY LOG</h3>
            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
              LIVE DATA STREAM
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs flex flex-col gap-2">
            {mission.telemetry.length === 0 ? (
              <div className="text-muted-foreground opacity-50 m-auto text-center tracking-widest">
                AWAITING INITIAL TELEMETRY...
              </div>
            ) : (
              mission.telemetry.map((entry, i) => (
                <div key={i} className="flex flex-col md:flex-row md:gap-4 border-b border-border/30 pb-2 mb-2 last:border-0">
                  <div className="flex gap-4 md:w-64 shrink-0 text-[10px] text-muted-foreground mb-1 md:mb-0">
                    <span className="w-16">SOL {entry.sol}</span>
                    <span className="w-20">{format(new Date(entry.timestamp), 'HH:mm:ss')}</span>
                    <span className="text-primary w-24">+{entry.signalDelaySeconds}s Δt</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`w-28 shrink-0 tracking-widest ${
                      entry.from === 'BOT' ? 'text-accent' : 
                      entry.from === 'MISSION_CONTROL' ? 'text-primary' : 'text-foreground'
                    }`}>[{entry.from}]</span>
                    <span className="text-foreground/90">{entry.message}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={telemetryEndRef} />
          </div>
        </div>

        {/* Right: Actions & Feasibility */}
        <div className="lg:w-1/3 flex flex-col bg-background">
          <div className="p-6 border-b border-border">
            <h3 className="font-sans font-black uppercase tracking-tight text-sm mb-4">COMMAND & CONTROL</h3>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRequestFeasibility}
                disabled={estimateFeasibility.isPending}
                className="w-full rounded-none font-bold font-mono uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
              >
                {estimateFeasibility.isPending ? 'COMPUTING...' : 'RUN MID-MISSION SIMULATION'}
              </Button>
              {build?.botClassId && (
                <Link href={`/bots/${build.botClassId}`} className="block w-full">
                  <Button variant="outline" className="w-full rounded-none font-bold font-mono uppercase tracking-widest border-border text-foreground hover:text-primary hover:border-primary bg-transparent">
                    VIEW ASSET DETAILS
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {feasibilityReport && (
              <div className="flex flex-col gap-6 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold tracking-widest">SIMULATION RESULTS</span>
                  <span className={`text-[10px] px-2 py-1 font-bold ${
                    feasibilityReport.verdict === 'GO' ? 'bg-primary text-primary-foreground' : 
                    feasibilityReport.verdict === 'MARGINAL' ? 'bg-accent text-accent-foreground' : 
                    'bg-destructive text-destructive-foreground'
                  }`}>
                    {feasibilityReport.verdict}
                  </span>
                </div>
                
                <p className="text-xs text-foreground/80 leading-relaxed p-3 bg-secondary/30 border-l border-primary">
                  {feasibilityReport.summary}
                </p>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-muted-foreground tracking-widest">CURRENT RISKS</span>
                  <div className="flex flex-col gap-2">
                    {feasibilityReport.risks.map((risk: any, i: number) => (
                      <div key={i} className={`p-2 border text-[10px] ${
                        risk.level === 'CRITICAL' ? 'border-destructive bg-destructive/10 text-destructive' :
                        risk.level === 'HIGH' ? 'border-accent bg-accent/10 text-accent' :
                        'border-border bg-background/50 text-foreground'
                      }`}>
                        <span className="font-bold mr-2">[{risk.level}]</span>
                        {risk.description}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-muted-foreground tracking-widest">RECOMMENDATIONS</span>
                  <ul className="list-disc pl-4 text-xs text-foreground/80 flex flex-col gap-1">
                    {feasibilityReport.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
