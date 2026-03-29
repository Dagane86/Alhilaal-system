import { query } from './db.js';

async function alterTable() {
  try {
    await query('ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL');
    console.log('Column added successfully');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

alterTable();