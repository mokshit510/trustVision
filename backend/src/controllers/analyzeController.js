import { aiService } from '../services/aiService.js';
import { visionService } from '../services/visionService.js';
import { speechService } from '../services/speechService.js';
import { riskAnalysisService } from '../services/riskAnalysisService.js';
import { historyService } from '../services/historyService.js';

export const analyzeTextHandler = async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text field is required and must be a non-empty string.' });
      return;
    }

    // Step 1: AI Threat Analysis
    const partialResult = await aiService.analyzeTextThreat(text, context);
    partialResult.modality = 'text';

    // Step 2: Safety Normalization & Validation
    const normalizedResult = riskAnalysisService.normalizeAndValidateResult(partialResult, text);

    // Step 3: Persistence to SQLite
    await historyService.saveAnalysis(normalizedResult, text);

    res.status(200).json(normalizedResult);
  } catch (err) {
    console.error('❌ Error in analyzeTextHandler:', err);
    res.status(500).json({ error: 'Failed to analyze text content.', details: err.message });
  }
};

export const analyzeImageHandler = async (req, res) => {
  try {
    let imageBuffer;
    let imageBase64 = req.body?.imageBase64 || req.body?.text;
    let filename;

    if (req.file) {
      imageBuffer = req.file.buffer;
      filename = req.file.originalname;
    }

    const rawInputText = imageBase64 || filename || 'Image file submission';

    // Step 1 & 2: Vision OCR & Threat Reasoning Pipeline
    const normalizedResult = await visionService.analyzeImage(imageBuffer, imageBase64, filename);

    // Step 3: Persistence to SQLite
    await historyService.saveAnalysis(normalizedResult, rawInputText);

    res.status(200).json(normalizedResult);
  } catch (err) {
    console.error('❌ Error in analyzeImageHandler:', err);
    res.status(500).json({ error: 'Failed to analyze image content.', details: err.message });
  }
};

export const analyzeVoiceHandler = async (req, res) => {
  try {
    let audioBuffer;
    let audioBase64 = req.body?.audioBase64 || req.body?.text;
    let filename;

    if (req.file) {
      audioBuffer = req.file.buffer;
      filename = req.file.originalname;
    }

    const rawInputText = audioBase64 || filename || 'Voice note recording submission';

    // Step 1 & 2: Speech-to-Text & Threat Reasoning Pipeline
    const normalizedResult = await speechService.analyzeVoice(audioBuffer, audioBase64, filename);

    // Step 3: Persistence to SQLite
    await historyService.saveAnalysis(normalizedResult, rawInputText);

    res.status(200).json(normalizedResult);
  } catch (err) {
    console.error('❌ Error in analyzeVoiceHandler:', err);
    res.status(500).json({ error: 'Failed to analyze voice recording.', details: err.message });
  }
};
