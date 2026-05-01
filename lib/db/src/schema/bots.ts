import {
  pgTable,
  text,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const botClassesTable = pgTable("bot_classes", {
  id: text("id").primaryKey(),
  codename: text("codename").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  role: text("role").notNull(),
  hourlyCredits: integer("hourly_credits").notNull(),
  massKg: integer("mass_kg").notNull(),
  powerWatts: integer("power_watts").notNull(),
  toolSlots: integer("tool_slots").notNull(),
  addonSlots: integer("addon_slots").notNull(),
  topSpeedMps: doublePrecision("top_speed_mps").notNull(),
  rangeKm: integer("range_km").notNull(),
  personaName: text("persona_name").notNull(),
  personaTagline: text("persona_tagline").notNull(),
  personaBio: text("persona_bio").notNull(),
  personaVoiceId: text("persona_voice_id").notNull(),
  accentColor: text("accent_color").notNull(),
});

export type BotClassRow = typeof botClassesTable.$inferSelect;
