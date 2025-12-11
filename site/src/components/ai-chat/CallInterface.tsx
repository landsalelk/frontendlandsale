import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AgentState } from './types';
import { LiveService } from './services/liveService';
import { Mic, MicOff, ScreenShare, PhoneOff, Video, VideoOff, Volume2, AlertTriangle, CheckCircle, CircleDot, Film } from 'lucide-react';

interface CallInterfaceProps {
  onEndCall: () => void;
}

const AGENT_IMAGE = "https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop";
const AGENT_NAME = "Priya";

const CallInterface: React.FC<CallInterfaceProps> = ({ onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [state, setState] = useState<AgentState>(AgentState.CALLING);
  const [micMuted, setMicMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecordingCall, setIsRecordingCall] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveService = useRef<LiveService>(new LiveService());

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(true);
        return;
    }
    try {
      const currentStream = videoRef.current?.srcObject as MediaStream;
      currentStream?.getTracks().forEach(track => track.stop());

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraError(false);
      }
    } catch (err) {
      console.warn("Camera access denied or failed", err);
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    startCamera();
    liveService.current.connect(
        () => setState(AgentState.CONNECTED),
        () => setState(AgentState.ENDED),
        (error: Error) => {
            setErrorMessage(error.message);
            setState(AgentState.ERROR);
        },
        (level) => setAudioLevel(Math.min(100, level * 5)),
        () => {} // Captions handled differently or removed for simplicity
    ).catch((e: Error) => {
        setErrorMessage(e.message || "Unable to start the call.");
        setState(AgentState.ERROR);
    });
    return () => { liveService.current.disconnect(); };
  }, [startCamera]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === AgentState.CONNECTED) {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const ControlButton: React.FC<{ onClick?: () => void; isActive?: boolean; className?: string; children: React.ReactNode }> = ({ onClick, isActive, className = '', children }) => (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20 text-white'} ${className}`}
    >
      {children}
    </button>
  );

  const renderStateOverlay = () => {
    const baseOverlayClass = "absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center text-white bg-black/80 backdrop-blur-md";
    switch (state) {
      case AgentState.CALLING:
        return (
          <div className={baseOverlayClass}>
            <img src={AGENT_IMAGE} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white/50" alt="Agent" />
            <h3 className="text-xl font-semibold mb-2">Connecting to {AGENT_NAME}...</h3>
            <div className="flex space-x-1 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        );
      case AgentState.ERROR:
        return (
          <div className={baseOverlayClass}>
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connection Issue</h3>
            <p className="text-gray-300 mb-6">{errorMessage || "An unexpected error occurred."}</p>
            <button onClick={onEndCall} className="bg-blue-500 px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition">Return to Chat</button>
          </div>
        );
      case AgentState.ENDED:
        return (
          <div className={baseOverlayClass}>
            <CheckCircle size={48} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Call Ended</h3>
            <p className="text-gray-300 mb-6">Thank you for using our service!</p>
            <button onClick={onEndCall} className="bg-blue-500 px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition">Return to Chat</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-900 flex flex-col items-center justify-between overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
            src={AGENT_IMAGE} 
            alt="Agent" 
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out blur-sm"
            style={{ transform: `scale(${1.05 + (audioLevel / 1000)})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {renderStateOverlay()}

      <div className="relative z-10 flex flex-col items-center pt-8 text-white">
        <h2 className="text-2xl font-bold">{AGENT_NAME}</h2>
        <p className="text-lg text-green-400">{formatTime(callDuration)}</p>
      </div>

      <div className={`absolute top-4 right-4 w-24 h-32 bg-black rounded-lg overflow-hidden shadow-lg border-2 ${cameraError ? 'border-red-500' : 'border-white/20'} z-20`}>
        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
            <VideoOff size={24} />
            <span className="text-xs mt-1">No Camera</span>
          </div>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
        )}
      </div>
      
      {isRecordingCall && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-red-600/80 text-white px-3 py-1 rounded-full text-sm">
          <CircleDot className="animate-pulse" size={16} />
          <span>Recording</span>
        </div>
      )}

      <div className="relative z-10 w-full p-6 flex justify-center items-center gap-4">
        <ControlButton onClick={() => setIsRecordingCall(!isRecordingCall)} isActive={isRecordingCall}>
            <Film size={24} />
        </ControlButton>
        <ControlButton onClick={() => setMicMuted(!micMuted)} isActive={micMuted}>
          {micMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </ControlButton>
        <ControlButton onClick={() => { /* Screen share logic */ }}>
            <ScreenShare size={24} />
        </ControlButton>
        <ControlButton onClick={onEndCall} className="!bg-red-500 hover:!bg-red-600">
          <PhoneOff size={28} />
        </ControlButton>
      </div>
    </div>
  );
};

export default CallInterface;