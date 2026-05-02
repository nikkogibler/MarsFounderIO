import { seedIfEmpty } from "./lib/seed";

console.log("Running seed...");
await seedIfEmpty();
console.log("Seed complete.");
process.exit(0);
