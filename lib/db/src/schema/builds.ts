import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const buildsTable = pgTable("builds", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  botClassId: text("bot_class_id").notNull(),
  toolIds: text("tool_ids").array().notNull(),
  addonIds: text("addon_ids").array().notNull(),
  totalMassKg: doublePrecision("total_mass_kg").notNull(),
  totalPowerWatts: integer("total_power_watts").notNull(),
  totalCreditsPerHour: integer("total_credits_per_hour").notNull(),
  founderHandle: text("founder_handle").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type BuildRow = typeof buildsTable.$inferSelect;
