import { aiService } from './aiService.js';
import { riskAnalysisService } from './riskAnalysisService.js';

export class VisionService {
  /**
   * Analyze an uploaded image using Gemini multimodal analysis.
   */
  async analyzeImage(imageBuffer, imageBase64, filename) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('No GEMINI_API_KEY configured');
    }

    let base64Data = imageBase64;

    // If multer supplied the file, convert the buffer to base64.
    if (!base64Data && imageBuffer) {
      base64Data = imageBuffer.toString('base64');
    }

    if (!base64Data) {
      throw new Error('No image data received');
    }

    // Remove data URL prefix if the frontend sent one.
    if (base64Data.startsWith('data:image/')) {
      base64Data = base64Data.split(',')[1];
    }

    const mimeType = this.detectMimeType(filename);

    const result = await this.callGeminiVision(
      base64Data,
      mimeType,
      filename
    );

    result.modality = 'image';

    return riskAnalysisService.normalizeAndValidateResult(
      result,
      result.extractedContent || filename || 'Uploaded image'
    );
  }

  /**
   * Call Gemini with the actual image.
   */
  async callGeminiVision(base64Data, mimeType, filename) {
    const apiKey = process.env.GEMINI_API_KEY;

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `
You are TrustVision AI Safety Layer.

Analyze the ACTUAL IMAGE provided below.

Your job is to determine whether the image contains:
- phishing
- scams
- social engineering
- malicious instructions
- suspicious payment requests
- credential theft
- OTP/password requests
- fraudulent advertisements
- suspicious QR/payment content
- or other cybersecurity threats.

IMPORTANT:
Do not classify an image as dangerous merely because it contains words such as
"bank", "OTP", "payment", "password", "KYC", or "urgent".

Understand the context of the entire image.

For ordinary harmless images such as:
- yoga
- education
- college announcements
- normal photographs
- diagrams
- general information

return safe or low_risk.

Output MUST be valid JSON matching this schema exactly:

{
  "riskLevel": "safe" | "low_risk" | "suspicious" | "potentially_dangerous" | "high_risk" | "critical" | "insufficient_evidence",
  "confidence": number between 0.1 and 0.95,
  "summary": string,
  "signals": [string],
  "whyItMatters": string,
  "potentialImpact": string,
  "recommendedAction": string,
  "verificationAdvice": string,
  "evidence": [
    {
      "category": "threat_vector" | "linguistic_pattern" | "urgency" | "financial",
      "title": string,
      "detail": string
    }
  ],
  "extractedContent": string
}

Safety rules:
1. Never claim 100% certainty.
2. Do not invent information that is not visible in the image.
3. If there is insufficient evidence, use "insufficient_evidence".
4. For payment or credential requests, recommend independent verification.
5. Keep the explanation concise and phone-friendly.

Filename:
${filename || 'uploaded-image'}
`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Gemini Vision HTTP ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Gemini returned an empty vision response');
    }

    const parsed = JSON.parse(rawText);

    return parsed;
  }

  /**
   * Detect common image MIME types.
   */
  detectMimeType(filename) {
    const name = (filename || '').toLowerCase();

    if (name.endsWith('.png')) {
      return 'image/png';
    }

    if (name.endsWith('.webp')) {
      return 'image/webp';
    }

    if (name.endsWith('.gif')) {
      return 'image/gif';
    }

    return 'image/jpeg';
  }
}

export const visionService = new VisionService();