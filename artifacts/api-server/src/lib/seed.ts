import {
  db,
  botClassesTable,
  toolsTable,
  addonsTable,
} from "@workspace/db";

const BOTS = [
  {
    id: "bot-constructor-01",
    codename: "CONSTRUCTOR-01",
    name: "Foreman",
    tagline: "Builds the habitat. Doesn't ask twice.",
    description:
      "Heavy-frame construction unit. Pours regolith concrete, welds, lifts. The bot you call when something needs to actually exist on Mars.",
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
    tagline: "Maps the unmapped. Quietly judges your route.",
    description:
      "Long-range survey unit. LIDAR, multispectral, ground-penetrating radar. Walks farther than you'd expect a robot to walk.",
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
      "Catalogued 41,000 km² of terrain across three founders. Notable for refusing to drive through the Hellas basin. 'It's a vibe,' she said.",
    personaVoiceId: "mock-voice-dee",
    accentColor: "#7AC4A1",
  },
  {
    id: "bot-miner-01",
    codename: "MINER-01",
    name: "Drill",
    tagline: "Pulls metal out of the cold. Doesn't tire.",
    description:
      "Extraction unit. Diamond-tipped percussive drill, electromagnetic separator, sample bay. Built for hours on the same square meter.",
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
    tagline: "Keeps the fleet alive. Carries the tools.",
    description:
      "Diagnostic and repair unit. Multimeter array, micro-welder, replacement parts cache. Dispatched when another bot stops checking in.",
    role: "MEDIC",
    hourlyCredits: 380,
    massKg: 410,
    powerWatts: 2400,
    toolSlots: 5,
    addonSlots: 3,
    topSpeedMps: 1.0,
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
    tagline: "Holds the signal. Talks to the orbit.",
    description:
      "Mobile comms relay. High-gain dish, mesh radio array, signal booster. Parks on high ground and keeps the fleet talking.",
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

const TOOLS = [
  { id: "tool-drill-diamond", name: "Diamond-Tipped Drill", category: "DRILL", description: "Cuts cold basalt without complaining.", massKg: 28, powerDrawWatts: 850, creditsPerHour: 60, compatibleRoles: ["MINER", "CONSTRUCTOR"] },
  { id: "tool-drill-percussive", name: "Percussive Drill Mk.II", category: "DRILL", description: "For when the rock is winning.", massKg: 34, powerDrawWatts: 1100, creditsPerHour: 70, compatibleRoles: ["MINER"] },
  { id: "tool-hammer-impact", name: "Impact Hammer", category: "HAMMER", description: "Breaks loose what the drill couldn't.", massKg: 18, powerDrawWatts: 480, creditsPerHour: 32, compatibleRoles: ["CONSTRUCTOR", "MINER"] },
  { id: "tool-driver-impact", name: "Impact Driver", category: "IMPACT_DRIVER", description: "Bolts. Lots of bolts.", massKg: 8, powerDrawWatts: 220, creditsPerHour: 18, compatibleRoles: ["CONSTRUCTOR", "MEDIC"] },
  { id: "tool-spec-multi", name: "Multispectral Spectrometer", category: "SPECTROMETER", description: "Tells you what you're standing on. Usually rust.", massKg: 6, powerDrawWatts: 90, creditsPerHour: 24, compatibleRoles: ["SURVEYOR", "MINER"] },
  { id: "tool-spec-laser", name: "Laser Induced Spectrometer", category: "SPECTROMETER", description: "Vaporizes a tiny dot. Reads the plume. Very tactical.", massKg: 9, powerDrawWatts: 160, creditsPerHour: 38, compatibleRoles: ["SURVEYOR"] },
  { id: "tool-gripper-3finger", name: "3-Finger Manipulator", category: "GRIPPER", description: "Picks up samples without dropping them. Most days.", massKg: 12, powerDrawWatts: 140, creditsPerHour: 22, compatibleRoles: ["CONSTRUCTOR", "MINER", "MEDIC", "SURVEYOR"] },
  { id: "tool-bag-sample", name: "Sample Bay (Sealed)", category: "SAMPLE_BAG", description: "Holds 14 kg of regolith without dust contamination.", massKg: 22, powerDrawWatts: 30, creditsPerHour: 16, compatibleRoles: ["MINER", "SURVEYOR", "MEDIC"] },
  { id: "tool-welder-arc", name: "Arc Welder (Vacuum-Rated)", category: "WELDER", description: "Joins steel in 7 mbar. Don't stare at it.", massKg: 21, powerDrawWatts: 950, creditsPerHour: 48, compatibleRoles: ["CONSTRUCTOR", "MEDIC"] },
  { id: "tool-cutter-plasma", name: "Plasma Cutter", category: "CUTTER", description: "Cuts what needs cutting.", massKg: 19, powerDrawWatts: 880, creditsPerHour: 44, compatibleRoles: ["CONSTRUCTOR", "MEDIC"] },
];

const ADDONS = [
  { id: "addon-heat-shield", name: "Reinforced Heat Shield", category: "HEAT_SHIELD", description: "Survives entry, descent, and the occasional dust devil.", massKg: 35, powerEffectWatts: 0, creditsPerHour: 12 },
  { id: "addon-solar-extra", name: "Auxiliary Solar Array", category: "EXTRA_SOLAR", description: "+600 W in clear skies. 0 W when dust hits tau 3.", massKg: 14, powerEffectWatts: 600, creditsPerHour: 18 },
  { id: "addon-comms-relay", name: "High-Gain Comms Relay", category: "COMMS_RELAY", description: "Direct uplink. Bypass the mesh.", massKg: 11, powerEffectWatts: -120, creditsPerHour: 22 },
  { id: "addon-battery-pack", name: "Auxiliary Battery Pack", category: "BATTERY_PACK", description: "+8 kWh storage. Survives cold snaps.", massKg: 26, powerEffectWatts: 0, creditsPerHour: 14 },
  { id: "addon-rad-shield", name: "Radiation Shielding Plate", category: "RADIATION_SHIELD", description: "Drops electronics fault rate by 60%.", massKg: 31, powerEffectWatts: 0, creditsPerHour: 16 },
  { id: "addon-dust-filter", name: "Cyclonic Dust Filter", category: "DUST_FILTER", description: "Keeps fines out of the bearings. Worth every credit.", massKg: 7, powerEffectWatts: -30, creditsPerHour: 11 },
];

export async function seedIfEmpty(): Promise<void> {
  const existingBots = await db.select().from(botClassesTable).limit(1);
  if (existingBots.length === 0) {
    await db.insert(botClassesTable).values(BOTS);
  }
  const existingTools = await db.select().from(toolsTable).limit(1);
  if (existingTools.length === 0) {
    await db.insert(toolsTable).values(TOOLS);
  }
  const existingAddons = await db.select().from(addonsTable).limit(1);
  if (existingAddons.length === 0) {
    await db.insert(addonsTable).values(ADDONS);
  }
}
