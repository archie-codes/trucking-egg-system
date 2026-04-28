// db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  // ROLE: 'admin' (Boss/Manager) or 'encoder' (Data Entry)
  role: varchar("role", { length: 20 }).default("encoder").notNull(),

  // DEPARTMENT: 'trucking', 'eggs', or 'all'
  department: varchar("department", { length: 20 })
    .default("trucking")
    .notNull(),

  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const liveTrips = pgTable("live_trips", {
  id: serial("id").primaryKey(),

  // Trip Details
  truckId: varchar("truck_id", { length: 50 }).notNull(),
  customerId: varchar("customer_id", { length: 100 }).notNull(),
  origin: varchar("origin", { length: 100 }).notNull(),
  destination: varchar("destination", { length: 100 }).notNull(),
  qtyHeads: integer("qty_heads").notNull(),
  rate: integer("rate").notNull(), // Using integer assuming whole Philippine Pesos

  // Expenses
  tollFees: integer("toll_fees").default(0).notNull(),
  dieselAmount: integer("diesel_amount").default(0).notNull(),
  meals: integer("meals").default(0).notNull(),
  roroShip: integer("roro_ship").default(0).notNull(),
  salary: integer("salary").default(0).notNull(),
  others: integer("others").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
