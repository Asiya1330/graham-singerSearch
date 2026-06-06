import { pool } from "../server/storage";
import { seedDatabase } from "../server/seed-data";

async function seed() {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM search_logs`);
    await client.query(`DELETE FROM contact_reveals`);
    await client.query(`DELETE FROM availabilities`);
    await client.query(`DELETE FROM singer_works`);
    await client.query(`DELETE FROM singer_roles`);
    await client.query(`DELETE FROM organizations`);
    await client.query(`DELETE FROM singers`);

    await seedDatabase(client);

    console.log("Seed completed successfully!");
    console.log("\nDemo login credentials (password for all: password123):");
    console.log("  Singer - Anna Petrova: anna.petrova@example.com");
    console.log("  Singer - Carmen Delgado: carmen.delgado@example.com");
    console.log("  Singer - Michael Torres: michael.torres@example.com");
    console.log("  Singer - Vladimir Petrov: vladimir.petrov@example.com");
    console.log("  Org - Metropolitan Opera: sarah.mitchell@metopera.org");
    console.log("  Org - Arizona Opera: casting@azopera.org");
    console.log("  Org - Opera San José: casting@operasanjose.org");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
