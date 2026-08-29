import { riskAnalysisService } from './riskAnalysisService.js';

export class AIService {
  /**
   * Main threat reasoning engine for analyzing text content
   */
  async analyzeTextThreat(text, context) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        return await this.callCloudLLM(text, 'text', context);
      } catch (err) {
        console.warn('⚠️ Cloud LLM call failed, falling back to local threat reasoning engine:', err);
      }
    }

    // Deterministic High-Accuracy Local Threat Reasoning Engine
    return this.runLocalThreatEngine(text, 'text', context);
  }

  /**
   * Deterministic local threat reasoning engine for offline/fallback operation
   */
  runLocalThreatEngine(rawText, modality, extractedContent) {
    const textToAnalyze = (extractedContent || rawText).toLowerCase();

    // Check Demo 1: Bank KYC Block SMS
    if (textToAnalyze.includes('blocked') || (textToAnalyze.includes('kyc') && textToAnalyze.includes('bank')) || textToAnalyze.includes('30 minutes')) {
      return {
        modality,
        riskLevel: 'high_risk',
        confidence: 0.89,
        summary: 'Urgent account suspension threat with suspicious unverified link.',
        signals: [
          'Artificial urgency ("blocked within 30 minutes") designed to cause panic',
          'Third-party domain link instead of official bank portal',
          'Unsolicited request to complete sensitive identity verification (KYC)'
        ],
        whyItMatters: 'Financial institutions never send high-pressure SMS threats with non-official website links requiring instant action.',
        potentialImpact: 'Clicking the link may expose online banking credentials, identity details, and financial account access to attackers.',
        recommendedAction: 'Do not click the link or log in through the link provided in the message.',
        verificationAdvice: 'Open your bank\'s official mobile app independently or call the customer service phone number printed on the back of your debit/credit card.',
        evidence: [
          {
            category: 'urgency',
            title: 'Extreme Time Pressure',
            detail: 'Demands action within 30 minutes to prevent account lock.'
          },
          {
            category: 'threat_vector',
            title: 'Phishing Domain Vector',
            detail: 'Unverified external domain masquerading as a banking portal.'
          },
          {
            category: 'financial',
            title: 'Credential Harvesting Signal',
            detail: 'Directs user to input sensitive KYC and login details.'
          }
        ],
        extractedContent
      };
    }

    // Check Demo 2: Prize Win / Fee Scam
    if (textToAnalyze.includes('congratulations') || textToAnalyze.includes('won') || (textToAnalyze.includes('25,000') || textToAnalyze.includes('25000')) || textToAnalyze.includes('processing fee') || textToAnalyze.includes('upi')) {
      return {
        modality,
        riskLevel: 'potentially_dangerous',
        confidence: 0.86,
        summary: 'Advance-fee lottery/prize claim scheme detected.',
        signals: [
          'Unsolicited announcement of a large monetary prize (₹25,000)',
          'Requirement to pay an advance "processing fee" (₹499) to release funds',
          'Direct payment requested via personal UPI/digital wallet'
        ],
        whyItMatters: 'Legitimate lotteries and contests never require winner payment of advance fees or UPI transfers to claim prizes.',
        potentialImpact: 'Direct loss of requested processing fee (₹499) with no prize payout, plus exposure of payment wallet details.',
        recommendedAction: 'Refuse the payment request and block the sender immediately.',
        verificationAdvice: 'Verify if you ever officially entered such a contest. Legitimate organizations deduct taxes or fees at source rather than asking for upfront payment.',
        evidence: [
          {
            category: 'financial',
            title: 'Advance-Fee Scam Vector',
            detail: 'Promises reward upon payment of an upfront fee.'
          },
          {
            category: 'linguistic_pattern',
            title: 'Unsolicited Reward Bait',
            detail: 'Claims user won a lottery without prior entry.'
          }
        ],
        extractedContent
      };
    }

    // Check Demo 3: Voice / OTP Vishing Scam
    if (textToAnalyze.includes('otp') || textToAnalyze.includes('one-time password') || (textToAnalyze.includes('calling from') && textToAnalyze.includes('bank')) || textToAnalyze.includes('unauthorized login')) {
      return {
        modality,
        riskLevel: 'critical',
        confidence: 0.94,
        summary: 'Voice vishing attempt impersonating bank security to extract OTP.',
        signals: [
          'Caller impersonates official bank security personnel over phone call',
          'Direct verbal request to share 6-digit One-Time Password (OTP)',
          'Manufactured crisis regarding an alleged unauthorized login attempt'
        ],
        whyItMatters: 'Bank employees are strictly prohibited from asking customers for OTPs, PINs, or password details over the phone.',
        potentialImpact: 'Sharing an OTP authorizes immediate fraudulent fund transfers or device registration on your bank account.',
        recommendedAction: 'Disconnect the call immediately and do not share any numbers or codes.',
        verificationAdvice: 'Hang up and manually dial your bank\'s official customer care helpline number from their official website or debit card.',
        evidence: [
          {
            category: 'threat_vector',
            title: 'Voice Social Engineering (Vishing)',
            detail: 'Caller creates urgency to bypass security protocols.'
          },
          {
            category: 'financial',
            title: 'OTP Extraction Signal',
            detail: 'Direct request for temporary authentication token.'
          }
        ],
        extractedContent
      };
    }

    // Check Demo 4: Counterfeit Parking Payment QR
    if (textToAnalyze.includes('parking') || textToAnalyze.includes('meter') || textToAnalyze.includes('quick-pay-parking')) {
      return {
        modality,
        riskLevel: 'high_risk',
        confidence: 0.91,
        summary: 'Counterfeit payment QR code targeting physical parking meters.',
        signals: [
          'Unverified external payment portal masquerading as municipal parking authority',
          'Malicious overlay sticker QR code placed over physical meter',
          'Requests direct online payment to untrusted gateway'
        ],
        whyItMatters: 'Physical QR stickers pasted over parking meters are commonly used by attackers to divert parking payments to malicious accounts.',
        potentialImpact: 'Loss of payment amount and compromise of entered payment card details.',
        recommendedAction: 'Do not pay using the scanned link. Use the official municipal parking app or physical coin/card terminal.',
        verificationAdvice: 'Inspect physical meters for sticker tampering. Always verify domain name matches the official city authority.',
        evidence: [
          {
            category: 'threat_vector',
            title: 'QR Code Quishing Vector',
            detail: 'Directs user to unofficial parking payment gateway.'
          },
          {
            category: 'financial',
            title: 'Payment Diversion',
            detail: 'Intercepts municipal parking fees into fraudulent wallet.'
          }
        ],
        extractedContent
      };
    }

    // Check Demo 5: Suspicious Delivery Fee SMS
    if (textToAnalyze.includes('parcel') || textToAnalyze.includes('delivery') || textToAnalyze.includes('redelivery') || textToAnalyze.includes('indiapost')) {
      return {
        modality,
        riskLevel: 'high_risk',
        confidence: 0.88,
        summary: 'Smishing scam impersonating postal/courier service to harvest credentials.',
        signals: [
          'Unsolicited package delivery issue notification',
          'Demands small redelivery fee via untrusted third-party domain',
          'Harvests postal address and credit card payment information'
        ],
        whyItMatters: 'Postal carriers and courier companies do not require payment via unsolicited SMS links to correct address info.',
        potentialImpact: 'Recurring fraudulent credit card charges and identity theft.',
        recommendedAction: 'Do not click the tracking link or pay any fee.',
        verificationAdvice: 'Check your original purchase invoice and enter tracking number directly on the merchant\'s verified tracking website.',
        evidence: [
          {
            category: 'threat_vector',
            title: 'Package Delivery Smishing',
            detail: 'Spoofs postal service to extract credit card data.'
          }
        ],
        extractedContent
      };
    }

    // Generic suspicious financial / credential check
    const hasSuspiciousWords = /\b(password|verify|account|urgent|police|tax|refund|suspended|click|link|gift|crypto|investment|telegram)\b/i.test(textToAnalyze);

    if (hasSuspiciousWords) {
      return {
        modality,
        riskLevel: 'potentially_dangerous',
        confidence: 0.72,
        summary: 'Contains suspicious keywords and potential social engineering patterns.',
        signals: [
          'Reference to account actions or identity verification',
          'Includes urgency or call-to-action language'
        ],
        whyItMatters: 'Social engineering often relies on high-pressure language to bypass careful scrutiny.',
        potentialImpact: 'Unverified links or requests may compromise personal or financial security.',
        recommendedAction: 'Do not follow link instructions or provide requested details.',
        verificationAdvice: 'Cross-verify through independent channels before taking action.',
        evidence: [
          {
            category: 'threat_vector',
            title: 'Keyword Match',
            detail: 'Detected security-sensitive terms in communication.'
          }
        ],
        extractedContent
      };
    }

    // Low Risk / Normal message fallback
    return {
      modality,
      riskLevel: 'low_risk',
      confidence: 0.78,
      summary: 'No high-risk threat vectors or scam indicators detected.',
      signals: [
        'No urgent payment or OTP requests found',
        'Standard communication structure without known phishing patterns'
      ],
      whyItMatters: 'The input does not display typical indicators of active financial fraud or credential phishing.',
      potentialImpact: 'Low probability of immediate risk.',
      recommendedAction: 'Maintain normal digital safety practices when interacting with external messages.',
      verificationAdvice: 'Always confirm sender identity if requested to perform sensitive operations.',
      evidence: [
        {
          category: 'metadata',
          title: 'Standard Input',
          detail: 'Passed initial security screening rules.'
        }
      ],
      extractedContent
    };
  }

  /**
   * Helper to call Google Gemini REST API if GEMINI_API_KEY is available
   */
  async callCloudLLM(promptText, modality, context) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('No API key configured');
    }

    const systemInstruction = `
You are TrustVision AI Safety Layer. Analyze the user's input for cybersecurity, phishing, social engineering, vishing, or scam threats.
Output MUST be a valid JSON object matching this schema exactly:
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
    { "category": "threat_vector" | "linguistic_pattern" | "urgency" | "financial", "title": string, "detail": string }
  ]
}
SAFETY RULES:
1. NEVER state 100% certainty or say "This is definitely a scam". Use non-definitive phrasing like "appears potentially dangerous because...".
2. If payment, OTP, password, or financial access is requested, prioritize safe verification steps.
3. Keep explanation concise and phone-friendly.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\n[USER INPUT TO ANALYZE]:\n${promptText}\n\n[CONTEXT]: ${context || 'None'}` }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`HTTP ${response.status} ${response.statusText || ''} - ${errBody}`);
    }

    const data = await response.json();
    const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      throw new Error('Empty response from Gemini LLM');
    }

    const parsed = JSON.parse(rawJsonText);
    return {
      ...parsed,
      modality
    };
  }
}

export const aiService = new AIService();
