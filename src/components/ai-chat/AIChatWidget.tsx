"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Paperclip, Send, Mic, X, Video, Phone, Settings, Bot, User, FileText, ImageIcon, CheckCircle, Edit3, Loader2, Camera, Plus, Trash2 } from 'lucide-react';
import CallInterface from './CallInterface';
import { ModelSelector } from './components/ModelSelector';
import { ChatService } from './services/chatServiceOpenRouter';
import { ImageUploadService, UploadedImage } from './services/imageUploadService';
import { ChatMessage, Attachment, Property } from './types';

// Modern agent profile
const AGENT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop";
const AGENT_NAME = "Priya";

// Property Card Component
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
  <div className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-64 flex-shrink-0">
    <img
      src={property.image}
      alt={property.address}
      className="w-full h-32 object-cover"
    />
    <div className="p-3">
      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{property.price}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{property.address}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{property.specs}</p>
    </div>
  </div>
);

// Image Gallery Component for uploaded property images
const ImageGallery: React.FC<{
  images: UploadedImage[];
  onRemove: (id: string) => void;
  isUploading: boolean;
}> = ({ images, onRemove, isUploading }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 mt-2">
    <div className="flex items-center gap-2 mb-2">
      <Camera className="text-blue-500" size={16} />
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
        Property Photos ({images.length})
      </span>
      {isUploading && <Loader2 size={14} className="animate-spin text-blue-500" />}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {images.map((img) => (
        <div key={img.id} className="relative flex-shrink-0 group">
          <img
            src={img.url}
            alt={img.name}
            className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
          />
          <button
            onClick={() => onRemove(img.id)}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Listing Preview Card Component
const ListingPreviewCard: React.FC<{
  title: string;
  description: string;
  imageCount: number;
  onPublish: () => void;
  onEdit: () => void;
  onAddPhotos: () => void;
  isPublishing: boolean;
}> = ({ title, description, imageCount, onPublish, onEdit, onAddPhotos, isPublishing }) => (
  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-4 mt-3">
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="text-emerald-500" size={20} />
      <span className="font-semibold text-emerald-700 dark:text-emerald-300">Listing Ready!</span>
    </div>
    <h3 className="font-bold text-gray-800 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{description}</p>

    {/* Photo count indicator */}
    <div className="flex items-center gap-2 mb-3 text-sm">
      <Camera size={14} className="text-gray-500" />
      <span className="text-gray-600 dark:text-gray-400">
        {imageCount > 0 ? `${imageCount} photo${imageCount > 1 ? 's' : ''} attached` : 'No photos added'}
      </span>
      {imageCount === 0 && (
        <button
          onClick={onAddPhotos}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
        >
          <Plus size={14} />
          Add Photos
        </button>
      )}
    </div>

    <div className="flex gap-2">
      <button
        onClick={onPublish}
        disabled={isPublishing}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isPublishing ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Publishing...
          </>
        ) : (
          <>
            <CheckCircle size={18} />
            Publish Now
          </>
        )}
      </button>
      <button
        onClick={onAddPhotos}
        className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-1"
      >
        <Camera size={18} />
      </button>
      <button
        onClick={onEdit}
        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-1"
      >
        <Edit3 size={18} />
      </button>
    </div>
  </div>
);

// Message Bubble Component with enhanced rendering
const MessageBubble: React.FC<{
  msg: ChatMessage;
  imageCount: number;
  onPublish: () => void;
  onEdit: () => void;
  onAddPhotos: () => void;
  isPublishing: boolean;
}> = ({ msg, imageCount, onPublish, onEdit, onAddPhotos, isPublishing }) => {
  const isUser = msg.sender === 'user';

  // Parse listing preview from text
  const listingMatch = msg.text.match(/<LISTING_PREVIEW>([\s\S]*?)<\/LISTING_PREVIEW>/);
  let listingPreview: { title: string; description: string; ready_to_publish: boolean } | null = null;
  if (listingMatch) {
    try {
      listingPreview = JSON.parse(listingMatch[1].trim());
    } catch (e) { }
  }

  // Parse properties from text
  const propertiesMatch = msg.text.match(/<PROPERTIES>([\s\S]*?)<\/PROPERTIES>/);
  let properties: Property[] = [];
  if (propertiesMatch) {
    try {
      properties = JSON.parse(propertiesMatch[1].trim());
    } catch (e) { }
  }

  // Clean text for display
  const cleanText = msg.text
    .replace(/<PROPERTY_DATA>[\s\S]*?<\/PROPERTY_DATA>/g, '')
    .replace(/<LISTING_PREVIEW>[\s\S]*?<\/LISTING_PREVIEW>/g, '')
    .replace(/<SUGGESTIONS>[\s\S]*?<\/SUGGESTIONS>/g, '')
    .replace(/<PROPERTIES>[\s\S]*?<\/PROPERTIES>/g, '')
    .replace(/<GENERATE_IMAGE>[\s\S]*?<\/GENERATE_IMAGE>/g, '')
    .replace(/<EDIT_IMAGE>[\s\S]*?<\/EDIT_IMAGE>/g, '')
    .trim();

  // Format text with markdown-like styling
  const formatText = (text: string) => {
    return text
      .split('\n')
      .map((line) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Emoji bullets
        if (line.match(/^[🏷️📍📐💰✨📞🏠🔍✅❌🎉📋📊🛣️🌿🏔️🙏📸]/)) {
          return `<div class="flex gap-2 items-start mt-1">${line}</div>`;
        }
        return line;
      })
      .join('<br/>');
  };

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}
      <div className={`w-auto max-w-[85%] ${isUser ? '' : ''}`}>
        <div
          className={`p-3 rounded-2xl ${isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white dark:bg-gray-700 shadow-sm rounded-bl-none'
            }`}
        >
          {msg.attachment && (
            <div className="mb-2 p-2 bg-black/10 rounded-lg flex items-center gap-2">
              {msg.attachment.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
              <span className="text-sm truncate">{msg.attachment.name}</span>
            </div>
          )}
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(cleanText) }}
          />
          <div className="text-xs opacity-60 mt-1.5 text-right">{msg.time}</div>
        </div>

        {/* Property Cards */}
        {properties.length > 0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Listing Preview */}
        {listingPreview && listingPreview.ready_to_publish && (
          <ListingPreviewCard
            title={listingPreview.title}
            description={listingPreview.description}
            imageCount={imageCount}
            onPublish={onPublish}
            onEdit={onEdit}
            onAddPhotos={onAddPhotos}
            isPublishing={isPublishing}
          />
        )}

        {/* Generated Image */}
        {msg.generatedImage && (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img
              src={`data:image/png;base64,${msg.generatedImage}`}
              alt="Generated"
              className="max-w-full rounded-lg"
            />
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-white" />
        </div>
      )}
    </div>
  );
};

