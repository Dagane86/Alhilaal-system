import { pool } from './db.js';

(async () => {
  const client = await pool.connect();
  try {
    const c = await client.query('SELECT COUNT(*) AS cnt FROM classes');
    const s = await client.query('SELECT COUNT(*) AS cnt FROM students');
    console.log('classes', c.rows[0].cnt, 'students', s.rows[0].cnt);
    const cl = await client.query('SELECT id, class_name, teacher_id, capacity, shift FROM classes ORDER BY id LIMIT 5');
    const st = await client.query('SELECT id, full_name, class_id FROM students ORDER BY id LIMIT 5');
    console.log('classes sample', cl.rows);
    console.log('students sample', st.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit(0);
  }
})();