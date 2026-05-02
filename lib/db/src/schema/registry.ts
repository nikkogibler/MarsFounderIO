import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sectorRegistryTable = pgTable("sector_registry_overrides", {
  sectorId: text("sector_id").primaryKey(),
  displayName: text("display_name").notNull(),
  notes: text("notes"),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const parcelRegistryTable = pgTable("parcel_registry_overrides", {
  parcelId: text("parcel_id").primaryKey(),
  displayName: text("display_name").notNull(),
  notes: text("notes"),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SectorRegistryRow = typeof sectorRegistryTable.$inferSelect;
export type ParcelRegistryRow = typeof parcelRegistryTable.$inferSelect;