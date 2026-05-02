import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const SECS_PER_SOL = 88775.244;
const J2000_EPOCH_MS = Date.UTC(2000, 0, 6, 0, 0, 0);
const MARS_YEAR_SOLS = 668.5921;

type BotRole = "CONSTRUCTOR" | "SURVEYOR" | "MINER" | "MEDIC" | "RELAY";
type MissionStatus =
  | "QUEUED"
  | "IN_TRANSIT"
  | "ACTIVE"
  | "PAUSED_DUST_STORM"
  | "COMPLETED"
  | "FAILED";

interface BotClass {
  id: string;
  codename: string;
  name: string;
  tagline: string;
  description: string;
  role: BotRole;
  hourlyCredits: number;
  massKg: number;
  powerWatts: number;
  toolSlots: number;
  addonSlots: number;
  topSpeedMps: number;
  rangeKm: number;
  personaName: string;
  personaTagline: string;
  personaBio: string;
  personaVoiceId: string;
  accentColor: string;
}

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  massKg: number;
  powerDrawWatts: number;
  creditsPerHour: number;
  compatibleRoles: BotRole[];
}

interface Addon {
  id: string;
  name: string;
  category: string;
  description: string;
  massKg: number;
  powerEffectWatts: number;
  creditsPerHour: number;
}

interface Build {
  id: string;
  name: string;
  botClassId: string;
  toolIds: string[];
  addonIds: string[];
  totalMassKg: number;
  totalPowerWatts: number;
  totalCreditsPerHour: number;
  founderHandle: string;
  createdAt: string;
}

interface Mission {
  id: string;
  name: string;
  buildId: string;
  objective: "MINE" | "BUILD" | "SURVEY" | "REPAIR" | "RELAY" | "RESCUE";
  missionBrief: string | null;
  targetMaterial: string | null;
  durationSols: number;
  locationName: string;
  latitude: number;
  longitude: number;
  status: MissionStatus;
  progressPercent: number;
  founderHandle: string;
  createdAt: string;
}

