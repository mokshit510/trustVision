const API_BASE =
  import.meta.env.VITE_API_URL || '/api';

export async function analyzeText(text, context) {
  const response = await fetch(`${API_BASE}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  return response.json();
}

export async function analyzeImage(file, textPayload) {
  const formData = new FormData();
  if (file) {
    formData.append('image', file);
  }
  if (textPayload) {
    formData.append('text', textPayload);
  }

  const response = await fetch(`${API_BASE}/analyze/image`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  return response.json();
}

export async function analyzeVoice(file, textPayload) {
  const formData = new FormData();
  if (file) {
    formData.append('audio', file);
  }
  if (textPayload) {
    formData.append('text', textPayload);
  }

  const response = await fetch(`${API_BASE}/analyze/voice`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  return response.json();
}

export async function getAnalyses() {
  const response = await fetch(`${API_BASE}/analyses`);
  if (!response.ok) {
    throw new Error('Failed to load analysis history');
  }
  return response.json();
}

export async function submitFeedback(feedback) {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback)
  });
  if (!response.ok) {
    throw new Error('Failed to submit feedback');
  }
  return response.json();
}
