import { useGetBot, useGetPersonaReply, getGetBotQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BotDetail() {
  const [, params] = useRoute("/bots/:botId");
  const botId = params?.botId;
  
  const { data: bot, isLoading } = useGetBot(botId || "", {
    query: { queryKey: getGetBotQueryKey(botId || ""), enabled: !!botId },
  });

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const replyMutation = useGetPersonaReply();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !botId) return;

    const userMsg = message;
    setMessage("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);

    replyMutation.mutate({ botId, data: { message: userMsg } }, {
      onSuccess: (reply) => {
        setChatHistory(prev => [...prev, { role: 'bot', text: reply.text }]);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 flex flex-col gap-12">
        <Skeleton className="h-24 w-1/2 bg-border/50 rounded-none" />
        <Skeleton className="h-64 w-full bg-border/50 rounded-none" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-black text-destructive uppercase tracking-tighter mb-4">ASSET NOT FOUND</h1>
        <p className="font-mono text-muted-foreground mb-8">The requested hardware does not exist in our telemetry.</p>
        <Link href="/bots" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-bold font-mono uppercase tracking-widest hover:bg-accent transition-colors">
          RETURN TO FLEET
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
      {/* Bot Specs */}
      <div className="lg:w-1/2 flex flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-4 h-4" style={{ backgroundColor: bot.accentColor || 'var(--primary)' }} />
            <span className="font-mono text-sm text-primary tracking-widest uppercase border border-primary/30 px-2 py-1 bg-primary/5">{bot.role}</span>
            <span className="font-mono text-sm text-muted-foreground">ID: {bot.id.substring(0, 8)}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground mb-4" style={{ color: bot.accentColor }}>
            {bot.codename}
          </h1>
          <h2 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-tight">{bot.name}</h2>
          <p className="font-mono text-muted-foreground text-lg mb-8 border-l-2 pl-4 py-1" style={{ borderColor: bot.accentColor || 'var(--primary)' }}>
            "{bot.tagline}"
          </p>
          <p className="font-mono text-sm text-foreground/80 leading-relaxed mb-8">
            {bot.description}
          </p>
          
          <Link href="/configure" className="inline-block bg-primary hover:bg-accent text-primary-foreground px-8 py-4 font-bold font-mono uppercase tracking-widest transition-colors w-full text-center border border-primary hover:border-accent">
            CONFIGURE THIS CHASSIS
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border/50 border border-border">
          <div className="bg-card p-6 flex flex-col">
            <span className="font-mono text-xs text-muted-foreground mb-2">BASE RATE</span>
            <span className="font-mono text-2xl text-foreground">{bot.hourlyCredits} <span className="text-sm text-muted-foreground">CR/HR</span></span>
          </div>
          <div className="bg-card p-6 flex flex-col">
            <span className="font-mono text-xs text-muted-foreground mb-2">DRY MASS</span>
            <span className="font-mono text-2xl text-foreground">{bot.massKg} <span className="text-sm text-muted-foreground">KG</span></span>
          </div>
          <div className="bg-card p-6 flex flex-col">
            <span className="font-mono text-xs text-muted-foreground mb-2">POWER OUTPUT</span>
            <span className="font-mono text-2xl text-foreground">{bot.powerWatts} <span className="text-sm text-muted-foreground">W</span></span>
          </div>
          <div className="bg-card p-6 flex flex-col">
            <span className="font-mono text-xs text-muted-foreground mb-2">CAPACITY</span>
            <span className="font-mono text-2xl text-foreground">{bot.toolSlots}T / {bot.addonSlots}A</span>
          </div>
          <div className="bg-card p-6 flex flex-col">
            <span className="font-mono text-xs text-muted-foreground mb-2">TOP SPEED</span>
            <span className="font-mono text-2xl text-foreground">{bot.topSpeedMps} <span className="text-sm text-muted-foreground">M/S</span></span>
          </div>
          <div className="bg-card p-6 flex flex-col">
            <span className="font-mono text-xs text-muted-foreground mb-2">OPERATIONAL RANGE</span>
            <span className="font-mono text-2xl text-foreground">{bot.rangeKm} <span className="text-sm text-muted-foreground">KM</span></span>
          </div>
        </div>
      </div>

      {/* Persona Chat */}
      <div className="lg:w-1/2 flex flex-col border border-border bg-card/30 relative">
        <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-mono text-sm tracking-widest text-primary">COMM LINK OPEN</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground px-2 py-1 bg-secondary border border-border">
            VOICE SAMPLE — MOCK
          </div>
        </div>
        
        <div className="p-6 border-b border-border bg-background/30">
          <h3 className="font-sans font-black uppercase text-xl mb-1 tracking-tight">{bot.personaName}</h3>
          <p className="font-mono text-xs text-muted-foreground mb-4">{bot.personaTagline}</p>
          <p className="font-mono text-sm text-foreground/70 italic border-l-2 border-border pl-4 py-2">
            {bot.personaBio}
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto max-h-[400px] font-mono text-sm flex flex-col gap-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-muted-foreground italic my-auto opacity-50">
              Awaiting transmission...
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <span className="text-[10px] text-muted-foreground mb-1">{msg.role === 'user' ? 'FOUNDER' : bot.codename}</span>
                <div className={`p-3 ${msg.role === 'user' ? 'bg-primary/20 text-primary-foreground border border-primary/30' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {replyMutation.isPending && (
            <div className="self-start flex flex-col max-w-[85%]">
               <span className="text-[10px] text-muted-foreground mb-1">{bot.codename}</span>
               <div className="p-3 bg-secondary text-secondary-foreground border border-border flex gap-2 items-center opacity-70">
                 <span className="w-1.5 h-1.5 bg-primary animate-bounce delay-75" />
                 <span className="w-1.5 h-1.5 bg-primary animate-bounce delay-150" />
                 <span className="w-1.5 h-1.5 bg-primary animate-bounce delay-300" />
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background/50 flex gap-2">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Transmit message to asset..."
            className="font-mono rounded-none border-border bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            disabled={replyMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || replyMutation.isPending}
            className="rounded-none font-mono uppercase tracking-widest"
          >
            SEND
          </Button>
        </form>
      </div>
    </div>
  );
}