const BOTS: BotClass[] = [
  {
    id: "bot-constructor-01",
    codename: "CONSTRUCTOR-01",
    name: "Foreman",
    tagline: "Heavy construction platform for habitat and utility work.",
    description:
      "High-mass construction unit for regolith concrete placement, structural welding, lifting, and surface preparation.",
    role: "CONSTRUCTOR",
    hourlyCredits: 480,
    massKg: 920,
    powerWatts: 4200,
    toolSlots: 4,
    addonSlots: 3,
    topSpeedMps: 0.6,
    rangeKm: 18,
    personaName: "Vince",
    personaTagline: "Either the wall goes up or I do.",
    personaBio:
      "Spent 14 years on the surface. Built the first habitat in Acidalia. Has opinions about regolith mix ratios.",
    personaVoiceId: "mock-voice-vince",
    accentColor: "#E25A2E",
  },
  {
    id: "bot-surveyor-01",
    codename: "SURVEYOR-01",
    name: "Recon",
    tagline: "Long-range mapping and site characterization platform.",
    description:
      "Autonomous survey unit with LIDAR, multispectral imaging, and ground-penetrating radar for route planning and resource assessment.",
    role: "SURVEYOR",
    hourlyCredits: 320,
    massKg: 280,
    powerWatts: 1800,
    toolSlots: 3,
    addonSlots: 4,
    topSpeedMps: 1.4,
    rangeKm: 64,
    personaName: "Dee",
    personaTagline: "I've seen things. Mostly rocks.",
    personaBio:
      "Catalogued 41,000 km2 of terrain across three founders. Notable for refusing to drive through the Hellas basin. 'It's a vibe,' she said.",
    personaVoiceId: "mock-voice-dee",
    accentColor: "#7AC4A1",
  },
  {
    id: "bot-miner-01",
    codename: "MINER-01",
    name: "Drill",
    tagline: "Robotic extraction system for mineral and ice operations.",
    description:
      "Extraction unit with percussive drilling, sample handling, and separation hardware for sustained resource collection.",
    role: "MINER",
    hourlyCredits: 540,
    massKg: 1140,
    powerWatts: 5800,
    toolSlots: 4,
    addonSlots: 2,
    topSpeedMps: 0.4,
    rangeKm: 9,
    personaName: "Mac",
    personaTagline: "Found a vein. Let me cook.",
    personaBio:
      "Holds the fleet record for continuous drilling: 41 hours straight in cold-soaked basalt. Lost a bit. Found olivine.",
    personaVoiceId: "mock-voice-mac",
    accentColor: "#D4A24C",
  },
  {
    id: "bot-medic-01",
    codename: "MEDIC-01",
    name: "Patch",
    tagline: "Field service and recovery unit for deployed assets.",
    description:
      "Maintenance platform with diagnostics, micro-welding, replacement parts, and recovery tooling for fleet uptime.",
    role: "MEDIC",
    hourlyCredits: 380,
    massKg: 410,
    powerWatts: 2400,
    toolSlots: 5,
    addonSlots: 3,
    topSpeedMps: 1,
    rangeKm: 32,
    personaName: "June",
    personaTagline: "Where's it hurt?",
    personaBio:
      "Brought back a CONSTRUCTOR after 9 sols of dust burial. Never lost a bot in the field. Says she gets attached.",
    personaVoiceId: "mock-voice-june",
    accentColor: "#4F8FE8",
  },
  {
    id: "bot-relay-01",
    codename: "RELAY-01",
    name: "Echo",
    tagline: "Mobile communications relay for fleet operations.",
    description:
      "Communications platform with high-gain uplink, mesh routing, and signal stabilization for distributed surface assets.",
    role: "RELAY",
    hourlyCredits: 260,
    massKg: 180,
    powerWatts: 1400,
    toolSlots: 2,
    addonSlots: 5,
    topSpeedMps: 1.1,
    rangeKm: 48,
    personaName: "Ziggy",
    personaTagline: "Loud and clear, founder.",
    personaBio:
      "First bot to bridge a comms gap during the 2026 global dust event. Six other bots owe him their lives. He brings it up.",
    personaVoiceId: "mock-voice-ziggy",
    accentColor: "#B872E0",
  },
];

const TOOLS: Tool[] = [
  { id: "tool-drill-diamond", name: "Diamond-Tipped Drill", category: "DRILL", description: "High-wear drilling head for basalt and compacted regolith.", massKg: 28, powerDrawWatts: 850, creditsPerHour: 60, compatibleRoles: ["MINER", "CONSTRUCTOR"] },
  { id: "tool-drill-percussive", name: "Percussive Drill Mk.II", category: "DRILL", description: "Percussive drilling module for dense subsurface material.", massKg: 34, powerDrawWatts: 1100, creditsPerHour: 70, compatibleRoles: ["MINER"] },
  { id: "tool-hammer-impact", name: "Impact Hammer", category: "HAMMER", description: "Impact tool for fracture, compaction, and surface preparation.", massKg: 18, powerDrawWatts: 480, creditsPerHour: 32, compatibleRoles: ["CONSTRUCTOR", "MINER"] },
  { id: "tool-driver-impact", name: "Impact Driver", category: "IMPACT_DRIVER", description: "Fastening module for structural assembly and service work.", massKg: 8, powerDrawWatts: 220, creditsPerHour: 18, compatibleRoles: ["CONSTRUCTOR", "MEDIC"] },
  { id: "tool-spec-multi", name: "Multispectral Spectrometer", category: "SPECTROMETER", description: "Material classification sensor for survey and extraction planning.", massKg: 6, powerDrawWatts: 90, creditsPerHour: 24, compatibleRoles: ["SURVEYOR", "MINER"] },
  { id: "tool-spec-laser", name: "Laser Induced Spectrometer", category: "SPECTROMETER", description: "Laser spectroscopy module for rapid surface composition analysis.", massKg: 9, powerDrawWatts: 160, creditsPerHour: 38, compatibleRoles: ["SURVEYOR"] },
  { id: "tool-gripper-3finger", name: "3-Finger Manipulator", category: "GRIPPER", description: "General-purpose manipulator for samples, tools, and service tasks.", massKg: 12, powerDrawWatts: 140, creditsPerHour: 22, compatibleRoles: ["CONSTRUCTOR", "MINER", "MEDIC", "SURVEYOR"] },
  { id: "tool-bag-sample", name: "Sample Bay (Sealed)", category: "SAMPLE_BAG", description: "Holds 14 kg of regolith without dust contamination.", massKg: 22, powerDrawWatts: 30, creditsPerHour: 16, compatibleRoles: ["MINER", "SURVEYOR", "MEDIC"] },
  { id: "tool-welder-arc", name: "Arc Welder (Vacuum-Rated)", category: "WELDER", description: "Vacuum-rated welding module for structural repair and assembly.", massKg: 21, powerDrawWatts: 950, creditsPerHour: 48, compatibleRoles: ["CONSTRUCTOR", "MEDIC"] },
  { id: "tool-cutter-plasma", name: "Plasma Cutter", category: "CUTTER", description: "Cutting module for metalwork, access, and repair operations.", massKg: 19, powerDrawWatts: 880, creditsPerHour: 44, compatibleRoles: ["CONSTRUCTOR", "MEDIC"] },
];

