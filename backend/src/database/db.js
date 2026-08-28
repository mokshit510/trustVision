import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(__dirname, '../../', process.env.DATABASE_PATH)
  : path.resolve(__dirname, '../../../database/trustvision.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

export const initDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          modality TEXT NOT NULL,
          input_summary TEXT,
          raw_input TEXT,
          risk_level TEXT NOT NULL,
          confidence REAL NOT NULL,
          summary TEXT NOT NULL,
          why_it_matters TEXT,
          potential_impact TEXT,
          recommended_action TEXT,
          verification_advice TEXT,
          result_json TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS analysis_evidence (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          analysis_id TEXT NOT NULL,
          category TEXT,
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
          id TEXT PRIMARY KEY,
          analysis_id TEXT NOT NULL,
          is_helpful INTEGER NOT NULL,
          comments TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error initializing schema:', err.message);
          reject(err);
        } else {
          console.log('✅ SQLite schema initialized successfully.');
          resolve();
        }
      });
    });
  });
};

export const queryRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const queryGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const queryAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
