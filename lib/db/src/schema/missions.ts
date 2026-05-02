import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const missionsTable = pgTable("missions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  buildId: uuid("build_id").notNull(),
  objective: text("objective").notNull(),
  missionBrief: text("mission_brief"),
  targetMaterial: text("target_material"),
  durationSols: integer("duration_sols").notNull(),
  locationName: text("location_name").notNull(),
  sectorId: text("sector_id"),
  parcelId: text("parcel_id"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  status: text("status").notNull().default("QUEUED"),
  progressPercent: integer("progress_percent").notNull().default(0),
  founderHandle: text("founder_handle").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MissionRow = typeof missionsTable.$inferSelect;
