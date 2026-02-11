
export interface ImageData {
  base64: string;
  mimeType: string;
}

export type AppStatus = 'idle' | 'uploading' | 'key-selection' | 'generating' | 'success' | 'error';

export interface GenerationResult {
  imageUrl: string;
  explanation?: string;
}
