export interface UserProfile {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  knowsTime: boolean;
}

export interface AnalysisResult {
  koreanAnalysis: string;
  imagePrompt: string;
  generatedImage?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}