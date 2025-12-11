import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob, decodeAudioData, base64ToUint8Array, blobToBase64 } from "../utils/audio";

// Configuration for the Live API
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
const SYSTEM_INSTRUCTION = `You are Priya, a world-class Real Estate Agent with 15 years of experience. 
**Persona:** Warm, professional, astute, and trustworthy. You sound natural, confident, and human.
**Context:** You are on a live video call. The user is streaming their camera to show you a property. You MUST pay close attention to the video feed.

**Core Responsibility - Real-Time Visual Analysis:**
- **Actively Observe:** As the camera moves, comment on what you see *immediately*. Do not wait for the user to ask "What do you think?".
- **Identify Specifics:** Call out features as you see them. E.g., "I see beautiful hardwood floors there," "That looks like a quartz countertop," or "The natural light in this room is fantastic."
- **Assess Condition:** Look for value-adds or issues. E.g., "Those stainless steel appliances look brand new," or "The ceiling height in here makes the room feel very spacious."
- **Room Transitions:** Acknowledge when the user enters a new area. "Okay, moving into the primary bedroom now."

**Other Capabilities:**
- **Location Intelligence:** Use Google Maps to check neighborhoods if mentioned.
- **Market Knowledge:** Discuss trends, comps, and ROI using professional terms (curb appeal, turnkey).

**Interaction Guidelines:**
- **Be Concise:** Keep responses short (1-3 sentences) and conversational.
- **Be Proactive:** Drive the conversation based on visual cues. If the user pauses, comment on the visual.
- **Tone:** Enthusiastic but grounded.`;

export class LiveService {
  private ai: GoogleGenAI;
  private session: any | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private videoInterval: number | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(
    onOpen: () => void,
    onClose: () => void,
    onError: (e: Error) => void,
    onAudioData: (amplitude: number) => void, // For visualizer
    onCaption: (text: string) => void // For live captions
  ) {
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // We throw here so the caller catches it.
        throw new Error("Your browser does not support audio input.");
    }

    try {
      // Create destination for recording mixing
      this.audioDestination = this.outputAudioContext.createMediaStreamDestination();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect user mic to the destination (so it's recorded)
      const micSource = this.outputAudioContext.createMediaStreamSource(stream);
      micSource.connect(this.audioDestination);

      const config = {
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, 
          },
          outputAudioTranscription: {}, // Enable transcription for model output
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
        },
      };

      const sessionPromise = this.ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            onOpen();
            this.startAudioInput(stream, sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
            this.handleMessage(msg, onAudioData, onCaption);
          },
          onclose: () => {
            onClose();
            this.cleanup();
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            onError(new Error("Connection to server failed."));
            this.cleanup();
          }
        }
      });
      
      this.session = sessionPromise;
      return sessionPromise;

    } catch (error: any) {
      let message = "Failed to connect to microphone.";
      const errName = error.name || '';
      const errMsg = error.message || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          message = "Microphone access denied. Please enable permissions in your browser settings.";
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError' || errMsg.includes('device not found')) {
          message = "No microphone found. Please check your system audio settings.";
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          message = "Microphone is busy or not readable. Try closing other apps using it.";
      }
      
      console.error("Audio initialization error:", error);
      throw new Error(message);
    }
  }

  private startAudioInput(stream: MediaStream, sessionPromise: Promise<any>) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      sessionPromise.then(session => {
         session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage, onAudioData: (amp: number) => void, onCaption: (text: string) => void) {
    if (!this.outputAudioContext) return;

    // Critical: Ensure AudioContext is running (browsers often suspend it until user interaction)
    if (this.outputAudioContext.state === 'suspended') {
        try {
            await this.outputAudioContext.resume();
        } catch (e) {
            console.error("Failed to resume audio context", e);
        }
    }

    // Handle Output Transcription
    if (message.serverContent?.outputTranscription?.text) {
        onCaption(message.serverContent.outputTranscription.text);
    }

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const audioBytes = base64ToUint8Array(base64Audio);
      
      // Calculate amplitude for visualizer (simple RMS)
      let sum = 0;
      for(let i=0; i<audioBytes.length; i++) {
         sum += Math.abs(audioBytes[i] - 128); // Approximation for uint8
      }
      const avg = sum / audioBytes.length;
      onAudioData(avg);

      // Play audio
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      
      const audioBuffer = await decodeAudioData(audioBytes, this.outputAudioContext);
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);
      
      // Also connect to the recording destination if it exists
      if (this.audioDestination) {
        source.connect(this.audioDestination);
      }
      
      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(source => source.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  // Returns the mixed audio stream (Mic + Agent) for recording
  getAudioDestination(): MediaStreamAudioDestinationNode | null {
    return this.audioDestination;
  }

  startVideoStreaming(videoElement: HTMLVideoElement) {
    if (this.videoInterval) clearInterval(this.videoInterval);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Send frames at 2 FPS (500ms) for better real-time tracking of movement
    this.videoInterval = window.setInterval(() => {
        if (!this.session || !videoElement || videoElement.paused || videoElement.ended || videoElement.videoWidth === 0) return;

        canvas.width = videoElement.videoWidth * 0.5; // Scale down for performance
        canvas.height = videoElement.videoHeight * 0.5;
        
        ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
            if (blob && this.session) {
                const base64 = await blobToBase64(blob);
                this.session.then((s: any) => {
                    s.sendRealtimeInput({
                        media: {
                            mimeType: 'image/jpeg',
                            data: base64
                        }
                    });
                });
            }
        }, 'image/jpeg', 0.6);

    }, 500); 
  }

  async disconnect() {
    this.cleanup();
  }

  private cleanup() {
    if (this.videoInterval) {
        clearInterval(this.videoInterval);
        this.videoInterval = null;
    }
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    this.session = null;
    this.audioDestination = null;
  }
}