import { Router, type IRouter } from "express";
import { db, waitlistTable } from "@workspace/db";
import { JoinWaitlistBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/waitlist", async (req, res): Promise<void> => {
  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, role, company, notes } = parsed.data;
  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    res.status(400).json({ error: "invalid email" });
    return;
  }
  if (company && company.length > 120) {
    res.status(400).json({ error: "company exceeds 120 characters" });
    return;
  }
  if (notes && notes.length > 500) {
    res.status(400).json({ error: "notes exceeds 500 characters" });
    return;
  }
  try {
    const [row] = await db
      .insert(waitlistTable)
      .values({
        email: trimmedEmail,
        role,
        company: company?.trim() || null,
        notes: notes?.trim() || null,
      })
      .returning();
    res.status(201).json(row);
  } catch (err: any) {
    const isDup =
      err?.code === "23505" ||
      err?.cause?.code === "23505" ||
      /unique constraint|duplicate key/i.test(err?.message ?? "");
    if (isDup) {
      res.status(200).json({ email: trimmedEmail, role, alreadyRegistered: true });
      return;
    }
    req.log.error({ err }, "Waitlist insert failed");
    res.status(500).json({ error: "Could not register" });
  }
});

export default router;
