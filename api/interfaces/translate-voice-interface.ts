export interface TranslateVoiceReqInterface {
  voice?: File;
  voice_url?: string;
  model: string;
}

export interface TranslateVoiceResInterface {
  message: string;
  audioInfo: {
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    mimeType: string;
    url: string;
  };
  aiResponse?: {
    pinyin: string;
    china: string;
    vietnamese: string;
  };
  model?: string;
  timestamp: string;
  hasAudioFile: boolean;
  error?: string;
}
