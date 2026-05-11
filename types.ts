
export enum InfographicType {
  STATISTICAL = 'STATISTICAL',
  TIMELINE = 'TIMELINE',
  GEOGRAPHICAL = 'GEOGRAPHICAL',
  PROCESS = 'PROCESS',
  ANATOMY = 'ANATOMY',
  COMPARISON = 'COMPARISON',
  LISTICLE = 'LISTICLE',
  BIO_PROFILE = 'BIO_PROFILE',
  DASHBOARD = 'DASHBOARD',
  EDUCATIONAL = 'EDUCATIONAL'
}

export enum InfographicTheme {
  DARK_MODERN = 'DARK_MODERN',
  CLEAN_WHITE = 'CLEAN_WHITE',
  TECH_FUTURISTIC = 'TECH_FUTURISTIC',
  RETRO_VINTAGE = 'RETRO_VINTAGE',
  MINIMALIST = 'MINIMALIST',
  ISOMETRIC_3D = 'ISOMETRIC_3D'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}

export interface InfographicItem {
  id: string;
  label: string;
  value: string;
  subValue?: string;
}

export interface InfographicData {
  type: InfographicType;
  theme: InfographicTheme;
  aspectRatio: AspectRatio;
  title: string;
  imageDescription: string;
  unit: string;
  source: string;
  brand: string;
  customInstructions: string;
  items: InfographicItem[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_PROMPT = 'GENERATING_PROMPT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
