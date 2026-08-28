import { historyService } from '../services/historyService.js';

export const submitFeedbackHandler = async (req, res) => {
  try {
    const { analysisId, isHelpful, comments } = req.body;

    if (!analysisId || typeof isHelpful !== 'boolean') {
      res.status(400).json({ error: 'analysisId and boolean isHelpful flag are required.' });
      return;
    }

    const feedbackResult = await historyService.saveFeedback({ analysisId, isHelpful, comments });
    res.status(201).json({ success: true, message: 'Feedback submitted successfully.', ...feedbackResult });
  } catch (err) {
    console.error('❌ Error in submitFeedbackHandler:', err);
    res.status(500).json({ error: 'Failed to submit feedback.', details: err.message });
  }
};
