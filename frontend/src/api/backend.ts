import type { PredictResponse } from '../types';
import { http } from './http';

export async function health(): Promise<{ status: string }> {
  const { data } = await http.get('/api/health');
  return data;
}

export async function predictFull(
  form: FormData,
  onUploadProgress?: (ev: ProgressEvent) => void
): Promise<PredictResponse> {
  const { data } = await http.post('/api/predict/full', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return data as PredictResponse;
}

export async function predictFullStream(
  form: FormData,
  onProgress?: (data: { stage: string; progress: number; message: string }) => void,
  onComplete?: (result: PredictResponse) => void,
  onError?: (error: string) => void
): Promise<void> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseURL}/api/predict/full/stream`;
  
  const response = await fetch(url, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.stage === 'complete' && data.result) {
              onComplete?.(data.result);
            } else if (data.stage === 'error') {
              onError?.(data.message);
            } else {
              onProgress?.(data);
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}