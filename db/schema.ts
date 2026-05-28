// db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
  real,
  date,
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
  fleetCode: varchar("fleet_code").notNull(),
  plateNumber: varchar("plate_number").notNull(),
  status: varchar("status").notNull().default("active"),
  engineNo: varchar("engine_no"),
  chassisNo: varchar("chassis_no"),
  ltoExpiry: date("lto_expiry"),

  // ✨ FIX 1 & 2: Added isActive so you can filter active trucks
  isActive: boolean("is_active").default(true).notNull(),

  // ✨ FIX 3: Added createdAt so you can sort folders by newest first
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
  date: varchar("date", { length: 20 }).notNull(),

  // ✨ ADDED: region and farmName to perfectly match our new Analytics architecture
  farmName: varchar("farm_name", { length: 255 }).notNull().default(""),
  origin: varchar("origin", { length: 100 }).notNull(),
  destination: varchar("destination", { length: 100 }).notNull(),

  // note
  qtyHeads: integer("qty_heads").notNull(),
  qtyNote: text("qty_note"),

  // Financials (Using integer assuming whole Philippine Pesos)
  rate: real("rate").notNull(),
  tollFees: real("toll_fees").default(0).notNull(),
  dieselCash: real("diesel_cash").default(0).notNull(),
  dieselPo: real("diesel_po").default(0).notNull(),
  meals: real("meals").default(0).notNull(),
  roroShip: real("roro_ship").default(0).notNull(),

  // note section
  salary: real("salary").default(0).notNull(),
  salaryNote: text("salary_note"),
  others: real("others").default(0).notNull(),
  othersNote: text("others_note"),

  // Trip Lifecycle: 'pending', 'in-transit', 'completed', 'cancelled'
  status: varchar("status", { length: 50 }).default("pending").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================================
// 3. EGG SALES MODULE TABLES (Foundation)
// ======================================================================

// Tracks daily stock of different egg sizes (Small, Medium, Large, Jumbo, etc.)
// export const eggInventory = pgTable("egg_inventory", {
//   id: serial("id").primaryKey(),
//   classification: varchar("classification", { length: 50 }).notNull().unique(), // e.g., "Large"
//   currentStockTrays: integer("current_stock_trays").default(0).notNull(),
//   pricePerTray: integer("price_per_tray").notNull(), // Assuming whole PHP

//   lastUpdated: timestamp("last_updated").defaultNow().notNull(),
// });

// // Tracks individual transactions/sales
// export const eggSales = pgTable("egg_sales", {
//   id: serial("id").primaryKey(),
//   customerId: varchar("customer_id", { length: 100 }).notNull(),

//   // Relational link to the egg classification
//   inventoryId: integer("inventory_id")
//     .references(() => eggInventory.id)
//     .notNull(),

//   quantityTrays: integer("quantity_trays").notNull(),
//   totalAmount: integer("total_amount").notNull(),

//   // Payment status: 'paid', 'unpaid'
//   paymentStatus: varchar("payment_status", { length: 20 })
//     .default("unpaid")
//     .notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// ======================================================================
// 3. EGG INVENTORY & SALES MODULE (FIFO BATCH TRACKING)
// ======================================================================

// 1. INBOUND: Tracks the truck arrival and the sorted breakdown (QA)
export const eggBatches = pgTable("egg_batches", {
  id: serial("id").primaryKey(),
  batchId: varchar("batch_id", { length: 50 }).notNull().unique(), // e.g., BATCH-20260528-01
  arrivalDate: date("arrival_date").notNull(),
  farmName: varchar("farm_name", { length: 255 }).notNull(),

  // The truck's initial pickup count
  rawTraysPickedUp: integer("raw_trays_picked_up").notNull(),

  // The Bodega QA sorted counts (Good Inventory)
  qtySmall: integer("qty_small").default(0).notNull(),
  qtyMedium: integer("qty_medium").default(0).notNull(),
  qtyLarge: integer("qty_large").default(0).notNull(),
  qtyXl: integer("qty_xl").default(0).notNull(),
  qtyXxl: integer("qty_xxl").default(0).notNull(),

  // Spoilage / Losses
  qtyCracked: integer("qty_cracked").default(0).notNull(),
  qtyBroken: integer("qty_broken").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. LEDGER: Real-time stock summary for fast dashboard loading
export const eggInventory = pgTable("egg_inventory", {
  id: serial("id").primaryKey(),
  classification: varchar("classification", { length: 50 }).notNull().unique(), // SMALL, MEDIUM, LARGE, XL, XXL
  currentStockTrays: integer("current_stock_trays").default(0).notNull(),
  pricePerTray: real("price_per_tray").notNull(), // Changed to real for consistency with trucking

  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// 3. OUTBOUND: Tracks individual transactions/sales
export const eggSales = pgTable("egg_sales", {
  id: serial("id").primaryKey(),
  saleDate: date("sale_date").notNull(),
  customerId: varchar("customer_id", { length: 100 }).notNull(),

  // Relational link to the egg classification ledger
  inventoryId: integer("inventory_id")
    .references(() => eggInventory.id)
    .notNull(),

  quantityTrays: integer("quantity_trays").notNull(),
  totalAmount: real("total_amount").notNull(), // Changed to real for consistency

  // Payment status: 'paid', 'unpaid'
  paymentStatus: varchar("payment_status", { length: 20 })
    .default("unpaid")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
