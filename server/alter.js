import { query } from './db.js';

async function alterTable() {
  try {
    // First check if constraint exists
    const existingConstraints = await query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'attendance' AND constraint_type = 'UNIQUE'
    `);

    const constraintExists = existingConstraints.rows.some(row =>
      row.constraint_name === 'unique_attendance'
    );

    if (!constraintExists) {
      // Add unique constraint for attendance
      await query('ALTER TABLE attendance ADD CONSTRAINT unique_attendance UNIQUE (student_id, attendance_date, shift)');
      console.log('Unique constraint added to attendance table successfully');
    } else {
      console.log('Unique constraint already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

alterTable();