"use client";

import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Paperclip, Send, Mic, X, Video, Phone, Settings, Bot, User, FileText, ImageIcon } from 'lucide-react';
import CallInterface from './CallInterface';
import { ModelSelector } from './components/ModelSelector';
import { ChatService } from './services/chatServiceOpenRouter';
import { ChatMessage, Attachment, Property } from './types';

// More professional and modern agent profile image
const AGENT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop";
const AGENT_NAME = "Priya";

export const AIChatWidget: React.FC = () => {
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        id: 'init-1', 
        text: "Hello! I'm Priya, your personal Real Estate AI. 🏡 How can I assist you today?", 
        sender: 'model', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(["I want to buy", "I want to sell", "Just browsing"]);
  const chatService = useRef(new ChatService());
  const [currentModel, setCurrentModel] = useState(() => chatService.current.getCurrentModel());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    chatService.current.initChat();
    scrollToBottom();
  }, []);

  useEffect(scrollToBottom, [messages, suggestions]);

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    chatService.current.setModel(model as any);
    // Reinitialize chat with new model
    chatService.current.initChat();
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert("Only images (PNG, JPG) and PDF files are supported.");
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setAttachment({
      type: isImage ? 'image' : 'pdf',
      mimeType: file.type,
      data: base64,
      name: file.name,
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => setAttachment(null);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim() && !attachment) return;

    const currentAttachment = attachment;
    setInputText("");
    setAttachment(null);
    setSuggestions([]);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageId = Date.now().toString();

    setMessages(prev => [...prev, {
        id: messageId,
        text,
        sender: 'user',
        time: timeString,
        status: 'sent',
        attachment: currentAttachment || undefined,
    }]);

    try {
      const response = await chatService.current.sendMessage(
          text, 
          currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : undefined
      );
      
      const { text: responseText, audio } = response;
      let cleanText = responseText;
      let parsedSuggestions: string[] = [];
      let parsedProperties: Property[] = [];

      // Simplified parsing logic
      const suggestionMatch = responseText.match(/<SUGGESTIONS>(.*?)<\/SUGGESTIONS>/s);
      if (suggestionMatch?.[1]) {
          try {
              parsedSuggestions = JSON.parse(suggestionMatch[1].trim().replace(/```json|```/g, ''));
              cleanText = cleanText.replace(suggestionMatch[0], '');
          } catch (e) { console.error("Failed to parse suggestions", e); }
      }

      const propertyMatch = responseText.match(/<PROPERTIES>(.*?)<\/PROPERTIES>/s);
      if (propertyMatch?.[1]) {
          try {
              parsedProperties = JSON.parse(propertyMatch[1].trim().replace(/```json|```/g, ''));
              cleanText = cleanText.replace(propertyMatch[0], '');
          } catch (e) { console.error("Failed to parse properties", e); }
      }

      const genMatch = responseText.match(/<GENERATE_IMAGE>(.*?)<\/GENERATE_IMAGE>/s);
      const editMatch = responseText.match(/<EDIT_IMAGE>(.*?)<\/EDIT_IMAGE>/s);
      cleanText = cleanText.replace(/<GENERATE_IMAGE>.*?<\/GENERATE_IMAGE>/s, '').replace(/<EDIT_IMAGE>.*?<\/EDIT_IMAGE>/s, '').trim();

      if (parsedSuggestions.length > 0) setSuggestions(parsedSuggestions);

      const respTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMessageId = (Date.now() + 1).toString();

      setMessages(prev => {
          const updatedMessages = prev.map(msg => 
              msg.id === messageId ? { ...msg, status: 'read' as const } : msg
          );
          return [...updatedMessages, {
              id: aiMessageId,
              text: cleanText,
              sender: 'model',
              time: respTimeString,
              properties: parsedProperties.length > 0 ? parsedProperties : undefined,
              audio,
          }];
      });

      if (genMatch || (editMatch && currentAttachment)) {
          const prompt = genMatch?.[1] ?? editMatch![1];
          const imgAttachment = genMatch ? undefined : { mimeType: currentAttachment!.mimeType, data: currentAttachment!.data };
          
          chatService.current.generateImage(prompt, imgAttachment).then(base64Img => {
              if (base64Img) {
                  setMessages(prev => prev.map(m => 
                      m.id === aiMessageId ? { ...m, generatedImage: base64Img } : m
                  ));
              }
          }).catch(e => console.error("Async image gen failed", e));
      }

    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (inCall) {
    return <CallInterface onEndCall={() => setInCall(false)} />;
  }

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col rounded-xl shadow-2xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-4 flex justify-between items-center z-10 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
               <div className="relative">
                   <img src={AGENT_PROFILE_IMAGE} className="w-11 h-11 rounded-full object-cover" alt="Profile"/>
                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
               </div>
               <div>
                  <h1 className="text-md font-bold text-gray-900 dark:text-gray-100">{AGENT_NAME}</h1>
                  <p className="text-xs text-green-500 font-medium">Online</p>
               </div>
          </div>
          <div className="flex gap-2 text-gray-500 dark:text-gray-400">
              <ModelSelector 
                currentModel={currentModel} 
                onModelChange={handleModelChange}
                className="hidden sm:block"
              />
              <button onClick={() => setInCall(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Video size={20} />
              </button>
              <button onClick={() => setInCall(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Phone size={18} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Settings size={20} />
              </button>
          </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center my-2">
              <span className="bg-gray-200 dark:bg-gray-700 text-xs px-3 py-1 rounded-lg text-gray-500 dark:text-gray-400">Today</span>
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'model' && (
                     <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Bot size={20} className="text-gray-500" />
                     </div>
                )}
                <div className={`w-auto max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                  {msg.text}
                  <div className="text-xs opacity-70 mt-1 text-right">{msg.time}</div>
                </div>
                {msg.sender === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-gray-500" />
                     </div>
                )}
            </div>
          ))}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2 z-20 rounded-b-xl">
          {suggestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                  {suggestions.map((s, i) => (
                      <button key={i} onClick={() => handleSend(s)} className="bg-gray-100 dark:bg-gray-700 text-sm px-4 py-1.5 rounded-full whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          {s}
                      </button>
                  ))}
              </div>
          )}
          {attachment && (
              <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    {attachment.type === 'image' ? <ImageIcon className="text-gray-500" /> : <FileText className="text-gray-500" />}
                  </div>
                  <div className="flex-1 text-sm">{attachment.name}</div>
                  <button onClick={removeAttachment} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <X size={18} />
                  </button>
              </div>
          )}
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/png, image/jpeg, application/pdf" />
            <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-transparent focus:ring-0 rounded-full px-4 py-2 text-sm"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button onClick={() => handleSend()} className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-colors text-white ${inputText.trim() || attachment ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              {inputText.trim() || attachment ? <Send size={20} /> : <Mic size={20} />}
            </button>
          </div>
      </div>
    </div>
  );
};

export default AIChatWidget;