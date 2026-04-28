// scripts/create-admin.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { users } from "../db/schema";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function createMasterAdmin() {
  // 🛑 CHANGE THESE TO YOUR PREFERRED CREDENTIALS 🛑
  const adminEmail = "bauzonarchie@gmail.com";
  const adminPassword = "Magic123!";
  const adminName = "Archie Bauzon"; // Or whoever the main boss is

  console.log(`Generating Master Admin for ${adminEmail}...`);

  try {
    // 1. Securely hash the password (never store plain text!)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // 2. Insert the user into Neon with 'admin' and 'all' privileges
    await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "admin", // Full system access
      department: "all", // Access to both Trucking and Eggs
    });

    console.log("✅ Master Admin successfully created in the database!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createMasterAdmin();
