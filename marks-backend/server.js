

import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import ExcelJS from 'exceljs';
import basicAuth from 'basic-auth';
<<<<<<< HEAD
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import multer from 'multer';

=======
>>>>>>> 15b3b55d834546f443163edf09dc682e5582a7c4

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://mplab88_db_user:8aIZhGd9UOVFOM9t@cluster-cb.n1idwwq.mongodb.net/midmarks?retryWrites=true&w=majority&appName=Cluster-cb';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' DB error:', err));

// Schema
const markSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  exam: { type: String, default: "default" },
  marks: { type: Map, of: Number },
  createdAt: { type: Date, default: Date.now }
});

const MarkEntry = mongoose.model('MarkEntry', markSchema);

// Save marks
app.post('/marks', async (req, res) => {
  try {
    const { rollNo, exam, marks } = req.body;
    if (!rollNo || !marks) return res.status(400).json({ error: "rollNo and marks required" });

    // Filter empty/unattempted
    const cleanMarks = {};
    for (const q of Object.keys(marks)) {
      if (marks[q] !== "" && marks[q] !== null && marks[q] !== undefined) {
        cleanMarks[q] = Number(marks[q]);
      }
    }

    const entry = new MarkEntry({ rollNo, exam, marks: cleanMarks });
    await entry.save();
    res.json({ message: " Marks saved", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware: Basic hardcoded auth
const adminAuth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== 'admin' || user.pass !== 'kgr') {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Export Excel (protected)
app.get('/export', adminAuth, async (req, res) => {
  try {
    const entries = await MarkEntry.find().lean();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Marks");

    const questions = ["1","2","3","4a","4b","5a","5b","6a","6b","7a","7b"];

    // Header row
    sheet.addRow(["RollNo", ...questions]);

    // Data rows
    for (const e of entries) {
      const row = [e.rollNo];
      for (const q of questions) {
        row.push(e.marks[q] ?? "");
      }
      sheet.addRow(row);
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=marks.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Export failed" });
  }
});

const PORT = process.env.PORT || 4000;
<<<<<<< HEAD

// --- Added by integration script: Admin/student auth and Excel upload (improved) ---

// --- Added by integration script: Admin/student auth and Excel upload (improved) ---

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Student schema (bcrypt hashed password)
const studentSchema = new mongoose.Schema({
  rollno: { type: String, index: true },
  data: Object,
  username: String,
  password: String // hashed
});
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

// helper: get admin creds from env with defaults
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PROD';

// middleware to protect admin routes via JWT
function requireAdmin(req, res, next){
  const auth = req.headers['authorization'];
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    if(payload && payload.role === 'admin') return next();
    return res.status(401).json({ error: 'Unauthorized' });
  }catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin login - returns JWT
app.post('/api/admin/login', express.json(), (req, res) => {
  const { username, password } = req.body || {};
  if(username === ADMIN_USER && password === ADMIN_PASS){
    const token = jwt.sign({ role: 'admin', user: username }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ ok: true, token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Upload Excel and store students (protected)
app.post('/api/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const sheet = workbook.worksheets[0];
    const rows = [];
    const header = [];
    sheet.eachRow((row, rowNumber) => {
      const vals = row.values; // vals[0] is null
      if (rowNumber === 1) {
        for (let i=1;i<vals.length;i++) header.push(String(vals[i]||'').trim());
      } else {
        const obj = {};
        for (let i=1;i<=header.length;i++) {
          const key = header[i-1] || ('col'+i);
          obj[key] = vals[i] !== undefined ? vals[i] : '';
        }
        rows.push(obj);
      }
    });

    // Clear existing students
    await Student.deleteMany({});
    const docs = [];
    // prepare lower-case header map for roll detection
    const rollKeys = ['roll','rollno','roll no','roll number','roll_no','regno','registration','registration no','usn','usn no'];
    for (const r of rows) {
      // find roll value by checking keys case-insensitively
      let rollVal = '';
      const keys = Object.keys(r);
      for (const k of keys){
        const lk = k.toLowerCase().trim();
        if (rollKeys.includes(lk) || lk.includes('roll') || lk.includes('usn') || lk.includes('reg')){
          if(String(r[k]).trim() !== '') { rollVal = String(r[k]).trim(); break; }
        }
      }
      // fallback: try common names
      if(!rollVal){
        for (const candidate of ['RollNo','Roll No','Roll Number','rollno','roll_no','USN','USN No']) {
          if (r[candidate]) { rollVal = String(r[candidate]).trim(); break; }
        }
      }
      const rollStr = rollVal || '';
      const pwdPlain = rollStr;
      const hashed = pwdPlain ? await bcrypt.hash(pwdPlain, 10) : '';
      const doc = {
        rollno: rollStr,
        data: r,
        username: rollStr,
        password: hashed
      };
      docs.push(doc);
    }
    if (docs.length) await Student.insertMany(docs);

    // remove uploaded file
    try { fs.unlinkSync(req.file.path); } catch(e){}
    res.json({ message: 'Upload successful', count: docs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: String(err) });
  }
});

// Student login (compare bcrypt hashed password)
app.post('/api/student/login', express.json(), async (req, res) => {
  const { username, password } = req.body || {};
  try {
    const student = await Student.findOne({ rollno: username });
    if (!student) return res.status(401).json({ error: 'Invalid' });
    const ok = await bcrypt.compare(password, student.password || '');
    if (!ok) return res.status(401).json({ error: 'Invalid' });
    return res.json({ ok: true, rollno: student.rollno });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get student data (public)
app.get('/api/student/:rollno', async (req, res) => {
  try {
    const s = await Student.findOne({ rollno: req.params.rollno });
    if (!s) return res.status(404).json({ error: 'Not found' });
    return res.json(s.data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// --- end added code ---



=======
>>>>>>> 15b3b55d834546f443163edf09dc682e5582a7c4
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
