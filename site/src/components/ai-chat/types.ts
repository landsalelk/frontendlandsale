export interface AudioConfig {
  sampleRate: number;
  channels: number;
}

export enum AgentState {
  IDLE = 'IDLE',
  CALLING = 'CALLING',
  CONNECTED = 'CONNECTED',
  ENDED = 'ENDED',
  ERROR = 'ERROR'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Attachment {
  type: 'image' | 'pdf';
  data: string; // Base64 string
  mimeType: string;
  name?: string;
}

export interface Property {
  id: string;
  price: string;
  address: string;
  specs: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'model';
  time: string;
  status?: 'sent' | 'read';
  attachment?: Attachment;
  properties?: Property[];
  audio?: string; // Base64 WAV string
  generatedImage?: string; // Base64 image string from AI
}