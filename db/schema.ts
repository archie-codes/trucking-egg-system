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
  lastActiveAt: timestamp("last_active_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// system settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  isLocked: boolean("is_locked").default(false).notNull(),
  lockReason: text("lock_reason"),
  masterPin: varchar("master_pin", { length: 255 }).default("123456").notNull(),
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

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const truckingTrips = pgTable("trucking_trips", {
  id: serial("id").primaryKey(),

  truckId: integer("truck_id")
    .references(() => truckingFleet.id)
    .notNull(),

  customerId: varchar("customer_id", { length: 100 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  tripType: varchar("trip_type", { length: 50 }),
  loadType: varchar("load_type", { length: 50 }),

  farmName: varchar("farm_name", { length: 255 }).notNull().default(""),
  origin: varchar("origin", { length: 100 }).notNull(),
  destination: varchar("destination", { length: 100 }).notNull(),

  qtyHeads: integer("qty_heads").notNull(),
  qtyNote: text("qty_note"),

  rate: real("rate").notNull(),
  tollFees: real("toll_fees").default(0).notNull(),
  dieselCash: real("diesel_cash").default(0).notNull(),
  dieselPo: real("diesel_po").default(0).notNull(),
  meals: real("meals").default(0).notNull(),
  roroShip: real("roro_ship").default(0).notNull(),

  salary: real("salary").default(0).notNull(),
  salaryNote: text("salary_note"),
  others: real("others").default(0).notNull(),
  othersNote: text("others_note"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const truckingTripsCpf = pgTable("trucking_trips_cpf", {
  id: serial("id").primaryKey(),

  truckId: integer("truck_id")
    .references(() => truckingFleet.id)
    .notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  tripType: varchar("trip_type", { length: 50 }),
  deliveryOrderNo: varchar("delivery_order_no", { length: 100 }),
  origin: varchar("origin", { length: 100 }).notNull(),
  destination: varchar("destination", { length: 100 }).notNull(),
  ratePerTrip: real("rate_per_trip").default(0).notNull(),
  tollFees: real("toll_fees").default(0).notNull(),
  dieselCash: real("diesel_cash").default(0).notNull(),
  dieselPo: real("diesel_po").default(0).notNull(),
  meals: real("meals").default(0).notNull(),
  salary: real("salary").default(0).notNull(),
  salaryNote: text("salary_note"),
  miscellaneous: real("miscellaneous").default(0).notNull(),
  miscellaneousNote: text("miscellaneous_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================================
// 3. EGG INVENTORY & SALES MODULE (FIFO BATCH TRACKING)
// ======================================================================

export const eggBatches = pgTable("egg_batches", {
  id: serial("id").primaryKey(),
  batchId: varchar("batch_id", { length: 50 }).notNull().unique(),
  arrivalDate: date("arrival_date").notNull(),
  farmName: varchar("farm_name", { length: 255 }).notNull(),
  receivedBy: varchar("received_by", { length: 255 }),

  totalTraysPickedUp: integer("total_trays_picked_up").default(0).notNull(),
  extraType: varchar("extra_type", { length: 20 }).default("NONE").notNull(),
  extraPiecesPickedUp: integer("extra_pieces_picked_up").default(0).notNull(),

  qtyPeewee: real("qty_peewee").default(0).notNull(),
  qtyXs: real("qty_xs").default(0).notNull(),
  qtySmall: real("qty_small").default(0).notNull(),
  qtyMedium: real("qty_medium").default(0).notNull(),
  qtyLarge: real("qty_large").default(0).notNull(),
  qtyXl: real("qty_xl").default(0).notNull(),
  qtyXxl: real("qty_xxl").default(0).notNull(),

  qtyCracked: real("qty_cracked").default(0).notNull(),
  qtyBroken: real("qty_broken").default(0).notNull(),
  qtyDirty: real("qty_dirty").default(0).notNull(),

  brownQtyPeewee: real("brown_qty_peewee").default(0).notNull(),
  brownQtyXs: real("brown_qty_xs").default(0).notNull(),
  brownQtySmall: real("brown_qty_small").default(0).notNull(),
  brownQtyMedium: real("brown_qty_medium").default(0).notNull(),
  brownQtyLarge: real("brown_qty_large").default(0).notNull(),
  brownQtyXl: real("brown_qty_xl").default(0).notNull(),
  brownQtyXxl: real("brown_qty_xxl").default(0).notNull(),
  brownQtyAssorted: real("brown_qty_assorted").default(0).notNull(),

  brownQtyCracked: real("brown_qty_cracked").default(0).notNull(),
  brownQtyBroken: real("brown_qty_broken").default(0).notNull(),
  brownQtyDirty: real("brown_qty_dirty").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eggInventory = pgTable("egg_inventory", {
  id: serial("id").primaryKey(),
  classification: varchar("classification", { length: 50 }).notNull().unique(),
  currentStockTrays: integer("current_stock_trays").default(0).notNull(),
  pricePerTray: real("price_per_tray").notNull(),

  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const eggSales = pgTable("egg_sales", {
  id: serial("id").primaryKey(),
  invoiceId: varchar("invoice_id", { length: 50 }),
  saleDate: date("sale_date").notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),

  inventoryId: integer("inventory_id")
    .references(() => eggInventory.id)
    .notNull(),

  classification: varchar("classification", { length: 50 }).notNull(),
  quantityTrays: integer("quantity_trays").notNull(),
  quantityPieces: integer("quantity_pieces").default(0).notNull(),
  palitBasag: integer("palit_basag").default(0).notNull(),

  pricePerTray: real("price_per_tray").notNull(),
  totalAmount: real("total_amount").notNull(),
  amountPaid: real("amount_paid").default(0).notNull(),

  paymentStatus: varchar("payment_status", { length: 20 })
    .default("unpaid")
    .notNull(),
  datePaid: date("date_paid"),

  remarks: text("remarks"),

  preparedBy: varchar("prepared_by", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ======================================================================
// 4. FARM OPERATIONS MODULE (POULTRY MANAGEMENT)
// ======================================================================

export const farmFlocks = pgTable("farm_flocks", {
  id: serial("id").primaryKey(),
  batchName: varchar("batch_name", { length: 100 }).notNull(),
  farmName: varchar("farm_name", { length: 255 }).notNull(),
  buildingName: varchar("building_name", { length: 100 }).notNull(),

  dateLoaded: date("date_loaded").notNull(),

  initialHeadCount: integer("initial_head_count").notNull(),
  currentHeadCount: integer("current_head_count").notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  recordedBy: varchar("recorded_by", { length: 255 }).default("System"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farmDailyRecords = pgTable("farm_daily_records", {
  id: serial("id").primaryKey(),
  flockId: integer("flock_id")
    .references(() => farmFlocks.id)
    .notNull(),

  recordDate: date("record_date").notNull(),
  mortalityCount: integer("mortality_count").default(0).notNull(),

  quantityTrays: integer("quantity_trays").default(0).notNull(),
  quantityPieces: integer("quantity_pieces").default(0).notNull(),

  remarks: text("remarks"),
  recordedBy: varchar("recorded_by", { length: 255 }).default("System"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farmFeedConsumptions = pgTable("farm_feed_consumptions", {
  id: serial("id").primaryKey(),

  flockId: integer("flock_id")
    .references(() => farmFlocks.id)
    .notNull(),

  dateGiven: date("date_given").notNull(),
  feedType: varchar("feed_type", { length: 100 }).notNull(),
  quantityBags: real("quantity_bags").notNull(),
  totalCost: real("total_cost").default(0).notNull(),
  recordedBy: varchar("recorded_by", { length: 255 }).default("System"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farmOperatingExpenses = pgTable("farm_operating_expenses", {
  id: serial("id").primaryKey(),

  flockId: integer("flock_id")
    .references(() => farmFlocks.id)
    .notNull(),

  dateIncurred: date("date_incurred").notNull(),

  category: varchar("category", { length: 100 }).notNull(),

  amount: real("amount").default(0).notNull(),
  remarks: text("remarks"),

  // Shared identifier for expenses that were split. Null for standard expenses.
  receiptGroupId: varchar("receipt_group_id", { length: 255 }),

  recordedBy: varchar("recorded_by", { length: 255 }).default("System"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
