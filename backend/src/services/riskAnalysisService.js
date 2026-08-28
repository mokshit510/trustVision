import { FORBIDDEN_CERTAINTY_PHRASES } from '../../../shared/src/constants.js';

export class RiskAnalysisService {
  /**
   * Sanitizes text to remove absolute certainty claims
   */
  sanitizeSafetyText(text) {
    let sanitized = text;

    for (const forbidden of FORBIDDEN_CERTAINTY_PHRASES) {
      const regex = new RegExp(forbidden, 'gi');
      sanitized = sanitized.replace(regex, 'appears potentially dangerous');
    }

    // Ensure phrasing doesn't say "100% scam"
    sanitized = sanitized.replace(/100%\s*(certain|guaranteed|scam|fraud)/gi, 'high probability of potential risk');
    sanitized = sanitized.replace(/definitely\s+(a\s+)?(scam|fraud|malicious|phishing)/gi, 'appears strongly indicative of a potential $2');

    return sanitized;
  }

  /**
   * Validates and normalizes an AnalysisResult object to meet all safety criteria
   */
  normalizeAndValidateResult(partialResult, rawInputText) {
    const rawLower = rawInputText.toLowerCase().trim();

    // Check if input content is too short or insufficient
    if (rawLower.length < 5 && !partialResult.evidence?.length) {
      return {
        id: partialResult.id || `analysis-${Date.now()}`,
        modality: partialResult.modality || 'text',
        riskLevel: 'insufficient_evidence',
        confidence: 0.3,
        summary: 'Insufficient input provided to reliably evaluate threat signals.',
        signals: ['Very short or vague input snippet provided.'],
        whyItMatters: 'Safety analysis requires sufficient text, visual elements, or speech content to detect known scam indicators or threat vectors.',
        potentialImpact: 'Risk level cannot be determined safely.',
        recommendedAction: 'Provide additional context, full message text, or a clearer image/voice note.',
        verificationAdvice: 'Do not click links or share credentials until full details can be verified.',
        evidence: [
          {
            category: 'metadata',
            title: 'Low Context Input',
            detail: 'Input content was under 5 characters or missing key details.'
          }
        ],
        createdAt: partialResult.createdAt || new Date().toISOString(),
        rawInputSnippet: rawInputText,
        extractedContent: partialResult.extractedContent
      };
    }

    // Enforce non-definitive phrasing across all text fields
    const summary = this.sanitizeSafetyText(partialResult.summary || 'Threat analysis complete.');
    const whyItMatters = this.sanitizeSafetyText(partialResult.whyItMatters || 'Evaluated against security threat vectors.');
    const potentialImpact = this.sanitizeSafetyText(partialResult.potentialImpact || 'Potential unauthorized access or financial exposure.');
    const recommendedAction = this.sanitizeSafetyText(partialResult.recommendedAction || 'Do not engage or share sensitive information.');
    const verificationAdvice = this.sanitizeSafetyText(partialResult.verificationAdvice || 'Verify through official independent channels.');

    const signals = (partialResult.signals || []).map(s => this.sanitizeSafetyText(s));

    // Ensure financial/credential triggers prioritize safety verification
    const containsFinancialTriggers = /\b(bank|account|kyc|otp|password|upi|pay|money|blocked|verify|login|transfer|prize|rupees|₹|\$)\b/i.test(rawLower);

    let riskLevel = partialResult.riskLevel || 'low_risk';
    let confidence = Math.min(Math.max(partialResult.confidence ?? 0.8, 0.1), 0.99); // never 1.0 (100%)

    // Cap confidence at 0.95 to respect "never claim 100% certainty" rule
    if (confidence >= 1.0) {
      confidence = 0.95;
    }

    if (containsFinancialTriggers && (riskLevel === 'safe' || riskLevel === 'low_risk') && (rawLower.includes('otp') || rawLower.includes('kyc') || rawLower.includes('blocked') || rawLower.includes('won'))) {
      riskLevel = 'potentially_dangerous';
    }

    // Ensure evidence list is structured
    const evidence = (partialResult.evidence || []).map(e => ({
      category: e.category || 'threat_vector',
      title: this.sanitizeSafetyText(e.title),
      detail: this.sanitizeSafetyText(e.detail)
    }));

    return {
      id: partialResult.id || `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      modality: partialResult.modality || 'text',
      riskLevel,
      confidence,
      summary,
      signals: signals.length > 0 ? signals : ['Analyzed intent, urgency markers, and communication patterns.'],
      whyItMatters,
      potentialImpact,
      recommendedAction,
      verificationAdvice,
      evidence: evidence.length > 0 ? evidence : [
        {
          category: 'threat_vector',
          title: 'Heuristic Vector Analysis',
          detail: 'Screened against common social engineering and financial pressure indicators.'
        }
      ],
      createdAt: partialResult.createdAt || new Date().toISOString(),
      rawInputSnippet: rawInputText.substring(0, 300),
      extractedContent: partialResult.extractedContent
    };
  }
}

export const riskAnalysisService = new RiskAnalysisService();
