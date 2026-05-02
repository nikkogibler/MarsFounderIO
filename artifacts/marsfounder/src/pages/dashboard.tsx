import { useGetDashboardSummary, useListRecentMissionActivity, getGetDashboardSummaryQueryKey, getListRecentMissionActivityQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 } });
  const { data: activity, isLoading: loadingActivity } = useListRecentMissionActivity({ query: { queryKey: getListRecentMissionActivityQueryKey(), refetchInterval: 10000 } });

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col gap-12">
      <div className="border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Fleet Telemetry</h1>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
            Fleet-wide mission statistics and operating activity.
          </p>
        </div>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/50 border border-border">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-card p-6 h-32 flex flex-col justify-between">
              <Skeleton className="h-4 w-24 bg-border/50 rounded-none" />
              <Skeleton className="h-10 w-16 bg-border/50 rounded-none" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/50 border border-border shadow-[0_0_30px_rgba(204,68,34,0.05)]">
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">ACTIVE MISSIONS</span>
            <span className="font-mono text-4xl text-primary">{summary.activeMissions}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">COMPLETED</span>
            <span className="font-mono text-4xl text-foreground">{summary.completedMissions}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">DEPLOYED BUILDS</span>
            <span className="font-mono text-4xl text-foreground">{summary.botsOnSurface}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">OPERATORS</span>
            <span className="font-mono text-4xl text-foreground">{summary.founders}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">CREDITS IN FLIGHT</span>
            <span className="font-mono text-4xl text-accent">{summary.creditsInFlight.toLocaleString()}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">AVG MISSION (SOLS)</span>
            <span className="font-mono text-4xl text-foreground">{summary.averageMissionSols.toFixed(1)}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">TOP ROLE</span>
            <span className="font-mono text-2xl text-foreground">{summary.topRole}</span>
          </div>
          <div className="bg-card p-6 flex flex-col justify-between h-32 group hover:bg-primary/5 transition-colors">
            <span className="font-mono text-[10px] text-muted-foreground tracking-widest group-hover:text-primary transition-colors">NEXT LAUNCH WINDOW</span>
            <span className="font-mono text-xl text-foreground">{summary.nextLaunchWindow}</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <h3 className="font-sans font-black uppercase tracking-tight text-xl border-b border-border pb-2">RECENT ACTIVITY</h3>
        
        {loadingActivity ? (
          <div className="flex flex-col gap-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full bg-border/50 rounded-none" />)}
          </div>
        ) : activity?.length === 0 ? (
          <div className="p-8 border border-border bg-card/30 text-center font-mono text-sm text-muted-foreground uppercase tracking-widest">
            NO RECENT ACTIVITY DETECTED
          </div>
        ) : (
          <div className="flex flex-col font-mono text-xs">
            {activity?.map((act, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 p-4 border-b border-border/50 hover:bg-card/50 transition-colors">
                <div className="text-[10px] text-muted-foreground w-32 shrink-0">
                  {format(new Date(act.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </div>
                <div className="w-40 shrink-0 text-foreground truncate">
                  <span className="text-primary mr-2">[{act.eventType}]</span>
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4">
                  <span className="text-foreground">{act.event}</span>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>OP: {act.missionName}</span>
                    <span>BY: {act.founderHandle}</span>
                    <Link href={`/missions/${act.missionId}`} className="text-primary hover:text-accent transition-colors underline decoration-primary/30 underline-offset-4">
                      VIEW LOG
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
