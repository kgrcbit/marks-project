require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ExcelJS = require('exceljs');
const basicAuth = require('basic-auth');

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
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
