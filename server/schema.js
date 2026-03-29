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

// 1. Teachers
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  full_name: text("full_name").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  hire_date: date("hire_date"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 2. Classes
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

// 3. Students
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
  monthly_fee: numeric("monthly_fee", { precision: 12, scale: 2 }).default("0"),
  previous_debt: numeric("previous_debt", { precision: 12, scale: 2 }).default("0"),
  class_id: integer("class_id").references(() => classes.id, {
    onDelete: "set null",
  }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 4. Families
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  parent_name: text("parent_name").notNull(),
  parent_phone: text("parent_phone").notNull().unique(),
  students: jsonb("students").default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 5. Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  parent_phone: text("parent_phone").notNull(),
  parent_name: text("parent_name"),

  amount_paid: numeric("amount_paid", { precision: 12, scale: 2 }).notNull(),

  // bisha lacagta loo qoray (tusaale: March 2026)
  month_for: text("month_for").notNull(),

  receipt_number: text("receipt_number"),
  notes: text("notes"),

  // paid | partial | unpaid | debt_paid
  payment_status: text("payment_status").default("unpaid"),

  // monthly | debt_payment
  payment_type: text("payment_type").default("monthly"),

  // inta deyn ahayd kahor payment-kan
  debt_before: numeric("debt_before", { precision: 12, scale: 2 }).default("0"),

  // inta ku hartay kadib payment-kan
  debt_after: numeric("debt_after", { precision: 12, scale: 2 }).default("0"),

  payment_date: timestamp("payment_date").defaultNow(),
  is_family_payment: boolean("is_family_payment").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 6. Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category"),
  expense_date: timestamp("expense_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 7. Attendance
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
  created_at: timestamp("created_at").defaultNow(),
});