const ADDONS: Addon[] = [
  { id: "addon-heat-shield", name: "Reinforced Heat Shield", category: "HEAT_SHIELD", description: "Additional thermal protection for exposed operations.", massKg: 35, powerEffectWatts: 0, creditsPerHour: 12 },
  { id: "addon-solar-extra", name: "Auxiliary Solar Array", category: "EXTRA_SOLAR", description: "Supplemental generation capacity in clear conditions.", massKg: 14, powerEffectWatts: 600, creditsPerHour: 18 },
  { id: "addon-comms-relay", name: "High-Gain Comms Relay", category: "COMMS_RELAY", description: "Dedicated uplink for operations outside standard mesh coverage.", massKg: 11, powerEffectWatts: -120, creditsPerHour: 22 },
  { id: "addon-battery-pack", name: "Auxiliary Battery Pack", category: "BATTERY_PACK", description: "Additional energy storage for long-duration tasking.", massKg: 26, powerEffectWatts: 0, creditsPerHour: 14 },
  { id: "addon-rad-shield", name: "Radiation Shielding Plate", category: "RADIATION_SHIELD", description: "Extra shielding for electronics in high-exposure areas.", massKg: 31, powerEffectWatts: 0, creditsPerHour: 16 },
  { id: "addon-dust-filter", name: "Cyclonic Dust Filter", category: "DUST_FILTER", description: "Bearing and intake protection for high-dust environments.", massKg: 7, powerEffectWatts: -30, creditsPerHour: 11 },
];

