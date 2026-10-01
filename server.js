import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from both public and project directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Simple file-based database for now
const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  books: [],
  students: [],
  transactions: []
};

// Initialize DB if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// --- API ENDPOINTS ---

// GET all books
app.get('/api/books', (req, res) => {
  const db = readDB();
  res.json(db.books);
});

// POST new book
app.post('/api/books', (req, res) => {
  const db = readDB();
  const newBook = { id: Date.now().toString(), ...req.body };
  db.books.push(newBook);
  writeDB(db);
  res.status(201).json(newBook);
});

// GET all students
app.get('/api/students', (req, res) => {
  const db = readDB();
  res.json(db.students);
});

// POST new student
app.post('/api/students', (req, res) => {
  const db = readDB();
  const newStudent = { id: Date.now().toString(), ...req.body };
  db.students.push(newStudent);
  writeDB(db);
  res.status(201).json(newStudent);
});

// GET all transactions
app.get('/api/transactions', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

// POST new transaction
app.post('/api/transactions', (req, res) => {
  const db = readDB();
  const newTx = { id: Date.now().toString(), ...req.body, status: 'ACTIVE' };
  db.transactions.push(newTx);
  writeDB(db);
  res.status(201).json(newTx);
});

// Catch-all route to serve the single-page app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 System Online: Web Server running on http://localhost:${PORT}\n`);
});
