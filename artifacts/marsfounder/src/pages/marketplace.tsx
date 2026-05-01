import { useListMarketplaceSkills } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function Marketplace() {
  const { data: skills, isLoading } = useListMarketplaceSkills();
  const [filter, setFilter] = useState<string>("ALL");

  const categories = ["ALL", ...Array.from(new Set(skills?.map(s => s.category) || []))];
  
  const filteredSkills = skills?.filter(s => filter === "ALL" || s.category === filter);

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col relative min-h-[80vh]">
      
      {/* Stamp */}
      <div className="absolute top-32 right-12 z-10 rotate-12 pointer-events-none opacity-20 hidden md:block">
        <div className="border-4 border-primary text-primary font-black text-6xl uppercase p-4 tracking-tighter">
          COMING Q3 2026
        </div>
      </div>

      <div className="mb-12 border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Skill Marketplace</h1>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
            Over-the-air behavioral upgrades for your fleet.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-primary hover:bg-accent text-primary-foreground px-6 py-3 font-bold font-mono uppercase tracking-widest transition-colors border border-primary hover:border-accent">
              SUBMIT A SKILL
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border rounded-none sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-sans font-black uppercase text-2xl tracking-tight text-foreground">PARTNER PROGRAM</DialogTitle>
              <DialogDescription className="font-mono text-sm text-muted-foreground">
                The marketplace API is currently in closed alpha. Join the waitlist as a Partner to get early access to the SDK.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex justify-end">
              <Link href="/waitlist" className="bg-primary hover:bg-accent text-primary-foreground px-6 py-3 font-bold font-mono uppercase tracking-widest transition-colors border border-primary hover:border-accent w-full text-center">
                PROCEED TO WAITLIST
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar font-mono text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 border whitespace-nowrap transition-colors ${filter === cat ? 'bg-primary/20 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border p-6 h-[250px] flex flex-col justify-between opacity-50">
              <Skeleton className="h-6 w-1/2 bg-border/50 rounded-none" />
              <Skeleton className="h-20 w-full bg-border/50 rounded-none" />
              <Skeleton className="h-4 w-1/3 bg-border/50 rounded-none" />
            </div>
          ))}
        </div>
      ) : filteredSkills?.length === 0 ? (
        <div className="border border-border p-12 text-center font-mono text-muted-foreground bg-card/30">
          <p className="mb-2 text-primary">NO SKILLS FOUND MATCHING FILTER.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          {/* Overlay to enforce "Coming Soon" state */}
          <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-[2px] pointer-events-none flex items-center justify-center">
            <div className="bg-primary text-primary-foreground px-8 py-4 font-black text-2xl uppercase tracking-widest border border-primary shadow-[0_0_30px_rgba(204,68,34,0.4)] md:hidden">
              COMING Q3 2026
            </div>
          </div>
          
          {filteredSkills?.map(skill => (
            <div key={skill.id} className="border border-border bg-card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 font-mono text-[10px] text-muted-foreground bg-background border-b border-l border-border group-hover:text-primary transition-colors">
                v1.0.4
              </div>
              
              <div className="flex justify-between items-start mb-4 pr-12">
                <h3 className="font-sans font-black uppercase text-xl text-foreground">{skill.name}</h3>
              </div>
              
              <div className="font-mono text-xs text-primary mb-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-primary" />
                {skill.author} {skill.verified && "✓"}
              </div>
              
              <p className="font-mono text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
                {skill.description}
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50 font-mono text-[10px]">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">RATING</span>
                  <span className="text-foreground">{skill.rating.toFixed(1)} / 5</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">INSTALLS</span>
                  <span className="text-foreground">{skill.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground">PRICE</span>
                  <span className="text-primary">{skill.priceCredits} CR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}