export const AIChatWidget: React.FC = () => {
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      text: `Ayubowan! 🙏 I'm Priya, your personal real estate assistant at LandSale.lk! 🏡

Whether you're looking to **buy** your dream property or **sell** your land, I'm here to help make it simple and easy.

📸 **Tip:** You can attach photos of your property anytime using the 📎 button!

What would you like to do today?

<SUGGESTIONS>["I want to sell my land", "Show me properties", "I need help buying"]</SUGGESTIONS>`,
      sender: 'model',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(["I want to sell my land", "Show me properties", "I need help buying"]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const chatService = useRef(new ChatService());
  const imageUploadService = useRef(ImageUploadService.getInstance());
  const [currentModel, setCurrentModel] = useState(() => chatService.current.getCurrentModel());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    chatService.current.initChat();
    scrollToBottom();
  }, []);

  useEffect(scrollToBottom, [messages, suggestions, uploadedImages]);

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    chatService.current.setModel(model as any);
    chatService.current.initChat();
  };

  // Handle property image uploads (multiple)
  const handlePropertyImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await imageUploadService.current.uploadImageFromBase64(
          base64,
          file.name,
          file.type
        );

        if (result) {
          setUploadedImages(prev => [...prev, result]);
        }
      }

      // Add a message about the uploaded images
      const imageCount = files.length;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `📸 Added ${imageCount} photo${imageCount > 1 ? 's' : ''} to the listing`,
        sender: 'user',
        time: timeString
      }]);

      // AI acknowledges the images
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Great! I've saved ${imageCount} photo${imageCount > 1 ? 's' : ''} for your listing! 📸✨\n\nGood photos help attract more buyers. You can add more anytime!\n\n<SUGGESTIONS>["Add more photos", "Continue with listing", "Remove a photo"]</SUGGESTIONS>`,
        sender: 'model',
        time: timeString
      }]);

      setSuggestions(["Add more photos", "Continue with listing", "Remove a photo"]);

    } catch (error) {
      console.error('Image upload failed:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Sorry, there was an issue uploading your photos. Please try again. 🙏",
        sender: 'model',
        time: timeString
      }]);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Remove an uploaded image
  const handleRemoveImage = async (imageId: string) => {
    await imageUploadService.current.removePendingImage(imageId);
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Trigger image upload dialog
  const handleAddPhotos = () => {
    imageInputRef.current?.click();
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

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Get uploaded image URLs
      const imageUrls = imageUploadService.current.getPendingImageUrls();

      // Get the property draft from the service
      const draft = chatService.current.getPropertyDraft();

      // Call the API endpoint (no login required!)
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title || `${draft.land_size || ''} ${draft.land_unit || 'Perch'} ${draft.property_type || 'Land'} for Sale in ${draft.city || draft.district || 'Sri Lanka'}`,
          description: draft.description || `Beautiful ${draft.land_size || ''} ${draft.land_unit || 'perch'} ${draft.property_type || 'land'} for sale${draft.city ? ` in ${draft.city}` : ''}. ${draft.features?.join(', ') || ''} Asking price: Rs. ${(draft.price || 0).toLocaleString()}.`,
          property_type: draft.property_type || 'land',
          price: draft.price || 0,
          district: draft.district,
          city: draft.city,
          address: draft.location,
          land_size: draft.land_size,
          land_unit: draft.land_unit || 'perches',
          bedrooms: draft.bedrooms,
          bathrooms: draft.bathrooms,
          features: [...(draft.amenities || []), ...(draft.features || [])],
          contact_phone: draft.contact_phone,
          contact_whatsapp: draft.contact_whatsapp,
          images: imageUrls,
        })
      });

      const result = await response.json();
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (result.success) {
        // Clear uploaded images after successful publish
        imageUploadService.current.clearPendingImages();
        setUploadedImages([]);

        const listingUrl = result.url || `/properties/${result.propertyId}`;

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `🎉 **Congratulations!** Your property has been listed successfully!\n\n📋 **Listing ID:** ${result.propertyId}\n🔗 **View Your Listing:** [Click here to view](${listingUrl})\n📸 **Photos:** ${imageUrls.length} attached\n\nYour listing is now live and visible to thousands of potential buyers!\n\n<SUGGESTIONS>["View my listing", "Create another", "Back to home"]</SUGGESTIONS>`,
          sender: 'model',
          time: timeString,
        }]);
        setSuggestions(["View my listing", "Create another", "Back to home"]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `❌ Sorry, there was an issue publishing your listing: ${result.error}\n\nPlease try again or contact support.\n\n<SUGGESTIONS>["Try again", "Edit listing", "Contact support"]</SUGGESTIONS>`,
          sender: 'model',
          time: timeString,
        }]);
        setSuggestions(["Try again", "Edit listing", "Contact support"]);
      }
    } catch (error) {
      console.error('Publish error:', error);
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `❌ Sorry, there was a network error. Please try again.\n\n<SUGGESTIONS>["Try again", "Contact support"]</SUGGESTIONS>`,
        sender: 'model',
        time: timeString,
      }]);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    handleSend("I want to edit the listing details");
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride ?? inputText;
    if (!text.trim() && !attachment) return;

    const currentAttachment = attachment;
    setInputText("");
    setAttachment(null);
    setSuggestions([]);
    setIsLoading(true);

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

      const { text: responseText } = response;

      // Parse suggestions
      const suggestionMatch = responseText.match(/<SUGGESTIONS>(.*?)<\/SUGGESTIONS>/s);
      let parsedSuggestions: string[] = [];
      if (suggestionMatch?.[1]) {
        try {
          parsedSuggestions = JSON.parse(suggestionMatch[1].trim().replace(/```json|```/g, ''));
        } catch (e) {
          console.error("Failed to parse suggestions", e);
        }
      }

      if (parsedSuggestions.length > 0) setSuggestions(parsedSuggestions);

      const respTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMessageId = (Date.now() + 1).toString();

      setMessages(prev => {
        const updatedMessages = prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'read' as const } : msg
        );
        return [...updatedMessages, {
          id: aiMessageId,
          text: responseText,
          sender: 'model',
          time: respTimeString,
        }];
      });

    } catch (error) {
      console.error("Failed to send message", error);
      const respTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble right now. Please try again! 🙏\n\n<SUGGESTIONS>[\"Try again\", \"Start over\", \"Contact support\"]</SUGGESTIONS>",
        sender: 'model',
        time: respTimeString,
      }]);
      setSuggestions(["Try again", "Start over", "Contact support"]);
    } finally {
      setIsLoading(false);
    }
  };

  if (inCall) {
    return <CallInterface onEndCall={() => setInCall(false)} />;
  }

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm p-4 flex justify-between items-center z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={AGENT_PROFILE_IMAGE} className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20" alt="Profile" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
          </div>
          <div>
            <h1 className="text-md font-bold text-gray-900 dark:text-gray-100">{AGENT_NAME}</h1>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 text-gray-500 dark:text-gray-400">
          <ModelSelector
            currentModel={currentModel}
            onModelChange={handleModelChange}
            className="hidden sm:block"
          />
          <button onClick={() => setInCall(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Video size={18} />
          </button>
          <button onClick={() => setInCall(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Phone size={16} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-center my-2">
          <span className="bg-gray-200 dark:bg-gray-700 text-xs px-3 py-1 rounded-full text-gray-500 dark:text-gray-400">Today</span>
        </div>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            imageCount={uploadedImages.length}
            onPublish={handlePublish}
            onEdit={handleEdit}
            onAddPhotos={handleAddPhotos}
            isPublishing={isPublishing}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex gap-1 p-3 bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none shadow-sm">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <div className="px-3 pb-2">
          <ImageGallery
            images={uploadedImages}
            onRemove={handleRemoveImage}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2 z-20">
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 text-sm px-4 py-2 rounded-full whitespace-nowrap hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all border border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {attachment && (
          <div className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
              {attachment.type === 'image' ? <ImageIcon className="text-emerald-600 dark:text-emerald-400" size={20} /> : <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />}
            </div>
            <div className="flex-1 text-sm text-emerald-700 dark:text-emerald-300 truncate">{attachment.name}</div>
            <button onClick={removeAttachment} className="p-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-600 dark:text-emerald-400">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Hidden file inputs */}
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/png, image/jpeg, application/pdf" />
          <input type="file" ref={imageInputRef} className="hidden" onChange={handlePropertyImageUpload} accept="image/*" multiple />

          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Paperclip size={20} />
          </button>

          {/* Camera/Image button for property photos */}
          <button
            onClick={handleAddPhotos}
            disabled={isLoading || isUploading}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
            title="Add property photos"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-emerald-500 focus:ring-0 rounded-full px-4 py-2.5 text-sm transition-colors"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!inputText.trim() && !attachment)}
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all text-white ${inputText.trim() || attachment
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/30'
              : 'bg-gray-300 dark:bg-gray-600'
              } disabled:opacity-50`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : inputText.trim() || attachment ? <Send size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;