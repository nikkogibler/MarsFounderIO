import {
  pgTable,
  text,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const addonsTable = pgTable("addons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  massKg: doublePrecision("mass_kg").notNull(),
  powerEffectWatts: integer("power_effect_watts").notNull(),
  creditsPerHour: integer("credits_per_hour").notNull(),
});

export type AddonRow = typeof addonsTable.$inferSelect;