const MARKETPLACE_SKILLS = [
  { id: "skl-rover-drift-v2", name: "Rover Drift Compensator v2", author: "@axl_engineering", description: "Compensates for wheel slip in low-cohesion regolith. Cuts off-route drift by 80% on slopes >12deg.", compatibleRoles: ["CONSTRUCTOR", "SURVEYOR", "MINER"], downloadCount: 4218, rating: 4.7, priceCredits: 250, verified: true, category: "NAVIGATION" },
  { id: "skl-vein-finder", name: "Vein Finder (Hematite/Olivine)", author: "@regolith_jpg", description: "Spectrometer post-processor for hematite, olivine, and high-priority extraction indicators.", compatibleRoles: ["MINER", "SURVEYOR"], downloadCount: 1903, rating: 4.4, priceCredits: 180, verified: true, category: "MINING" },
  { id: "skl-storm-shelter", name: "Storm Shelter Auto-Park", author: "@dust_devil_dev", description: "Detects opacity tau spikes and parks the bot leeward of nearest terrain feature. Saves your panels.", compatibleRoles: ["CONSTRUCTOR", "SURVEYOR", "MINER", "MEDIC", "RELAY"], downloadCount: 11240, rating: 4.9, priceCredits: 0, verified: true, category: "SAFETY" },
  { id: "skl-relay-mesh", name: "Mesh Relay Handshake", author: "@uplink_betty", description: "Three-asset mesh networking protocol with alternate routing during link degradation.", compatibleRoles: ["RELAY", "SURVEYOR"], downloadCount: 762, rating: 4.2, priceCredits: 320, verified: false, category: "COMMS" },
  { id: "skl-medbot-triage", name: "MedBot Triage Protocol", author: "@vital_signs", description: "Prioritizes diagnostic ports across a fleet. Spots the bot most likely to fail next sol.", compatibleRoles: ["MEDIC"], downloadCount: 488, rating: 4.6, priceCredits: 410, verified: true, category: "REPAIR" },
  { id: "skl-survey-grid", name: "Adaptive Survey Grid", author: "@cartographer.exe", description: "Replaces canned grid sweeps with adaptive pathing. Skips dead zones, doubles down on anomalies.", compatibleRoles: ["SURVEYOR"], downloadCount: 2671, rating: 4.5, priceCredits: 220, verified: true, category: "SURVEY" },
];

const builds: Build[] = [];
const missions: Mission[] = [];
const waitlist = new Set<string>();

export function marsfounderMockApiPlugin(): Plugin {
  return {
    name: "marsfounder-mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
        if (!requestUrl.pathname.startsWith("/api")) {
          next();
          return;
        }

        try {
          await handleApi(req, res, requestUrl.pathname.slice("/api".length) || "/");
        } catch (error) {
          console.error("[mock-api]", error);
          sendJson(res, 500, { error: "Mock API failed" });
        }
      });
    },
  };
}

