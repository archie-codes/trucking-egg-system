// // db/schema.ts
// import {
//   pgTable,
//   serial,
//   varchar,
//   integer,
//   timestamp,
//   text,
//   boolean,
// } from "drizzle-orm/pg-core";

// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 100 }).notNull(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   passwordHash: text("password_hash").notNull(),

//   // ROLE: 'admin' (Boss/Manager) or 'encoder' (Data Entry)
//   role: varchar("role", { length: 20 }).default("encoder").notNull(),

//   // DEPARTMENT: 'trucking', 'eggs', or 'all'
//   department: varchar("department", { length: 20 })
//     .default("trucking")
//     .notNull(),

//   avatarUrl: text("avatar_url"),
//   isActive: boolean("is_active").default(true).notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // ----------------------------------------------------------------------
// // -------------------------- FOR TRUCKING ---------------------------
// // ----------------------------------------------------------------------
// export const liveTrips = pgTable("live_trips", {
//   id: serial("id").primaryKey(),

//   // Trip Details
//   truckId: varchar("truck_id", { length: 50 }).notNull(),
//   customerId: varchar("customer_id", { length: 100 }).notNull(),
//   origin: varchar("origin", { length: 100 }).notNull(),
//   destination: varchar("destination", { length: 100 }).notNull(),
//   qtyHeads: integer("qty_heads").notNull(),
//   rate: integer("rate").notNull(), // Using integer assuming whole Philippine Pesos

//   // Expenses
//   tollFees: integer("toll_fees").default(0).notNull(),
//   dieselAmount: integer("diesel_amount").default(0).notNull(),
//   meals: integer("meals").default(0).notNull(),
//   roroShip: integer("roro_ship").default(0).notNull(),
//   salary: integer("salary").default(0).notNull(),
//   others: integer("others").default(0).notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// export const trucks = pgTable("trucking_fleet", {
//   id: serial("id").primaryKey(),
//   fleetCode: varchar("fleet_code", { length: 20 }).notNull().unique(),
//   plateNumber: varchar("plate_number", { length: 20 }).notNull().unique(),
//   status: varchar("status", { length: 20 }).default("active").notNull(),
//   isActive: boolean("is_active").default(true).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

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

// ======================================================================
// 1. GLOBAL / SYSTEM TABLES
// ======================================================================

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

// ======================================================================
// 2. TRUCKING MODULE TABLES
// ======================================================================

export const truckingFleet = pgTable("trucking_fleet", {
  id: serial("id").primaryKey(),
  fleetCode: varchar("fleet_code", { length: 20 }).notNull().unique(),
  plateNumber: varchar("plate_number", { length: 20 }).notNull().unique(),

  // e.g., 'active', 'maintenance', 'out-of-service'
  status: varchar("status", { length: 20 }).default("active").notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const truckingTrips = pgTable("trucking_trips", {
  id: serial("id").primaryKey(),

  // RELATIONAL LINK: This connects the trip directly to the truck table!
  truckId: integer("truck_id")
    .references(() => truckingFleet.id)
    .notNull(),

  // Core Trip Details
  customerId: varchar("customer_id", { length: 100 }).notNull(),
  area: varchar("area", { length: 100 }).notNull().default(""),
  origin: varchar("origin", { length: 100 }).notNull(),
  destination: varchar("destination", { length: 100 }).notNull(),
  qtyHeads: integer("qty_heads").notNull(),

  // Financials (Using integer assuming whole Philippine Pesos)
  rate: integer("rate").notNull(),
  tollFees: integer("toll_fees").default(0).notNull(),
  dieselAmount: integer("diesel_amount").default(0).notNull(),
  meals: integer("meals").default(0).notNull(),
  roroShip: integer("roro_ship").default(0).notNull(),
  salary: integer("salary").default(0).notNull(),
  others: integer("others").default(0).notNull(),

  // Trip Lifecycle: 'pending', 'in-transit', 'completed', 'cancelled'
  status: varchar("status", { length: 50 }).default("pending").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================================
// 3. EGG SALES MODULE TABLES (Foundation)
// ======================================================================

// Tracks daily stock of different egg sizes (Small, Medium, Large, Jumbo, etc.)
export const eggInventory = pgTable("egg_inventory", {
  id: serial("id").primaryKey(),
  classification: varchar("classification", { length: 50 }).notNull().unique(), // e.g., "Large"
  currentStockTrays: integer("current_stock_trays").default(0).notNull(),
  pricePerTray: integer("price_per_tray").notNull(), // Assuming whole PHP

  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Tracks individual transactions/sales
export const eggSales = pgTable("egg_sales", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id", { length: 100 }).notNull(),

  // Relational link to the egg classification
  inventoryId: integer("inventory_id")
    .references(() => eggInventory.id)
    .notNull(),

  quantityTrays: integer("quantity_trays").notNull(),
  totalAmount: integer("total_amount").notNull(),

  // Payment status: 'paid', 'unpaid'
  paymentStatus: varchar("payment_status", { length: 20 })
    .default("unpaid")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
