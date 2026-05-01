import {
  pgTable,
  text,
  integer,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const toolsTable = pgTable("tools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  massKg: doublePrecision("mass_kg").notNull(),
  powerDrawWatts: integer("power_draw_watts").notNull(),
  creditsPerHour: integer("credits_per_hour").notNull(),
  compatibleRoles: text("compatible_roles").array().notNull(),
});

export type ToolRow = typeof toolsTable.$inferSelect;
