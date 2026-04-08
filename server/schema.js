import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ==========================================
// 1. AUTHENTICATION TABLES (Isticmaaleyaasha)
// ==========================================

export const user = pgTable("user", {
  id: text("id").primaryKey(), // Waxaa loo isticmaalayaa text si uu ugu haboonaado auth-ka
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  username: text("username").unique(), // Username-ka login-ka
  password: text("password"), // Password-ka (Hashed)
  role: text("role").default("staff"), // admin, teacher, staff
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ==========================================
// 2. AL-HILAAL SYSTEM TABLES (Kuwaaga)
// ==========================================

// Teachers
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  hire_date: date("hire_date"),
  guarantor_name: text("guarantor_name"),
  guarantor_phone: text("guarantor_phone"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Classes
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  class_name: text("class_name").notNull(),
  teacher_id: integer("teacher_id").references(() => teachers.id, {
    onDelete: "set null",
  }),
  capacity: integer("capacity").default(0),
  shift: text("shift"),
  students: jsonb("students").default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull(),
  registration_date: date("registration_date"),
  gender: text("gender"),
  parent_name: text("parent_name"),
  relation: text("relation"),
  parent_phone: text("parent_phone"),
  level: text("level"),
  shift: text("shift"),
  student_stage: text("student_stage").default("Bilaaw"),
  monthly_fee: numeric("monthly_fee", { precision: 12, scale: 2 }).default("0"),
  previous_debt: numeric("previous_debt", { precision: 12, scale: 2 }).default("0"),
  class_id: integer("class_id").references(() => classes.id, {
    onDelete: "set null",
  }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Families
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  parent_name: text("parent_name").notNull(),
  parent_phone: text("parent_phone").notNull().unique(),
  students: jsonb("students").default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  parent_phone: text("parent_phone").notNull(),
  parent_name: text("parent_name"),
  amount_paid: numeric("amount_paid", { precision: 12, scale: 2 }).notNull(),
  month_for: text("month_for").notNull(),
  receipt_number: text("receipt_number"),
  notes: text("notes"),
  payment_status: text("payment_status").default("unpaid"),
  payment_type: text("payment_type").default("monthly"),
  debt_before: numeric("debt_before", { precision: 12, scale: 2 }).default("0"),
  debt_after: numeric("debt_after", { precision: 12, scale: 2 }).default("0"),
  payment_date: timestamp("payment_date").defaultNow(),
  is_family_payment: boolean("is_family_payment").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category"),
  expense_date: timestamp("expense_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  student_id: integer("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  class_id: integer("class_id").references(() => classes.id, {
    onDelete: "cascade",
  }),
  attendance_date: text("attendance_date").default(sql`CURRENT_DATE::text`),
  shift: text("shift"),
  status: text("status").default("Present"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueAttendance: sql`UNIQUE(${table.student_id}, ${table.attendance_date}, ${table.shift})`
}));