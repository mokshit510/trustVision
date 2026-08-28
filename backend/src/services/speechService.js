import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

import { aiService } from './aiService.js';
import { riskAnalysisService } from './riskAnalysisService.js';

const execFileAsync = promisify(execFile);

export class SpeechService {
  /**
   * Main voice analysis pipeline
   *
   * Audio
   *   -> WAV conversion
   *   -> Gemini transcription
   *   -> TrustVision threat analysis
   */
  async analyzeVoice(audioBuffer, audioBase64, filename) {
    const transcript = await this.transcribeAudio(
      audioBuffer,
      audioBase64,
      filename
    );

    if (!transcript || !transcript.trim()) {
      throw new Error('Could not extract speech from the audio');
    }

    console.log('🎤 Transcript:', transcript);

    const partialResult = await aiService.analyzeTextThreat(
      transcript,
      `Audio Voice Note (${filename || 'recorded audio'})`
    );

    partialResult.modality = 'voice';
    partialResult.extractedContent = transcript;

    return riskAnalysisService.normalizeAndValidateResult(
      partialResult,
      transcript
    );
  }

  /**
   * Convert incoming audio to WAV and send it to Gemini.
   */
  async transcribeAudio(audioBuffer, audioBase64, filename) {
    // Keep support for text-based demo/testing payloads.
    if (
      audioBase64 &&
      audioBase64.length < 1000 &&
      !audioBase64.startsWith('data:audio')
    ) {
      return audioBase64;
    }

    if (!audioBuffer || !audioBuffer.length) {
      throw new Error('No audio data received');
    }

    const id = randomUUID();

    const inputPath = `/tmp/trustvision-${id}-input`;
    const outputPath = `/tmp/trustvision-${id}.wav`;

    try {
      // Save uploaded audio.
      await writeFile(inputPath, audioBuffer);

      // Convert browser WebM/Opus/etc. to WAV.
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        inputPath,
        '-ar',
        '16000',
        '-ac',
        '1',
        '-c:a',
        'pcm_s16le',
        outputPath
      ]);

      const wavBuffer = await import('fs/promises').then(fs =>
        fs.readFile(outputPath)
      );

      return await this.transcribeWithGemini(wavBuffer);
    } finally {
      await unlink(inputPath).catch(() => { });
      await unlink(outputPath).catch(() => { });
    }
  }

  /**
   * Send WAV audio directly to Gemini.
   */
  async transcribeWithGemini(wavBuffer) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const audioBase64 = wavBuffer.toString('base64');

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
Transcribe the following audio exactly.

Return ONLY the spoken words.
Do not summarize.
Do not analyze the message.
Do not add commentary.
Do not invent missing words.
`
            },
            {
              inlineData: {
                mimeType: 'audio/wav',
                data: audioBase64
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Gemini transcription failed: HTTP ${response.status} - ${errorBody}`
      );
    }

    const data = await response.json();

    const transcript =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!transcript) {
      throw new Error('Gemini returned an empty transcript');
    }

    return transcript;
  }
}

export const speechService = new SpeechService();