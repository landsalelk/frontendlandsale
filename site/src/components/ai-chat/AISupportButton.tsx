"use client";

import React, { useState } from 'react';
import { AIChatWidget } from './AIChatWidget';
import { MessageCircle, X } from 'lucide-react';

export const AISupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-110 z-50"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-5 h-[calc(100vh-120px)] w-[440px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-40 flex flex-col">
          <AIChatWidget />
        </div>
      )}
    </div>
  );
};