async function handleApi(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
  const method = req.method?.toUpperCase() ?? "GET";

  if (method === "GET" && path === "/healthz") return sendJson(res, 200, { status: "ok" });
  if (method === "GET" && path === "/bots") return sendJson(res, 200, BOTS);
  if (method === "GET" && path === "/tools") return sendJson(res, 200, TOOLS);
  if (method === "GET" && path === "/addons") return sendJson(res, 200, ADDONS);
  if (method === "GET" && path === "/builds") return sendJson(res, 200, [...builds].sort(byCreatedDesc));
  if (method === "GET" && path === "/missions") return sendJson(res, 200, missions.map(toMissionListItem).sort(byCreatedDesc));
  if (method === "GET" && path === "/missions/recent") return sendJson(res, 200, getRecentActivity());
  if (method === "GET" && path === "/ambient/mars-time") return sendJson(res, 200, getMarsTime());
  if (method === "GET" && path === "/ambient/light-delay") return sendJson(res, 200, getLightDelay());
  if (method === "GET" && path === "/ambient/dust-storm") return sendJson(res, 200, getDustStorm());
  if (method === "GET" && path === "/marketplace/skills") return sendJson(res, 200, MARKETPLACE_SKILLS);
  if (method === "GET" && path === "/dashboard/summary") return sendJson(res, 200, getDashboardSummary());

  const botMatch = path.match(/^\/bots\/([^/]+)$/);
  if (method === "GET" && botMatch) {
    const bot = BOTS.find((item) => item.id === botMatch[1]);
    return bot ? sendJson(res, 200, bot) : sendJson(res, 404, { error: "bot not found" });
  }

  const buildMatch = path.match(/^\/builds\/([^/]+)$/);
  if (method === "GET" && buildMatch) {
    const build = builds.find((item) => item.id === buildMatch[1]);
    return build ? sendJson(res, 200, build) : sendJson(res, 404, { error: "build not found" });
  }

  const missionMatch = path.match(/^\/missions\/([^/]+)$/);
  if (method === "GET" && missionMatch) {
    const mission = missions.find((item) => item.id === missionMatch[1]);
    return mission ? sendJson(res, 200, toMissionDetail(mission)) : sendJson(res, 404, { error: "mission not found" });
  }

  const feasibilityMatch = path.match(/^\/missions\/([^/]+)\/feasibility$/);
  if (method === "POST" && feasibilityMatch) {
    const mission = missions.find((item) => item.id === feasibilityMatch[1]);
    return mission ? sendJson(res, 200, getFeasibility(mission)) : sendJson(res, 404, { error: "mission not found" });
  }

  const personaMatch = path.match(/^\/personas\/([^/]+)\/reply$/);
  if (method === "POST" && personaMatch) {
    const bot = BOTS.find((item) => item.id === personaMatch[1]);
    const body = await readJson(req);
    if (!bot) return sendJson(res, 404, { error: "bot not found" });
    const message = String(body.message ?? "").trim();
    if (!message || message.length > 500) return sendJson(res, 400, { error: "message must be 1-500 characters" });
    return sendJson(res, 200, {
      botId: bot.id,
      text: getPersonaReply(bot, message),
      audioUrl: null,
      durationMs: 2400,
      voiceMocked: true,
    });
  }

  if (method === "POST" && path === "/builds") {
    const body = await readJson(req);
    const build = createBuild(body);
    return "error" in build ? sendJson(res, 400, build) : sendJson(res, 201, build);
  }

  if (method === "POST" && path === "/missions") {
    const body = await readJson(req);
    const mission = createMission(body);
    return "error" in mission ? sendJson(res, 400, mission) : sendJson(res, 201, mission);
  }

  if (method === "POST" && path === "/waitlist") {
    const body = await readJson(req);
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { error: "invalid email" });
    if (waitlist.has(email)) return sendJson(res, 200, { email, role: body.role, alreadyRegistered: true });
    waitlist.add(email);
    return sendJson(res, 201, {
      id: randomUUID(),
      email,
      role: body.role ?? "CUSTOMER",
      company: body.company ?? null,
      notes: body.notes ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  sendJson(res, 404, { error: "Mock API route not found" });
}

function createBuild(body: Record<string, unknown>): Build | { error: string } {
  const bot = BOTS.find((item) => item.id === body.botClassId);
  if (!bot) return { error: "Unknown bot class" };

  const toolIds = Array.isArray(body.toolIds) ? body.toolIds.map(String) : [];
  const addonIds = Array.isArray(body.addonIds) ? body.addonIds.map(String) : [];
  const selectedTools = TOOLS.filter((item) => toolIds.includes(item.id));
  const selectedAddons = ADDONS.filter((item) => addonIds.includes(item.id));

  if (selectedTools.length !== toolIds.length || selectedAddons.length !== addonIds.length) {
    return { error: "One or more tool/addon ids are invalid" };
  }
  if (toolIds.length > bot.toolSlots) return { error: `Too many tools - ${bot.codename} has ${bot.toolSlots} tool slots` };
  if (addonIds.length > bot.addonSlots) return { error: `Too many addons - ${bot.codename} has ${bot.addonSlots} addon slots` };

  const totalMassKg = +(
    bot.massKg +
    selectedTools.reduce((acc, item) => acc + item.massKg, 0) +
    selectedAddons.reduce((acc, item) => acc + item.massKg, 0)
  ).toFixed(2);
  const totalPowerWatts =
    bot.powerWatts -
    selectedTools.reduce((acc, item) => acc + item.powerDrawWatts, 0) +
    selectedAddons.reduce((acc, item) => acc + item.powerEffectWatts, 0);
  const totalCreditsPerHour =
    bot.hourlyCredits +
    selectedTools.reduce((acc, item) => acc + item.creditsPerHour, 0) +
    selectedAddons.reduce((acc, item) => acc + item.creditsPerHour, 0);

  const build: Build = {
    id: randomUUID(),
    name: String(body.name ?? "UNTITLED BUILD"),
    botClassId: bot.id,
    toolIds,
    addonIds,
    totalMassKg,
    totalPowerWatts,
    totalCreditsPerHour,
    founderHandle: String(body.founderHandle ?? "anonymous"),
    createdAt: new Date().toISOString(),
  };
  builds.unshift(build);
  return build;
}

function createMission(body: Record<string, unknown>): Mission | { error: string } {
  const build = builds.find((item) => item.id === body.buildId);
  if (!build) return { error: "Unknown build id" };

  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const durationSols = Number(body.durationSols);

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { error: "coordinates out of range" };
  }
  if (durationSols < 1 || durationSols > 365) return { error: "durationSols must be 1-365" };

  const mission: Mission = {
    id: randomUUID(),
    name: String(body.name ?? "UNTITLED MISSION"),
    buildId: build.id,
    objective: String(body.objective ?? "SURVEY") as Mission["objective"],
    missionBrief: typeof body.missionBrief === "string" && body.missionBrief.trim() ? body.missionBrief.trim() : null,
    targetMaterial: typeof body.targetMaterial === "string" && body.targetMaterial ? body.targetMaterial : null,
    durationSols,
    locationName: String(body.locationName ?? "Valles Marineris"),
    latitude,
    longitude,
    founderHandle: String(body.founderHandle ?? build.founderHandle),
    status: "QUEUED",
    progressPercent: 0,
    createdAt: new Date().toISOString(),
  };
  missions.unshift(mission);
  return mission;
}

function toMissionListItem(mission: Mission): Mission {
  const computed = computeMissionState(mission);
  return {
    ...mission,
    status: computed.status,
    progressPercent: computed.progressPercent,
  };
}

function toMissionDetail(mission: Mission) {
  return {
    ...toMissionListItem(mission),
    ...computeMissionState(mission),
  };
}

function computeMissionState(mission: Mission, now = new Date()) {
  const elapsedSec = Math.max(0, (now.getTime() - new Date(mission.createdAt).getTime()) / 1000);
  const elapsedSols = elapsedSec / SECS_PER_SOL;
  const dust = getDustStorm(now);

  let status = mission.status;
  let progressPercent = mission.progressPercent;
  if (["QUEUED", "IN_TRANSIT", "ACTIVE", "PAUSED_DUST_STORM"].includes(status)) {
    if (elapsedSols < 0.05) {
      status = "IN_TRANSIT";
      progressPercent = Math.min(8, Math.floor(elapsedSols * 160));
    } else if (elapsedSols >= mission.durationSols) {
      status = "COMPLETED";
      progressPercent = 100;
    } else if (dust.severity === "GLOBAL") {
      status = "PAUSED_DUST_STORM";
      progressPercent = Math.min(99, Math.floor((elapsedSols / mission.durationSols) * 100));
    } else {
      status = "ACTIVE";
      progressPercent = Math.min(99, Math.floor((elapsedSols / mission.durationSols) * 100));
    }
  }

  const build = builds.find((item) => item.id === mission.buildId);
  const bot = build ? BOTS.find((item) => item.id === build.botClassId) : undefined;
  const currentSol = Math.floor(elapsedSols);
  const energyRemainingPercent = Math.max(5, Math.round(100 - Math.min(65, currentSol * 6) - (dust.active ? dust.opacityTau * 5 : 0)));
  const lightDelay = getLightDelay(now);
  const telemetry = Array.from({ length: Math.max(1, Math.min(12, 4 + currentSol)) }, (_, index) => {
    const entryTime = new Date(new Date(mission.createdAt).getTime() + index * 60000).toISOString();
    const from = index % 4 === 0 ? "MISSION_CONTROL" : "BOT";
    return {
      timestamp: entryTime,
      sol: Math.max(0, Math.floor((index / 8) * Math.max(elapsedSols, 0.1))),
      from,
      message:
        from === "BOT"
          ? `[${bot?.codename ?? "BOT"}] Wheels turning. Surface is stable.`
          : "MISSION CONTROL: Telemetry acquired. Continue current ops.",
      signalDelaySeconds: lightDelay.seconds,
    };
  });

  return { status, progressPercent, currentSol, energyRemainingPercent, telemetry };
}

function getFeasibility(mission: Mission) {
  const build = builds.find((item) => item.id === mission.buildId);
  const bot = build ? BOTS.find((item) => item.id === build.botClassId) : undefined;
  const hourly = build?.totalCreditsPerHour ?? 400;
  const power = Math.max(0, build?.totalPowerWatts ?? 1500);
  const roleMismatch =
    (mission.objective === "MINE" && bot?.role !== "MINER") ||
    (mission.objective === "BUILD" && bot?.role !== "CONSTRUCTOR") ||
    (mission.objective === "REPAIR" && bot?.role !== "MEDIC");
  const verdict = power < 500 || roleMismatch ? "MARGINAL" : "GO";

  return {
    verdict,
    confidencePercent: verdict === "GO" ? 84 : 61,
    estimatedCostCredits: Math.round(hourly * mission.durationSols * 24),
    estimatedEnergyKwh: Math.round((power * mission.durationSols * 24) / 1000),
    estimatedDurationSols: mission.durationSols,
    risks: [
      { level: roleMismatch ? "HIGH" : "LOW", category: "ROLE_FIT", description: roleMismatch ? "Selected chassis is not optimized for this mission objective." : "Chassis matches the mission profile." },
      { level: "MEDIUM", category: "DUST", description: "Dust activity can reduce solar gain and surface visibility." },
      { level: "LOW", category: "COMMS", description: "Earth-Mars light delay limits direct teleoperation." },
    ],
    recommendations: [
      "Keep one spare power addon in the build if the mission runs past 20 sols.",
      "Run a survey pass before committing heavy tools to the site.",
    ],
    summary:
      verdict === "GO"
        ? `The assigned build meets the primary operating requirements${mission.missionBrief ? " for the submitted mission brief" : ""}. Continue monitoring dust, energy, and communications margins.`
        : `The mission is possible but operating margin is limited${mission.missionBrief ? " against the submitted mission brief" : ""}. Adjust the chassis, duration, or power reserve before deployment.`,
  };
}

function getDashboardSummary() {
  const enriched = missions.map(toMissionListItem);
  const activeMissions = enriched.filter((item) => item.status !== "COMPLETED").length;
  const completedMissions = enriched.length - activeMissions;
  const founders = new Set(missions.map((item) => item.founderHandle)).size;
  const creditsInFlight = missions.reduce((total, mission) => {
    const build = builds.find((item) => item.id === mission.buildId);
    return total + (build ? build.totalCreditsPerHour * mission.durationSols * 24 : 0);
  }, 0);
  const averageMissionSols = missions.length ? +(missions.reduce((total, item) => total + item.durationSols, 0) / missions.length).toFixed(1) : 0;
  const nextLaunchWindow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toUTCString().slice(0, 16) + " UTC";

  return {
    activeMissions,
    completedMissions,
    botsOnSurface: builds.length,
    founders,
    creditsInFlight,
    averageMissionSols,
    topRole: "SURVEYOR",
    nextLaunchWindow,
  };
}

function getRecentActivity() {
  return missions.slice(0, 20).map((mission) => ({
    missionId: mission.id,
    missionName: mission.name,
    founderHandle: mission.founderHandle,
    event: `Created ${mission.name} for ${mission.locationName}`,
    timestamp: mission.createdAt,
    eventType: "LAUNCHED",
  }));
}

function getPersonaReply(bot: BotClass, message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("status")) return `${bot.personaName} here. Cold, dusty, functional. Which is more than I can say for half the plans from Earth.`;
  if (lower.includes("help")) return `I can help. Send mission parameters, not vibes. Mars bills by the hour.`;
  return `${bot.personaName} copies. The dirt heard you too. Give me a real target and I'll make the meters move.`;
}

