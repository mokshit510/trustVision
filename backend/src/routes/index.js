import { Router } from 'express';
import multer from 'multer';
import { analyzeTextHandler, analyzeImageHandler, analyzeVoiceHandler } from '../controllers/analyzeController.js';
import { getAnalysesHandler, getAnalysisByIdHandler } from '../controllers/historyController.js';
import { submitFeedbackHandler } from '../controllers/feedbackController.js';

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

export const router = Router();

// API Endpoints as specified in requirements:
// POST /api/analyze/text
router.post('/analyze/text', analyzeTextHandler);

// POST /api/analyze/image
router.post('/analyze/image', upload.single('image'), analyzeImageHandler);

// POST /api/analyze/voice
router.post('/analyze/voice', upload.single('audio'), analyzeVoiceHandler);

// GET /api/analyses
router.get('/analyses', getAnalysesHandler);

// GET /api/analyses/:id
router.get('/analyses/:id', getAnalysisByIdHandler);

// POST /api/feedback
router.post('/feedback', submitFeedbackHandler);
