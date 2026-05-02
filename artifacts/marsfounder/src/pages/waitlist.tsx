import { useState } from "react";
import { useJoinWaitlist, NewWaitlistEntryRole } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Waitlist() {
  const { toast } = useToast();
  const joinWaitlist = useJoinWaitlist();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<keyof typeof NewWaitlistEntryRole>("CUSTOMER");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    joinWaitlist.mutate({
      data: {
        email,
        role: role as any,
        company: company || undefined,
        notes: notes || undefined
      }
    }, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        toast({
          title: "REQUEST FAILED",
          description: (err as any)?.data?.error || (err as Error)?.message || "Could not add to waitlist.",
          variant: "destructive",
        });
      }
    });
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-6 py-32 text-center max-w-2xl">
        <div className="inline-block border border-primary text-primary px-4 py-2 font-mono text-sm tracking-widest mb-8 bg-primary/10">
          TRANSMISSION RECEIVED
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-6">
          Access request received.
        </h1>
        <p className="font-mono text-muted-foreground mb-12">
          We will contact you when evaluation access is available for your organization.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-none border-border bg-transparent text-foreground hover:border-primary hover:text-primary font-mono uppercase tracking-widest">
          SUBMIT ANOTHER
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="mb-12 border-b border-border pb-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Waitlist</h1>
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          Request evaluation access for MarsFounder surface operations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-card/30 border border-border p-8">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-muted-foreground tracking-widest">WORK EMAIL</label>
          <Input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="founder@company.com"
            className="font-mono rounded-none border-border bg-card"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-muted-foreground tracking-widest">PRIMARY OBJECTIVE</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(NewWaitlistEntryRole).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r as any)}
                className={`p-3 border font-mono text-xs transition-colors ${role === r ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-muted-foreground tracking-widest">ORGANIZATION (OPTIONAL)</label>
          <Input 
            value={company} 
            onChange={e => setCompany(e.target.value)} 
            placeholder="e.g. Ares Infrastructure"
            className="font-mono rounded-none border-border bg-card uppercase"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] text-muted-foreground tracking-widest">MISSION PARAMETERS / NOTES (OPTIONAL)</label>
          <Textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Briefly describe your intended mission profile."
            className="font-mono rounded-none border-border bg-card min-h-[100px] resize-none"
          />
        </div>

        <Button 
          type="submit" 
          disabled={!email || joinWaitlist.isPending}
          className="rounded-none font-bold font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground border border-primary mt-4 py-6"
        >
          {joinWaitlist.isPending ? 'SUBMITTING...' : 'REQUEST ACCESS'}
        </Button>
      </form>
    </div>
  );
}