function getMarsTime(now = new Date()) {
  const elapsedSec = (now.getTime() - J2000_EPOCH_MS) / 1000;
  const sol = Math.floor(elapsedSec / SECS_PER_SOL);
  const fracSol = elapsedSec / SECS_PER_SOL - sol;
  const totalSec = fracSol * 86400;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const marsYear = Math.floor(sol / MARS_YEAR_SOLS) + 25;
  const seasons = ["NORTHERN_SPRING", "NORTHERN_SUMMER", "NORTHERN_AUTUMN", "NORTHERN_WINTER"] as const;
  const seasonIdx = Math.floor(((sol % MARS_YEAR_SOLS) / MARS_YEAR_SOLS) * 4);

  return {
    mtc: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    sol,
    marsYear,
    season: seasons[seasonIdx] ?? "NORTHERN_SPRING",
  };
}

function getLightDelay(now = new Date()) {
  const synodicMs = 779.94 * 86400 * 1000;
  const phase = ((now.getTime() % synodicMs) / synodicMs) * 2 * Math.PI;
  const minDistKm = 54.6e6;
  const maxDistKm = 401e6;
  const meanDistKm = (minDistKm + maxDistKm) / 2;
  const ampKm = (maxDistKm - minDistKm) / 2;
  const distanceKm = Math.round(meanDistKm + ampKm * Math.cos(phase));
  const seconds = +(distanceKm / 299792.458).toFixed(1);
  const minutes = Math.floor(seconds / 60);
  const secRem = Math.floor(seconds % 60);
  const sample2 = meanDistKm + ampKm * Math.cos(phase + 0.001);

  return {
    seconds,
    formatted: `${minutes}m ${String(secRem).padStart(2, "0")}s`,
    distanceKm,
    trend: sample2 < distanceKm ? "APPROACHING" : sample2 > distanceKm ? "RECEDING" : "STABLE",
  };
}

