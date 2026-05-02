import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useListBots, useListTools, useListAddons, useCreateBuild, useListBuilds } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Configure() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: bots, isLoading: loadingBots } = useListBots();
  const { data: allTools, isLoading: loadingTools } = useListTools();
  const { data: allAddons, isLoading: loadingAddons } = useListAddons();
  const { data: builds, isLoading: loadingBuilds, refetch: refetchBuilds } = useListBuilds();
  
  const createBuild = useCreateBuild();

  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [buildName, setBuildName] = useState("");
  const [founderHandle, setFounderHandle] = useState("");

  const activeBot = useMemo(() => {
    if (!bots) return null;
    if (!selectedBotId && bots.length > 0) {
      setSelectedBotId(bots[0].id);
      return bots[0];
    }
    return bots.find(b => b.id === selectedBotId) || null;
  }, [bots, selectedBotId]);

  const compatibleTools = useMemo(() => {
    if (!allTools || !activeBot) return [];
    return allTools.filter(t => t.compatibleRoles.includes(activeBot.role as any));
  }, [allTools, activeBot]);

  const stats = useMemo(() => {
    if (!activeBot) return { mass: 0, power: 0, cost: 0, slotsAvailable: { tools: 0, addons: 0 } };
    
    let mass = activeBot.massKg;
    let power = activeBot.powerWatts;
    let cost = activeBot.hourlyCredits;
    
    selectedTools.forEach(tid => {
      const tool = allTools?.find(t => t.id === tid);
      if (tool) {
        mass += tool.massKg;
        power -= tool.powerDrawWatts;
        cost += tool.creditsPerHour;
      }
    });
    
    selectedAddons.forEach(aid => {
      const addon = allAddons?.find(a => a.id === aid);
      if (addon) {
        mass += addon.massKg;
        power += addon.powerEffectWatts;
        cost += addon.creditsPerHour;
      }
    });
    
    return {
      mass,
      power,
      cost,
      slotsAvailable: {
        tools: activeBot.toolSlots - selectedTools.length,
        addons: activeBot.addonSlots - selectedAddons.length
      }
    };
  }, [activeBot, selectedTools, selectedAddons, allTools, allAddons]);

  const handleToolToggle = (id: string) => {
    setSelectedTools(prev => {
      if (prev.includes(id)) return prev.filter(t => t !== id);
      if (activeBot && prev.length >= activeBot.toolSlots) return prev;
      return [...prev, id];
    });
  };

  const handleAddonToggle = (id: string) => {
    setSelectedAddons(prev => {
      if (prev.includes(id)) return prev.filter(a => a !== id);
      if (activeBot && prev.length >= activeBot.addonSlots) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBot || !buildName || !founderHandle) return;
    
    if (stats.power < 0) {
      toast({
        title: "POWER DEFICIT DETECTED",
        description: "Build cannot be saved because configured power draw exceeds available output.",
        variant: "destructive",
      });
      return;
    }

    createBuild.mutate({
      data: {
        name: buildName,
        botClassId: activeBot.id,
        toolIds: selectedTools,
        addonIds: selectedAddons,
        founderHandle,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "BUILD SAVED",
          description: "Configuration saved for mission planning.",
        });
        setBuildName("");
        refetchBuilds();
      },
      onError: (err) => {
        toast({
          title: "SAVE FAILED",
          description: (err as any)?.data?.error || (err as Error)?.message || "Could not save build.",
          variant: "destructive",
        });
      }
    });
  };

  if (loadingBots || loadingTools || loadingAddons) {
    return (
      <div className="container mx-auto px-6 py-12 flex flex-col gap-12">
        <Skeleton className="h-12 w-1/3 bg-border/50 rounded-none" />
        <Skeleton className="h-96 w-full bg-border/50 rounded-none" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Build Configurator</h1>
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          Assemble a mission-ready chassis configuration and validate operating limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Rail: Saved Builds */}
        <div className="col-span-1 border border-border bg-card/30 flex flex-col h-[calc(100vh-250px)] sticky top-24">
          <div className="p-4 border-b border-border bg-background/50">
            <h3 className="font-sans font-black uppercase tracking-tight">SAVED BUILDS</h3>
          </div>
          <ScrollArea className="flex-1">
            {loadingBuilds ? (
              <div className="p-4 space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full bg-border/50 rounded-none" />)}
              </div>
            ) : builds?.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground">
                NO SAVED BUILDS AVAILABLE
              </div>
            ) : (
              <div className="flex flex-col">
                {builds?.map(build => (
                  <div key={build.id} className="p-4 border-b border-border/50 hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => {
                    setSelectedBotId(build.botClassId);
                    setSelectedTools(build.toolIds);
                    setSelectedAddons(build.addonIds);
                    setBuildName(build.name);
                    setFounderHandle(build.founderHandle);
                  }}>
                    <h4 className="font-bold font-sans uppercase truncate text-sm mb-1">{build.name}</h4>
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{build.founderHandle}</span>
                      <span>{build.totalCreditsPerHour} CR/HR</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Center: Configurator */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-black uppercase text-xl border-b border-border pb-2">CHASSIS SELECTION</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bots?.map(bot => (
                <button
                  key={bot.id}
                  onClick={() => {
                    setSelectedBotId(bot.id);
                    setSelectedTools([]);
                    setSelectedAddons([]);
                  }}
                  className={`p-4 border text-left flex flex-col transition-all duration-200 ${selectedBotId === bot.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                >
                  <span className="font-mono text-[10px] text-primary tracking-widest mb-2 uppercase">{bot.role}</span>
                  <span className="font-bold font-sans uppercase text-sm mb-1 truncate">{bot.codename}</span>
                  <span className="font-mono text-xs text-muted-foreground">{bot.hourlyCredits} CR/HR</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-border pb-2">
              <h3 className="font-sans font-black uppercase text-xl">COMPATIBLE TOOLS</h3>
              <span className="font-mono text-xs text-primary">{stats.slotsAvailable.tools} SLOTS REMAINING</span>
            </div>
            {compatibleTools.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground border border-border border-dashed">
                NO COMPATIBLE TOOLS DETECTED FOR THIS CHASSIS
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compatibleTools.map(tool => {
                  const isSelected = selectedTools.includes(tool.id);
                  const disabled = !isSelected && stats.slotsAvailable.tools <= 0;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolToggle(tool.id)}
                      disabled={disabled}
                      className={`p-4 border text-left flex flex-col transition-all duration-200 
                        ${isSelected ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-primary/50'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold font-sans uppercase text-sm">{tool.name}</span>
                        <div className={`w-3 h-3 border ${isSelected ? 'bg-accent border-accent' : 'border-border'}`} />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground mb-3">{tool.category}</span>
                      <div className="flex justify-between font-mono text-[10px] mt-auto border-t border-border/50 pt-2">
                        <span className="text-destructive">-{tool.powerDrawWatts}W</span>
                        <span>+{tool.massKg}KG</span>
                        <span className="text-primary">+{tool.creditsPerHour}CR</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-border pb-2">
              <h3 className="font-sans font-black uppercase text-xl">ADD-ONS</h3>
              <span className="font-mono text-xs text-primary">{stats.slotsAvailable.addons} SLOTS REMAINING</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAddons?.map(addon => {
                const isSelected = selectedAddons.includes(addon.id);
                const disabled = !isSelected && stats.slotsAvailable.addons <= 0;
                return (
                  <button
                    key={addon.id}
                    onClick={() => handleAddonToggle(addon.id)}
                    disabled={disabled}
                    className={`p-4 border text-left flex flex-col transition-all duration-200 
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold font-sans uppercase text-sm">{addon.name}</span>
                      <div className={`w-3 h-3 border ${isSelected ? 'bg-primary border-primary' : 'border-border'}`} />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground mb-3">{addon.category}</span>
                    <div className="flex justify-between font-mono text-[10px] mt-auto border-t border-border/50 pt-2">
                      <span className={addon.powerEffectWatts > 0 ? 'text-accent' : 'text-destructive'}>
                        {addon.powerEffectWatts > 0 ? '+' : ''}{addon.powerEffectWatts}W
                      </span>
                      <span>+{addon.massKg}KG</span>
                      <span className="text-primary">+{addon.creditsPerHour}CR</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Rail: HUD & Save */}
        <div className="col-span-1 border border-border bg-background flex flex-col h-[calc(100vh-250px)] sticky top-24 shadow-[0_0_30px_rgba(204,68,34,0.1)]">
          <div className="p-4 border-b border-border bg-primary text-primary-foreground">
              <h3 className="font-sans font-black uppercase tracking-tight">BUILD SUMMARY</h3>
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted-foreground">TOTAL MASS</span>
              <span className="font-mono text-3xl">{stats.mass} <span className="text-sm text-muted-foreground">KG</span></span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted-foreground">NET POWER</span>
              <span className={`font-mono text-3xl ${stats.power < 0 ? 'text-destructive' : 'text-accent'}`}>
                {stats.power} <span className="text-sm text-muted-foreground">W</span>
              </span>
              {stats.power < 0 && (
                <span className="font-mono text-[10px] text-destructive bg-destructive/10 px-2 py-1 border border-destructive/30 mt-2">
                  WARNING: POWER DEFICIT. REVISE LOADOUT.
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted-foreground">OPERATIONAL COST</span>
              <span className="font-mono text-3xl text-primary">{stats.cost} <span className="text-sm text-muted-foreground">CR/HR</span></span>
            </div>

            <div className="w-full h-px bg-border my-2" />

            <form onSubmit={handleSave} className="mt-auto flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground">BUILD DESIGNATION</label>
                <Input 
                  value={buildName} 
                  onChange={e => setBuildName(e.target.value)} 
                  placeholder="e.g. HEAVY-MINER-ALPHA"
                  className="font-mono rounded-none border-border bg-card uppercase text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-muted-foreground">OPERATOR HANDLE</label>
                <Input 
                  value={founderHandle} 
                  onChange={e => setFounderHandle(e.target.value)} 
                  placeholder="e.g. jcarmack"
                  className="font-mono rounded-none border-border bg-card uppercase text-sm"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={stats.power < 0 || !buildName || !founderHandle || createBuild.isPending}
                className="w-full rounded-none font-bold font-mono uppercase tracking-widest mt-4 bg-primary text-primary-foreground hover:bg-accent border border-primary hover:border-accent disabled:opacity-50 disabled:bg-card disabled:text-muted-foreground disabled:border-border"
              >
                {createBuild.isPending ? 'SAVING...' : 'SAVE BUILD'}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
