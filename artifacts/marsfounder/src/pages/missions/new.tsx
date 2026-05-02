import { useState } from "react";
import { useLocation } from "wouter";
import { useListBuilds, useCreateMission, NewMissionObjective } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export default function MissionNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: builds, isLoading: loadingBuilds } = useListBuilds();
  const createMission = useCreateMission();

  const [buildId, setBuildId] = useState("");
  const [objective, setObjective] = useState<keyof typeof NewMissionObjective>("SURVEY");
  const [missionName, setMissionName] = useState("");
  const [founderHandle, setFounderHandle] = useState("");
  const [locationName, setLocationName] = useState("Valles Marineris");
  const [latitude, setLatitude] = useState(-13.9);
  const [longitude, setLongitude] = useState(-59.2);
  const [durationSols, setDurationSols] = useState(14);
  const [targetMaterial, setTargetMaterial] = useState("");
  const [missionBrief, setMissionBrief] = useState("");

  const [feasibilityReport, setFeasibilityReport] = useState<any>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildId || !missionName || !founderHandle) return;

    createMission.mutate({
      data: {
        name: missionName,
        buildId,
        objective: objective as any,
        missionBrief: missionBrief || undefined,
        targetMaterial: targetMaterial || undefined,
        durationSols,
        locationName,
        latitude,
        longitude,
        founderHandle,
      }
    }, {
      onSuccess: (mission) => {
        toast({
          title: "MISSION LAUNCHED",
          description: "Mission created and telemetry monitoring started.",
        });
        setLocation(`/missions/${mission.id}`);
      },
      onError: (err) => {
        toast({
          title: "MISSION CREATE FAILED",
          description: (err as any)?.data?.error || (err as Error)?.message || "Failed to create mission.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
      <div className="lg:w-2/3 flex flex-col">
        <div className="mb-12 border-b border-border pb-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Deploy Asset</h1>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
            Define mission parameters and assign a saved robotic build.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-12">
          {/* Hardware Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-black uppercase text-xl border-b border-border pb-2 text-primary">01. HARDWARE</h3>
            {loadingBuilds ? (
              <Skeleton className="h-32 w-full rounded-none bg-border/50" />
            ) : builds?.length === 0 ? (
              <div className="border border-border p-8 text-center font-mono text-xs text-muted-foreground bg-card/50">
                NO SAVED BUILDS AVAILABLE. CREATE A BUILD BEFORE LAUNCHING A MISSION.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {builds?.map(build => (
                  <button
                    type="button"
                    key={build.id}
                    onClick={() => setBuildId(build.id)}
                    data-testid={`build-${build.id}`}
                    aria-pressed={buildId === build.id}
                    className={`p-4 border cursor-pointer transition-colors text-left rounded-none ${buildId === build.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                  >
                    <h4 className="font-bold font-sans uppercase mb-1">{build.name}</h4>
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{build.totalCreditsPerHour} CR/HR</span>
                      <span>{build.totalPowerWatts}W NET</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mission Parameters */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-black uppercase text-xl border-b border-border pb-2 text-primary">02. PARAMETERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">DESIGNATION</label>
                <Input 
                  value={missionName} 
                  onChange={e => setMissionName(e.target.value)} 
                  placeholder="e.g. ARCADIA ICE SURVEY"
                  className="font-mono rounded-none border-border bg-card uppercase"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">OPERATOR HANDLE</label>
                <Input 
                  value={founderHandle} 
                  onChange={e => setFounderHandle(e.target.value)} 
                  placeholder="e.g. mission-ops"
                  className="font-mono rounded-none border-border bg-card uppercase"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">OBJECTIVE</label>
                <select 
                  value={objective}
                  onChange={e => setObjective(e.target.value as any)}
                  className="flex h-10 w-full bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono uppercase border-border border rounded-none text-foreground"
                >
                  {Object.keys(NewMissionObjective).map(obj => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">TARGET MATERIAL (OPTIONAL)</label>
                <Input 
                  value={targetMaterial} 
                  onChange={e => setTargetMaterial(e.target.value)} 
                  placeholder="e.g. ICE, IRON"
                  className="font-mono rounded-none border-border bg-card uppercase"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">MISSION BRIEF / ROBOT PROMPT</label>
                <Textarea
                  value={missionBrief}
                  onChange={e => setMissionBrief(e.target.value)}
                  placeholder="Describe the mission objective, operating protocol, priority actions, constraints, and telemetry requirements."
                  className="font-mono rounded-none border-border bg-card min-h-45 resize-y"
                  maxLength={2200}
                />
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Optional directive sent with the mission record.</span>
                  <span>{missionBrief.length}/2200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-black uppercase text-xl border-b border-border pb-2 text-primary">03. DEPLOYMENT VECTOR</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">REGION / LOCATION NAME</label>
                <Input 
                  value={locationName} 
                  onChange={e => setLocationName(e.target.value)} 
                  placeholder="e.g. Valles Marineris"
                  className="font-mono rounded-none border-border bg-card uppercase"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">LATITUDE (-90 to 90)</label>
                <Input 
                  type="number"
                  step="0.01"
                  min="-90"
                  max="90"
                  value={latitude} 
                  onChange={e => setLatitude(parseFloat(e.target.value))} 
                  className="font-mono rounded-none border-border bg-card"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground tracking-widest">LONGITUDE (-180 to 180)</label>
                <Input 
                  type="number"
                  step="0.01"
                  min="-180"
                  max="180"
                  value={longitude} 
                  onChange={e => setLongitude(parseFloat(e.target.value))} 
                  className="font-mono rounded-none border-border bg-card"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-black uppercase text-xl border-b border-border pb-2 text-primary">04. DURATION</h3>
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center font-mono text-sm">
                <span className="text-muted-foreground">PLANNED SOLS</span>
                <span className="text-2xl text-foreground">{durationSols}</span>
              </div>
              <Slider 
                defaultValue={[14]} 
                min={1} 
                max={90} 
                step={1}
                value={[durationSols]}
                onValueChange={v => setDurationSols(v[0])}
                className="py-4 **:[[role=slider]]:h-6 **:[[role=slider]]:w-3 **:[[role=slider]]:rounded-none **:[[role=slider]]:bg-primary **:[[role=slider]]:border-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button 
              type="submit" 
              disabled={!buildId || !missionName || !founderHandle || createMission.isPending}
              className="flex-1 rounded-none font-bold font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground border border-primary disabled:opacity-50"
            >
              {createMission.isPending ? 'CREATING...' : 'CREATE MISSION'}
            </Button>
          </div>
        </form>
      </div>

      {/* AI Feasibility Report Sidebar */}
      <div className="lg:w-1/3 border border-border bg-card/30 flex flex-col sticky top-24 self-start">
        <div className="p-4 border-b border-border bg-secondary text-secondary-foreground flex justify-between items-center">
          <h3 className="font-sans font-black uppercase tracking-tight">AI SIMULATION REPORT</h3>
        </div>
        
        <div className="p-6 flex flex-col gap-6 font-mono text-sm">
          {!feasibilityReport ? (
            <div className="text-center text-muted-foreground opacity-70 py-12 text-xs uppercase tracking-widest leading-relaxed">
              FEASIBILITY ANALYSIS RUNS AFTER THE MISSION IS CREATED.<br/><br/>OPEN THE MISSION DETAIL VIEW TO EVALUATE THE ACTIVE PLAN AGAINST CURRENT TELEMETRY.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground tracking-widest">SUMMARY</span>
                <p className="text-foreground leading-relaxed bg-background/50 p-4 border-l-2 border-primary">
                  {feasibilityReport.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 bg-background/50 p-3 border border-border">
                  <span className="text-[10px] text-muted-foreground tracking-widest">ESTIMATED COST</span>
                  <span className="text-xl text-primary">{feasibilityReport.estimatedCostCredits} <span className="text-xs text-muted-foreground">CR</span></span>
                </div>
                <div className="flex flex-col gap-1 bg-background/50 p-3 border border-border">
                  <span className="text-[10px] text-muted-foreground tracking-widest">ENERGY REQ.</span>
                  <span className="text-xl text-accent">{feasibilityReport.estimatedEnergyKwh} <span className="text-xs text-muted-foreground">kWh</span></span>
                </div>
                <div className="flex flex-col gap-1 bg-background/50 p-3 border border-border">
                  <span className="text-[10px] text-muted-foreground tracking-widest">DURATION</span>
                  <span className="text-xl text-foreground">{feasibilityReport.estimatedDurationSols} <span className="text-xs text-muted-foreground">SOLS</span></span>
                </div>
                <div className="flex flex-col gap-1 bg-background/50 p-3 border border-border">
                  <span className="text-[10px] text-muted-foreground tracking-widest">CONFIDENCE</span>
                  <span className="text-xl text-foreground">{feasibilityReport.confidencePercent}%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <span className="text-[10px] text-muted-foreground tracking-widest">IDENTIFIED RISKS</span>
                <div className="flex flex-col gap-2">
                  {feasibilityReport.risks.map((risk: any, i: number) => (
                    <div key={i} className={`p-3 border text-xs ${
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