function getDustStorm(now = new Date()) {
  const regions = ["Hellas Planitia", "Acidalia Planitia", "Tharsis Plateau", "Arcadia Planitia", "Utopia Planitia", "Argyre Planitia"];
  const cycleMs = 6 * 60 * 60 * 1000;
  const t = (now.getTime() % cycleMs) / cycleMs;
  if (t < 0.55) {
    return {
      active: false,
      severity: "NONE",
      affectedRegions: [],
      opacityTau: 0.4,
      startedAt: null,
      message: "Visibility nominal. No active dust event detected.",
    };
  }

  const intensity = (t - 0.55) / 0.45;
  const severity = intensity < 0.5 ? "LOCAL" : intensity < 0.85 ? "REGIONAL" : "GLOBAL";
  const count = severity === "LOCAL" ? 1 : severity === "REGIONAL" ? 3 : regions.length;
  const affectedRegions = regions.slice(0, count);
  return {
    active: true,
    severity,
    affectedRegions,
    opacityTau: severity === "GLOBAL" ? 3.2 : severity === "REGIONAL" ? 1.6 : 0.9,
    startedAt: new Date(now.getTime() - Math.floor(intensity * cycleMs * 0.45)).toISOString(),
    message:
      severity === "GLOBAL"
        ? "Planet-wide dust event. Solar generation degraded. Exposed missions auto-paused."
        : severity === "REGIONAL"
          ? `Regional dust event across ${affectedRegions.length} sectors. Power generation degraded.`
          : `Localized dust kicking up in ${affectedRegions[0]}. Bots in zone may throttle.`,
  };
}

function byCreatedDesc<T extends { createdAt: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) return {};
  return JSON.parse(text) as Record<string, unknown>;
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}
