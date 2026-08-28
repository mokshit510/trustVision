import { historyService } from '../services/historyService.js';

export const getAnalysesHandler = async (req, res) => {
  try {
    const analyses = await historyService.getAllAnalyses();
    res.status(200).json(analyses);
  } catch (err) {
    console.error('❌ Error in getAnalysesHandler:', err);
    res.status(500).json({ error: 'Failed to retrieve analysis history.', details: err.message });
  }
};

export const getAnalysisByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await historyService.getAnalysisById(id);

    if (!analysis) {
      res.status(404).json({ error: `Analysis record with ID '${id}' not found.` });
      return;
    }

    res.status(200).json(analysis);
  } catch (err) {
    console.error('❌ Error in getAnalysisByIdHandler:', err);
    res.status(500).json({ error: 'Failed to retrieve analysis record.', details: err.message });
  }
};
