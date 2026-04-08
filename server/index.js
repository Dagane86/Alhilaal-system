import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, db, query } from './db.js';
import { classes, teachers, students, families, payments, expenses, attendance, user } from './schema.js';
import { eq, desc, sql, and, or } from 'drizzle-orm'; // 'or' halkan ku dar
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'AL_HILAAL_SECRET_2026';

// Seed default admin user
const seedAdminUser = async () => {
  try {
    const existingAdmin = await db.select().from(user).where(eq(user.username, 'admin')).limit(1);
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(user).values({
        id: 'admin-001',
        name: 'Administrator',
        email: 'admin@alhilaal.edu',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Default admin user created: admin / admin123');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
};

// ==========================================
// 1. LOGIN API (Authentication)
// ==========================================
const loginHandler = async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    return res.status(400).json({ success: false, message: 'Fadlan gali username iyo password.' });
  }

  try {
    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.username, username.trim()))
      .limit(1);

    if (!foundUser || foundUser.length === 0) {
      return res.status(401).json({ success: false, message: 'Username ama Password khaldan!' });
    }

    const currentUser = foundUser[0];

    // 2. FIX: Compare the sent password with the database password
    // Use bcrypt.compare(plainTextPassword, hashedDatabasePassword)
    const isMatch = await bcrypt.compare(password, currentUser.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username ama Password khaldan!' });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: currentUser.id, role: currentUser.role, email: currentUser.email },
      JWT_SECRET,
      { expiresIn: '12h' },
    );

    return res.json({
      success: true,
      token,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
        username: currentUser.username,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

app.post('/api/login', loginHandler);
app.post('/api/auth/login', loginHandler);

// ==========================================
// 2. LOGOUT API
// ==========================================
app.post('/api/logout', (req, res) => {
  // In a stateless JWT system, logout is handled on the client side
  // by removing the token from localStorage
  res.json({ success: true, message: 'Logged out successfully' });
});

const mapTeacherRow = (row) => ({
  teacher_id: row.id,
  full_name: row.full_name,
  phone: row.phone,
  subject: row.subject,
  salary: row.salary,
  hire_date: row.hire_date,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const mapStudentRow = (row) => ({
  id: row.id,
  student_id: row.id,
  full_name: row.full_name,
  registration_date: row.registration_date,
  gender: row.gender,
  parent_name: row.parent_name,
  relation: row.relation,
  parent_phone: row.parent_phone,
  level: row.level,
  shift: row.shift,
  student_stage: row.student_stage || 'Bilaaw',
  monthly_fee: row.monthly_fee,
  class_id: row.class_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// ==========================================
// 1. DASHBOARD (SAXID)
// ==========================================
app.get('/api/dashboard/extra', async (req, res) => {
  try {

    // Wiilal & Gabdho
    const boys = await db.select({ count: sql`count(*)::int` })
      .from(students)
      .where(sql`gender = 'male'`);

    const girls = await db.select({ count: sql`count(*)::int` })
      .from(students)
      .where(sql`gender = 'female'`);

    // Families (unique parent_phone)
    const families = await db.select({
      count: sql`count(distinct parent_phone)::int`
    }).from(students);

    res.json({
      boys: boys[0]?.count || 0,
      girls: girls[0]?.count || 0,
      families: families[0]?.count || 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DASHBOARD SUMMARY
// ==========================================
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalStudents = await db.select({ count: sql`count(*)::int` }).from(students);
    const totalTeachers = await db.select({ count: sql`count(*)::int` }).from(teachers);
    const totalClasses = await db.select({ count: sql`count(*)::int` }).from(classes);

    const today = new Date().toISOString().split('T')[0];
    const presentToday = await db
      .select({ count: sql`count(*)::int` })
      .from(attendance)
      .where(sql`attendance_date = ${today} AND status = 'Present'`);

    const absentToday = await db
      .select({ count: sql`count(*)::int` })
      .from(attendance)
      .where(sql`attendance_date = ${today} AND status = 'Absent'`);

    res.json({
      totalStudents: totalStudents[0]?.count || 0,
      totalTeachers: totalTeachers[0]?.count || 0,
      totalClasses: totalClasses[0]?.count || 0,
      presentToday: presentToday[0]?.count || 0,
      absentToday: absentToday[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================
// 2. TEACHERS
// ==========================================
app.get('/api/teachers', async (req, res) => {
  try {
    const teachersData = await db.select().from(teachers).orderBy(desc(teachers.created_at));
    res.json(teachersData.map(mapTeacherRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teachers/:id', async (req, res) => {
  try {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, Number(req.params.id))).limit(1);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(mapTeacherRow(teacher));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  const { full_name, phone, subject, salary, hire_date } = req.body;
  try {
    const [teacher] = await db.insert(teachers).values({
      full_name,
      phone,
      subject,
      salary: salary ? Number(salary) : null,
      hire_date: hire_date || null,
    }).returning();
    res.json({ message: 'Macallin cusub waa la daray!', teacher: mapTeacherRow(teacher) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  const { full_name, phone, subject, salary, hire_date } = req.body;
  try {
    const [updated] = await db.update(teachers)
      .set({
        full_name,
        phone,
        subject,
        salary: salary ? Number(salary) : null,
        hire_date: hire_date || null,
      })
      .where(eq(teachers.id, Number(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Macallinka waa la cusbooneysiiyay!', teacher: mapTeacherRow(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const deleted = await db.delete(teachers).where(eq(teachers.id, Number(req.params.id)));
    if (!deleted) return res.status(404).json({ message: 'Macallinka lama helin!' });
    res.json({ message: 'Macallinka waa la tirtiray!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. STUDENTS
// ==========================================
app.get('/api/students', async (req, res) => {
  try {
    let query = db.select().from(students).orderBy(desc(students.created_at));
    if (req.query.class_id) {
      query = query.where(eq(students.class_id, Number(req.query.class_id)));
    }
    const studentsData = await query;
    res.json(studentsData.map(mapStudentRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const [student] = await db.select().from(students).where(eq(students.id, Number(req.params.id))).limit(1);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Fetch payments for this student's parent
    const studentPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.parent_phone, student.parent_phone))
      .orderBy(desc(payments.payment_date));

    // Fetch attendance summary for this student
    const attendanceRecords = await db
      .select()
      .from(attendance)
      .where(eq(attendance.student_id, student.id));

    const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'Absent').length;
    const totalDays = attendanceRecords.length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const studentData = mapStudentRow(student);
    studentData.payments = studentPayments.map(p => ({
      id: p.id,
      amount: p.amount_paid,
      payment_date: p.payment_date,
      payment_month: p.month_for,
      method: p.payment_type || 'Cash',
      notes: p.notes,
    }));
    studentData.attendance = {
      presentDays,
      absentDays,
      attendanceRate,
    };

    res.json(studentData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { full_name, registration_date, gender, parent_name, relation, parent_phone, level, shift, student_stage, monthly_fee, class_id } = req.body;
  try {
    const [student] = await db.insert(students).values({
      full_name,
      registration_date: registration_date || null,
      gender,
      parent_name,
      relation,
      parent_phone,
      level,
      shift,
      student_stage: student_stage || 'Bilaaw',
      monthly_fee: monthly_fee ? Number(monthly_fee) : 0,
      class_id: class_id ? Number(class_id) : null,
    }).returning();
    res.json({ message: 'Ardayga waa la diiwaangeliyay!', student: mapStudentRow(student) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { full_name, registration_date, gender, parent_name, relation, parent_phone, level, shift, student_stage, monthly_fee, class_id } = req.body;
  try {
    const [updated] = await db.update(students)
      .set({
        full_name,
        registration_date: registration_date || null,
        gender,
        parent_name,
        relation,
        parent_phone,
        level,
        shift,
        student_stage: student_stage || 'Bilaaw',
        monthly_fee: monthly_fee ? Number(monthly_fee) : 0,
        class_id: class_id ? Number(class_id) : null,
      })
      .where(eq(students.id, Number(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Ardayga waa la cusbooneysiiyay!', student: mapStudentRow(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await db.delete(students).where(eq(students.id, Number(req.params.id)));
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Ardayga la tirtiray' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CLASSES
// ==========================================

app.get('/api/classes', async (req, res) => {
  try {
    // 1. Xisaabi ardayda dhigata fasal kasta
    const studentCounts = db.select({
      class_id: students.class_id,
      student_count: sql`COUNT(*)::int`.as('student_count'),
    }).from(students).groupBy(students.class_id).as('cnt');

    // 2. Soo saar xogta fasalka iyo macallinka
    const classesData = await db.select({
      id: classes.id, // Waxaan u bixinnay 'id'
      class_name: classes.class_name,
      teacher_id: classes.teacher_id,
      shift: classes.shift,
      capacity: classes.capacity,
      teacher_name: teachers.full_name,
      student_count: sql`COALESCE(cnt.student_count, 0)`,
    })
    .from(classes)
    .leftJoin(teachers, eq(classes.teacher_id, teachers.id))
    .leftJoin(studentCounts, eq(classes.id, studentCounts.class_id))
    .orderBy(desc(classes.created_at));

    res.json(classesData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST NEW CLASS ---
app.post('/api/classes', async (req, res) => {
  const { class_name, teacher_id, shift, capacity } = req.body;
  try {
    const [newClass] = await db.insert(classes).values({
      class_name,
      teacher_id: teacher_id ? Number(teacher_id) : null,
      shift,
      capacity: capacity ? Number(capacity) : 0,
    }).returning();
    res.json({ message: 'Fasal cusub waa la daray!', class: newClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATE CLASS ---
app.put('/api/classes/:id', async (req, res) => {
  const { class_name, teacher_id, shift, capacity } = req.body;
  try {
    await db.update(classes)
      .set({ class_name, teacher_id: Number(teacher_id), shift, capacity: Number(capacity) })
      .where(eq(classes.id, Number(req.params.id)));
    res.json({ message: 'Fasalka waa la cusbooneysiiyay!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE CLASS ---
app.delete('/api/classes/:id', async (req, res) => {
  try {
    await db.delete(classes).where(eq(classes.id, Number(req.params.id)));
    res.json({ message: 'Fasalka waa la tirtiray!' });
  } catch (err) {
    res.status(500).json({ error: "Lama tirtiri karo (Arday ayaa ku jirta)" });
  }
});

// ==========================================
// ATTENDANCE - SAVE / UPDATE
// ==========================================
app.post('/api/attendance', async (req, res) => {
  const { class_id, shift, attendance_date, records } = req.body;

  try {
    if (!class_id || !records || records.length === 0) {
      return res.status(400).json({ error: 'Xog dhamaystiran lama helin.' });
    }

    // Hubi taariikhda: Kaliya taariikhda (YYYY-MM-DD) u dir DB
    const safeDate = attendance_date ? new Date(attendance_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const insertData = records.map((r) => ({
      student_id: Number(r.student_id),
      class_id: Number(class_id),
      shift: shift || 'Subax',
      attendance_date: safeDate, // Database-ka wuxuu u baahan yahay Date kaliya
      status: r.status || 'Present',
      notes: r.notes ?? null // Hubi in notes aysan undefined noqon, keydi null haddii bannaan
    }));

    await db
      .insert(attendance)
      .values(insertData)
      .onConflictDoUpdate({
        target: [attendance.student_id, attendance.attendance_date, attendance.shift],
        set: {
          status: sql`excluded.status`,
          notes: sql`excluded.notes`,
          class_id: sql`excluded.class_id`
        }
      });

    res.json({ success: true, message: 'Xaadirinta waa la keydiyey!' });
  } catch (err) {
    console.error('Attendance Save Error:', err);
    res.status(500).json({ error: 'Cilad database: ' + err.message });
  }
});
// ==========================================
// ATTENDANCE - report / UPDATE

app.get('/api/attendance/report', async (req, res) => {
  const { date, class_id, shift } = req.query;

  try {
    const filterDate = date || new Date().toISOString().split('T')[0];
    const whereConditions = [];

    whereConditions.push(eq(attendance.attendance_date, filterDate));

    if (class_id && !isNaN(Number(class_id))) {
      whereConditions.push(eq(attendance.class_id, Number(class_id)));
    }

    if (shift && shift !== '' && shift !== 'undefined') {
      whereConditions.push(eq(attendance.shift, shift));
    }

    const reportData = await db
      .select({
        id: attendance.id,
        student_name: students.full_name,
        class_name: classes.class_name,
        status: attendance.status,
        shift: attendance.shift,
        attendance_date: attendance.attendance_date,
        notes: attendance.notes
      })
      .from(attendance)
      .leftJoin(students, eq(attendance.student_id, students.id))
      .leftJoin(classes, eq(attendance.class_id, classes.id))
      .where(and(...whereConditions))
      .orderBy(desc(attendance.id));

    res.json(reportData);
  } catch (err) {
    console.error('Attendance Report Server Error:', err);
    res.status(500).json({
      message: 'خطأ في السيرفر',
      details: err.message
    });
  }
});
// ==========================================
// 5. ACCOUNTING - INCOME (DAKHLIGA)
// ==========================================

app.get("/api/family-status/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    // Soo saar dhammaan ardayda uu waalidkani leeyahay
    const familyStudents = await db
      .select()
      .from(students)
      .where(eq(students.parent_phone, phone));

    if (!familyStudents || familyStudents.length === 0) {
      return res.status(404).json({ message: "Waalidkan lama helin!" });
    }

    // Soo saar taariikhda lacagaha ee waalidkan
    const paymentHistory = await db
      .select()
      .from(payments)
      .where(eq(payments.parent_phone, phone))
      .orderBy(desc(payments.payment_date));

    const totalPaidHistory = paymentHistory.reduce((sum, p) => {
      return sum + (Number(p.amount_paid) || 0);
    }, 0);

    const firstStudent = familyStudents[0];

    const totalMonthlyFee =
      familyStudents.reduce((sum, s) => sum + (Number(s.monthly_fee) || 0), 0);

    const previousDebt = Number(firstStudent.previous_debt) || 0;

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Hubi haddii bishan lacag hore loo bixiyay
    const alreadyPaidThisMonth = paymentHistory.some(
      (p) => p.month_for === currentMonth
    );

    // status current month
    let currentMonthStatus = "unpaid";
    const currentMonthPayment = paymentHistory.find((p) => p.month_for === currentMonth);

    if (currentMonthPayment) {
      currentMonthStatus = currentMonthPayment.payment_status || "unpaid";
    } else {
      if (previousDebt > 0) currentMonthStatus = "debt";
      else currentMonthStatus = "unpaid";
    }

    return res.json({
      success: true,
      parent_name: firstStudent.parent_name || "Waalid aan magac lahayn",
      parent_phone: phone,
      previous_debt: previousDebt,
      total_paid_history: totalPaidHistory,
      total_monthly_fee: totalMonthlyFee,
      already_paid_this_month: alreadyPaidThisMonth, // ✅ NEW
      current_month: currentMonth,
      current_month_status: currentMonthStatus, // ✅ NEW

      students: familyStudents.map((s) => ({
        id: s.id,
        name: s.full_name || "Magac lama helin",
        monthly_fee: Number(s.monthly_fee) || 0,
        class_id: s.class_id || null,
      })),

      history: paymentHistory.map((h) => ({
        id: h.id,
        month: h.month_for || "Bil lama gelin",
        total_paid: Number(h.amount_paid) || 0,
        parent_name: h.parent_name || firstStudent.parent_name || "",
        date: h.payment_date,
        receipt_number: h.receipt_number || null,
        notes: h.notes || "",
        payment_status: h.payment_status || "unpaid", // ✅ NEW
        is_family_payment: h.is_family_payment === true,
      })),
    });
  } catch (err) {
    console.error("GET /api/family-status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});
/* =========================================================
   2) SAVE FAMILY PAYMENT
   POST: /api/family-payment
========================================================= */
app.get("/api/family-status/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    // Soo saar dhammaan ardayda uu waalidkani leeyahay
    const familyStudents = await db
      .select()
      .from(students)
      .where(eq(students.parent_phone, phone));

    if (!familyStudents || familyStudents.length === 0) {
      return res.status(404).json({ message: "Waalidkan lama helin!" });
    }

    // Soo saar taariikhda lacagaha ee waalidkan
    const paymentHistory = await db
      .select()
      .from(payments)
      .where(eq(payments.parent_phone, phone))
      .orderBy(desc(payments.payment_date));

    const totalPaidHistory = paymentHistory.reduce((sum, p) => {
      return sum + (Number(p.amount_paid) || 0);
    }, 0);

    const firstStudent = familyStudents[0];

    const totalMonthlyFee = familyStudents.reduce((sum, s) => {
      return sum + (Number(s.monthly_fee) || 0);
    }, 0);

    const previousDebt = Number(firstStudent.previous_debt) || 0;

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // current month payment records
    const currentMonthPayments = paymentHistory.filter(
      (p) => p.month_for === currentMonth
    );

    // haddii bisha current full paid tahay
    const alreadyFullyPaidThisMonth = currentMonthPayments.some(
      (p) => p.payment_status === "paid" || p.payment_status === "debt_paid"
    );

    // status current month
    let currentMonthStatus = "unpaid";

    if (currentMonthPayments.length > 0) {
      const latest = currentMonthPayments[0];
      currentMonthStatus = latest.payment_status || "unpaid";
    } else {
      if (previousDebt > 0) currentMonthStatus = "partial";
      else currentMonthStatus = "unpaid";
    }

    return res.json({
      success: true,
      parent_name: firstStudent.parent_name || "Waalid aan magac lahayn",
      parent_phone: phone,
      previous_debt: previousDebt,
      total_paid_history: totalPaidHistory,
      total_monthly_fee: totalMonthlyFee,
      already_paid_this_month: alreadyFullyPaidThisMonth,
      current_month: currentMonth,
      current_month_status: currentMonthStatus,

      students: familyStudents.map((s) => ({
        id: s.id,
        name: s.full_name || "Magac lama helin",
        monthly_fee: Number(s.monthly_fee) || 0,
        class_id: s.class_id || null,
      })),

      history: paymentHistory.map((h) => ({
        id: h.id,
        month: h.month_for || "Bil lama gelin",
        total_paid: Number(h.amount_paid) || 0,
        parent_name: h.parent_name || firstStudent.parent_name || "",
        date: h.payment_date,
        receipt_number: h.receipt_number || null,
        notes: h.notes || "",
        payment_status: h.payment_status || "unpaid",
        payment_type: h.payment_type || "monthly",
        debt_before: Number(h.debt_before) || 0,
        debt_after: Number(h.debt_after) || 0,
        is_family_payment: h.is_family_payment === true,
      })),
    });
  } catch (err) {
    console.error("GET /api/family-status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =========================================================
   2) SAVE FAMILY PAYMENT
   POST: /api/family-payment
========================================================= */
app.post("/api/family-payment", async (req, res) => {
  try {
    const {
      parent_phone,
      amount_paid,
      month_for,
      notes,
      receipt_number,
    } = req.body;

    // =====================================================
    // 1) VALIDATION
    // =====================================================
    if (!parent_phone) {
      return res.status(400).json({ error: "parent_phone waa required." });
    }

    const paidNow = Number(amount_paid);

    if (
      amount_paid === undefined ||
      amount_paid === null ||
      isNaN(paidNow) ||
      paidNow <= 0
    ) {
      return res.status(400).json({ error: "amount_paid sax ma ahan." });
    }

    const targetMonth =
      month_for ||
      new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

    // =====================================================
    // 2) SOO SAAR DHAMMAAN ARDAYDA WAALIDKAN
    // =====================================================
    const familyStudents = await db
      .select()
      .from(students)
      .where(eq(students.parent_phone, parent_phone));

    if (!familyStudents || familyStudents.length === 0) {
      return res.status(404).json({ error: "Waalidkan lama helin." });
    }

    const parentName = familyStudents[0].parent_name || "Waalid aan magac lahayn";

    // =====================================================
    // 3) XISAABI MONTHLY FEE GAAR AHAAN
    // =====================================================
    const totalMonthlyFee = familyStudents.reduce((sum, s) => {
      return sum + (Number(s.monthly_fee) || 0);
    }, 0);

    // =====================================================
    // 4) SOO SAAR PAYMENT-YADA BISHAN
    // =====================================================
    const monthPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.parent_phone, parent_phone),
          eq(payments.month_for, targetMonth)
        )
      )
      .orderBy(desc(payments.payment_date));

    const alreadyPaidForMonth = monthPayments.reduce((sum, p) => {
      return sum + (Number(p.amount_paid) || 0);
    }, 0);

    // =====================================================
    // 5) OLD PREVIOUS DEBT (DEYMAHA HORE)
    // =====================================================
    const oldDebt = Number(familyStudents[0].previous_debt) || 0;

    // =====================================================
    // 6) OGAAN HADDII BISHAN HORE LOO BILAABAY
    // =====================================================
    const isFirstPaymentThisMonth = monthPayments.length === 0;

    // =====================================================
    // 7) HADDII BISHAN HORE SI BUUXDA LOO BIXIYAY -> DIID
    // =====================================================
    // Marka total bishan la gaaray ama ka batay, bishu waa xiran tahay
    if (alreadyPaidForMonth >= totalMonthlyFee) {
      return res.status(400).json({
        error: `Bisha ${targetMonth} hore ayaa si buuxda loo bixiyay. Lama ogola mar labaad.`,
      });
    }

    // =====================================================
    // 8) XISAABTA WAXA LAGA RABO MARKAN
    // =====================================================
    let debtBeforeThisPayment = 0;
    let grandTotal = 0;
    let paymentType = "monthly";

    if (isFirstPaymentThisMonth) {
      // Markii ugu horeysay ee bishan wax la bixinayo:
      // Waxaa la rabaa:
      //   monthly fee + old debt
      debtBeforeThisPayment = oldDebt;
      grandTotal = totalMonthlyFee + oldDebt;
      paymentType = oldDebt > 0 ? "monthly_with_old_debt" : "monthly";
    } else {
      // Haddii bishan hore wax loo bixiyay:
      // Waxa kaliya ee hadda harsan waa deynta bishaas
      const remainingForMonth = Math.max(totalMonthlyFee - alreadyPaidForMonth, 0);

      if (remainingForMonth <= 0) {
        return res.status(400).json({
          error: `Bisha ${targetMonth} hore ayaa si buuxda loo bixiyay. Lama ogola mar labaad.`,
        });
      }

      debtBeforeThisPayment = remainingForMonth;
      grandTotal = remainingForMonth;
      paymentType = "debt_settlement";
    }

    // =====================================================
    // 9) OVERPAY PROTECTION
    // =====================================================
    if (paidNow > grandTotal) {
      return res.status(400).json({
        error: `Lacagta aad gelisay ($${paidNow}) waxay ka badan tahay haraaga la rabo ($${grandTotal.toFixed(
          2
        )}).`,
      });
    }

    // =====================================================
    // 10) NEW BALANCE (HARAA GAARKA TRANSACTION-KAN)
    // =====================================================
    const newBalance = Math.max(grandTotal - paidNow, 0);

    // =====================================================
    // 11) PAYMENT STATUS
    // =====================================================
    let paymentStatus = "unpaid";

    if (paidNow >= grandTotal && grandTotal > 0) {
      paymentStatus = "paid";
    } else if (paidNow > 0 && paidNow < grandTotal) {
      paymentStatus = "debt";
    }

    // =====================================================
    // 12) KEYDI PAYMENT RECORD
    // =====================================================
    await db.insert(payments).values({
      parent_phone,
      parent_name: parentName,
      amount_paid: paidNow.toString(),
      month_for: targetMonth,
      payment_date: new Date(),
      receipt_number: receipt_number || `REC-${Date.now()}`,
      notes:
        notes ||
        (paymentStatus === "debt"
          ? `Partial payment for ${targetMonth}. Remaining balance: $${newBalance.toFixed(2)}`
          : `Full payment for ${targetMonth}`),
      payment_status: paymentStatus,
      payment_type: paymentType,
      debt_before: debtBeforeThisPayment.toString(),
      debt_after: newBalance.toString(),
      is_family_payment: true,
    });

    // =====================================================
    // 13) UPDATE previous_debt SI SAX AH
    // =====================================================
    let updatedPreviousDebt = oldDebt;

    if (isFirstPaymentThisMonth) {
      // Formula saxda ah:
      // previous_debt cusub = oldDebt + monthlyFee - lacagta la bixiyay
      updatedPreviousDebt = Math.max(oldDebt + totalMonthlyFee - paidNow, 0);
    } else {
      // Markii bishan hore payment u jiray:
      // payment-kan cusub waa deynta bishaas
      // sidaas darteed previous_debt ka jar lacagta hadda la bixiyay
      updatedPreviousDebt = Math.max(oldDebt - paidNow, 0);
    }

    // Update dhammaan ardayda waalidkan
    await db
      .update(students)
      .set({
        previous_debt: updatedPreviousDebt.toString(),
        updated_at: new Date(),
      })
      .where(eq(students.parent_phone, parent_phone));

    // =====================================================
    // 14) RESPONSE
    // =====================================================
    return res.json({
      success: true,
      message:
        paymentStatus === "paid"
          ? `Bisha ${targetMonth} si buuxda ayaa loo bixiyay.`
          : `Qayb ahaan ayaa loo bixiyay. Haraaga: $${newBalance.toFixed(2)}`,
      summary: {
        parent_name: parentName,
        total_monthly_fee: totalMonthlyFee,
        old_debt: oldDebt,
        amount_already_paid_for_month: alreadyPaidForMonth,
        debt_before_this_payment: debtBeforeThisPayment,
        grand_total: grandTotal,
        amount_paid_now: paidNow,
        new_balance: newBalance,
        updated_previous_debt: updatedPreviousDebt,
        payment_status: paymentStatus,
        payment_type: paymentType,
      },
    });
  } catch (err) {
    console.error("POST /api/family-payment error:", err);
    return res.status(500).json({
      error: err?.message || "Khalad ayaa dhacay xiliga keydinta.",
    });
  }
});
// ==========================================
// 6. ACCOUNTING - EXPENSES (KHARASHKA)
// ==========================================

app.get('/api/expenses', async (req, res) => {
  try {
    const expensesData = await db.select().from(expenses).orderBy(desc(expenses.expense_date));
    res.json(expensesData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, notes } = req.body;
  try {
    const [newExpense] = await db.insert(expenses).values({
      title,
      amount: Number(amount),
      category,
      expense_date: new Date()
    }).returning();
    res.json({ message: "Kharashka waa la diiwaangeliyay!", expense: newExpense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. REPORTS (INCOME + EXPENSES + PROFIT)
// ==========================================
app.get('/api/admin/reports', async (req, res) => {
  try {
    // 1) Soo qaado dhammaan payments
    const allPayments = await db
      .select()
      .from(payments)
      .orderBy(desc(payments.payment_date));

    // 2) Soo qaado dhammaan expenses
    const allExpenses = await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.expense_date));

    // 3) Today
    const today = new Date().toLocaleDateString();

    // 4) Total Income
    const totalIncome = allPayments.reduce((sum, p) => {
      return sum + (Number(p.amount_paid) || 0);
    }, 0);

    // 5) Total Expenses
    const totalExpenses = allExpenses.reduce((sum, e) => {
      return sum + (Number(e.amount) || 0);
    }, 0);

    // 6) Today Income
    const todayIncome = allPayments
      .filter((p) => new Date(p.payment_date).toLocaleDateString() === today)
      .reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);

    // 7) Today Expenses
    const todayExpenses = allExpenses
      .filter((e) => new Date(e.expense_date).toLocaleDateString() === today)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // 8) Net Profit
    const netProfit = totalIncome - totalExpenses;

    // 9) Status counts
    const paidCount = allPayments.filter(
      (p) => p.payment_status === 'paid' || p.payment_status === 'Paid'
    ).length;

    const partialCount = allPayments.filter(
      (p) =>
        p.payment_status === 'debt' ||
        p.payment_status === 'partial' ||
        p.payment_status === 'Partial'
    ).length;

    const unpaidCount = allPayments.filter(
      (p) =>
        p.payment_status === 'unpaid' ||
        p.payment_status === 'Unpaid'
    ).length;

    // 10) Response
    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        todayIncome,
        todayExpenses,
        paidCount,
        partialCount,
        unpaidCount,
        totalTransactions: allPayments.length,
        totalExpenseRows: allExpenses.length,
      },
      payments: allPayments,
      expenses: allExpenses,
    });
  } catch (err) {
    console.error('GET /api/admin/reports error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await connectDB();
    await query("ALTER TABLE students ADD COLUMN IF NOT EXISTS student_stage TEXT DEFAULT 'Bilaaw';");
    await seedAdminUser();
    console.log(`🚀 Server ka si guul ayuu u kacay: http://localhost:${PORT}`);
  } catch (error) {
    console.error('error connecting to db', error);
  }
});

