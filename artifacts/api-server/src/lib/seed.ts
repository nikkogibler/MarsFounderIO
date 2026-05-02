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
      "Catalogued 41,000 km² of terrain across three founders. Notable for refusing to drive through the Hellas basin. 'It's a vibe,' she said.",
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

const TOOLS = [
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

const ADDONS = [
  { id: "addon-heat-shield", name: "Reinforced Heat Shield", category: "HEAT_SHIELD", description: "Additional thermal protection for exposed operations.", massKg: 35, powerEffectWatts: 0, creditsPerHour: 12 },
  { id: "addon-solar-extra", name: "Auxiliary Solar Array", category: "EXTRA_SOLAR", description: "Supplemental generation capacity in clear conditions.", massKg: 14, powerEffectWatts: 600, creditsPerHour: 18 },
  { id: "addon-comms-relay", name: "High-Gain Comms Relay", category: "COMMS_RELAY", description: "Dedicated uplink for operations outside standard mesh coverage.", massKg: 11, powerEffectWatts: -120, creditsPerHour: 22 },
  { id: "addon-battery-pack", name: "Auxiliary Battery Pack", category: "BATTERY_PACK", description: "Additional energy storage for long-duration tasking.", massKg: 26, powerEffectWatts: 0, creditsPerHour: 14 },
  { id: "addon-rad-shield", name: "Radiation Shielding Plate", category: "RADIATION_SHIELD", description: "Extra shielding for electronics in high-exposure areas.", massKg: 31, powerEffectWatts: 0, creditsPerHour: 16 },
  { id: "addon-dust-filter", name: "Cyclonic Dust Filter", category: "DUST_FILTER", description: "Bearing and intake protection for high-dust environments.", massKg: 7, powerEffectWatts: -30, creditsPerHour: 11 },
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
