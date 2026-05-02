import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  parcelRegistryTable,
  sectorRegistryTable,
} from "@workspace/db";
import {
  GetRegistryOverridesResponse,
  UpsertRegistryParcelBody,
  UpsertRegistryParcelParams,
  UpsertRegistrySectorBody,
  UpsertRegistrySectorParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/registry/overrides", async (_req, res): Promise<void> => {
  const [sectors, parcels] = await Promise.all([
    db.select().from(sectorRegistryTable).orderBy(desc(sectorRegistryTable.updatedAt)),
    db.select().from(parcelRegistryTable).orderBy(desc(parcelRegistryTable.updatedAt)),
  ]);

  res.json(GetRegistryOverridesResponse.parse({ sectors, parcels }));
});

router.put("/registry/sectors/:sectorId", async (req, res): Promise<void> => {
  const params = UpsertRegistrySectorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpsertRegistrySectorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  if (data.displayName.length > 80) {
    res.status(400).json({ error: "displayName exceeds 80 characters" });
    return;
  }
  if (data.founderHandle.length > 40) {
    res.status(400).json({ error: "founderHandle exceeds 40 characters" });
    return;
  }
  if (data.notes && data.notes.length > 500) {
    res.status(400).json({ error: "notes exceeds 500 characters" });
    return;
  }

  const [row] = await db
    .insert(sectorRegistryTable)
    .values({
      sectorId: params.data.sectorId,
      displayName: data.displayName.trim(),
      notes: data.notes?.trim() || null,
      updatedBy: data.founderHandle.trim(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: sectorRegistryTable.sectorId,
      set: {
        displayName: data.displayName.trim(),
        notes: data.notes?.trim() || null,
        updatedBy: data.founderHandle.trim(),
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json(row);
});

router.put("/registry/parcels/:parcelId", async (req, res): Promise<void> => {
  const params = UpsertRegistryParcelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpsertRegistryParcelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  if (data.displayName.length > 80) {
    res.status(400).json({ error: "displayName exceeds 80 characters" });
    return;
  }
  if (data.founderHandle.length > 40) {
    res.status(400).json({ error: "founderHandle exceeds 40 characters" });
    return;
  }
  if (data.notes && data.notes.length > 500) {
    res.status(400).json({ error: "notes exceeds 500 characters" });
    return;
  }

  const [row] = await db
    .insert(parcelRegistryTable)
    .values({
      parcelId: params.data.parcelId,
      displayName: data.displayName.trim(),
      notes: data.notes?.trim() || null,
      updatedBy: data.founderHandle.trim(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: parcelRegistryTable.parcelId,
      set: {
        displayName: data.displayName.trim(),
        notes: data.notes?.trim() || null,
        updatedBy: data.founderHandle.trim(),
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json(row);
});

export default router;