import { queryRun, queryGet, queryAll } from '../database/db.js';

export class HistoryService {
  /**
   * Saves an AnalysisResult object to the SQLite database
   */
  async saveAnalysis(result, rawInputText) {
    const resultJson = JSON.stringify(result);

    await queryRun(
      `INSERT INTO analyses (
        id, modality, input_summary, raw_input, risk_level, confidence,
        summary, why_it_matters, potential_impact, recommended_action,
        verification_advice, result_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.id,
        result.modality,
        rawInputText.substring(0, 100),
        rawInputText,
        result.riskLevel,
        result.confidence,
        result.summary,
        result.whyItMatters,
        result.potentialImpact,
        result.recommendedAction,
        result.verificationAdvice,
        resultJson,
        result.createdAt
      ]
    );

    // Save evidence items
    if (result.evidence && result.evidence.length > 0) {
      for (const item of result.evidence) {
        await queryRun(
          `INSERT INTO analysis_evidence (analysis_id, category, title, detail) VALUES (?, ?, ?, ?)`,
          [result.id, item.category, item.title, item.detail]
        );
      }
    }
  }

  /**
   * Retrieves all past analyses from SQLite database
   */
  async getAllAnalyses() {
    const rows = await queryAll(`SELECT result_json FROM analyses ORDER BY created_at DESC LIMIT 50`);
    return rows.map(r => JSON.parse(r.result_json));
  }

  /**
   * Retrieves a single analysis by ID from SQLite database
   */
  async getAnalysisById(id) {
    const row = await queryGet(`SELECT result_json FROM analyses WHERE id = ?`, [id]);
    if (!row) return null;
    return JSON.parse(row.result_json);
  }

  /**
   * Saves user feedback on an analysis
   */
  async saveFeedback(feedback) {
    const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await queryRun(
      `INSERT INTO feedback (id, analysis_id, is_helpful, comments, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, feedback.analysisId, feedback.isHelpful ? 1 : 0, feedback.comments || '', new Date().toISOString()]
    );
    return { id };
  }
}

export const historyService = new HistoryService();
