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

// users table
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

// system settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  isLocked: boolean("is_locked").default(false).notNull(),
  lockReason: text("lock_reason"),
  masterPin: varchar("master_pin", { length: 255 }).default("123456").notNull(), // ✨ ADDED THIS
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
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
  baiExpiry: date("bai_expiry"),

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
// 3. EGG INVENTORY & SALES MODULE (FIFO BATCH TRACKING)
// ======================================================================

// 1. INBOUND: Tracks the truck arrival and the sorted breakdown (QA)
export const eggBatches = pgTable("egg_batches", {
  id: serial("id").primaryKey(),
  batchId: varchar("batch_id", { length: 50 }).notNull().unique(),
  arrivalDate: date("arrival_date").notNull(),
  farmName: varchar("farm_name", { length: 255 }).notNull(),

  // ✨ NEW: Explicitly store the driver's exact input
  rawCasesPickedUp: integer("raw_cases_picked_up").default(0).notNull(),
  rawTraysPickedUp: integer("raw_trays_picked_up").default(0).notNull(),

  // The Bodega QA sorted counts (Good Inventory)
  qtyPeewee: integer("qty_peewee").default(0).notNull(),
  qtyXs: integer("qty_xs").default(0).notNull(),
  qtySmall: integer("qty_small").default(0).notNull(),
  qtyMedium: integer("qty_medium").default(0).notNull(),
  qtyLarge: integer("qty_large").default(0).notNull(),
  qtyXl: integer("qty_xl").default(0).notNull(),
  qtyXxl: integer("qty_xxl").default(0).notNull(),

  // Spoilage / Losses / Downgrades
  qtyCracked: integer("qty_cracked").default(0).notNull(),
  qtyBroken: integer("qty_broken").default(0).notNull(),
  qtyDirty: integer("qty_dirty").default(0).notNull(), // ✨ NEW: Dirty Eggs

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
  invoiceId: varchar("invoice_id", { length: 50 }),
  saleDate: date("sale_date").notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),

  // Relational link to the egg classification ledger
  inventoryId: integer("inventory_id")
    .references(() => eggInventory.id)
    .notNull(),

  classification: varchar("classification", { length: 50 }).notNull(), // Small, Medium, XL
  quantityTrays: integer("quantity_trays").notNull(),

  // Financials
  pricePerTray: real("price_per_tray").notNull(),
  totalAmount: real("total_amount").notNull(),
  amountPaid: real("amount_paid").default(0).notNull(), // ✨ NEW: For tracking partial payments

  // Accounts Receivable Tracking
  paymentStatus: varchar("payment_status", { length: 20 })
    .default("unpaid")
    .notNull(), // 'paid', 'unpaid', 'partial'
  datePaid: date("date_paid"), // ✨ NEW: Matches her "DATE PAID" column

  remarks: text("remarks"), // ✨ NEW: Matches her "REMARKS" column

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
