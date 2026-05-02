import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import BotsList from "@/pages/bots/index";
import BotDetail from "@/pages/bots/[botId]";
import Configure from "@/pages/configure";
import MissionsList from "@/pages/missions/index";
import MissionNew from "@/pages/missions/new";
import MissionDetail from "@/pages/missions/[missionId]";
import Marketplace from "@/pages/marketplace";
import Adf from "@/pages/adf";
import Dashboard from "@/pages/dashboard";
import Waitlist from "@/pages/waitlist";
import Roadmap from "@/pages/roadmap";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bots" component={BotsList} />
      <Route path="/bots/:botId" component={BotDetail} />
      <Route path="/configure" component={Configure} />
      <Route path="/missions" component={MissionsList} />
      <Route path="/missions/new" component={MissionNew} />
      <Route path="/adf" component={Adf} />
      <Route path="/missions/:missionId" component={MissionDetail} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/roadmap" component={Roadmap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
