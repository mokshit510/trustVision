-- SQLite Schema for TrustVision AI Safety Application

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
);

CREATE TABLE IF NOT EXISTS analysis_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL,
  is_helpful INTEGER NOT NULL,
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_analyses_modality ON analyses(modality);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
