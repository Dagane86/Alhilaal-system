-- Neon DB schema for Al Hilaal system

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  salary NUMERIC(12,2),
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  registration_date DATE,
  gender TEXT,
  parent_name TEXT,
  relation TEXT,
  parent_phone TEXT,
  level TEXT,
  shift TEXT,
  student_stage TEXT DEFAULT 'Bilaaw',
  monthly_fee NUMERIC(12,2) DEFAULT 0,
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  capacity INTEGER DEFAULT 0,
  shift TEXT,
  students JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  attendance_date DATE DEFAULT CURRENT_DATE,
  shift TEXT, -- Subax, Barqo, Galab
  status TEXT DEFAULT 'Present', -- Present, Absent, Late
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL UNIQUE,
  address TEXT,
  students JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  parent_phone TEXT NOT NULL,
  parent_name TEXT,
  amount_paid NUMERIC(12,2) NOT NULL,
  month_for TEXT,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  receipt_number TEXT,
  notes TEXT,
  is_family_payment BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT,
  expense_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
