import React, { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { OPENROUTER_MODELS } from '../services/openRouterService';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  currentModel, 
  onModelChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const modelOptions = [
    // Free Models Section
    { 
      value: OPENROUTER_MODELS.CLAUDE_3_HAIKU_FREE, 
      label: '🟢 Claude 3 Haiku (Free)', 
      description: 'Fast & free - Recommended' 
    },
    { 
      value: OPENROUTER_MODELS.LLAMA_3_8B_FREE, 
      label: '🟢 Llama 3.1 8B (Free)', 
      description: 'Open source & free' 
    },
    { 
      value: OPENROUTER_MODELS.WIZARDLM_FREE, 
      label: '🟢 WizardLM 2 (Free)', 
      description: 'Efficient & free' 
    },
    { 
      value: OPENROUTER_MODELS.GPT35_TURBO_FREE, 
      label: '🟢 GPT-3.5 Turbo (Free)', 
      description: 'Cost-effective' 
    },
    
    // Premium Models Section
    { 
      value: OPENROUTER_MODELS.CLAUDE_3_SONNET, 
      label: '🔵 Claude 3 Sonnet', 
      description: 'Balanced performance' 
    },
    { 
      value: OPENROUTER_MODELS.CLAUDE_3_OPUS, 
      label: '🔵 Claude 3 Opus', 
      description: 'Most capable' 
    },
    { 
      value: OPENROUTER_MODELS.GPT4_TURBO, 
      label: '🔵 GPT-4 Turbo', 
      description: 'Latest GPT-4' 
    },
    { 
      value: OPENROUTER_MODELS.GPT4, 
      label: '🔵 GPT-4', 
      description: 'Original GPT-4' 
    },
    { 
      value: OPENROUTER_MODELS.LLAMA_3_70B, 
      label: '🔵 Llama 3 70B', 
      description: 'Large open source' 
    },
    { 
      value: OPENROUTER_MODELS.MIXTRAL_8X7B, 
      label: '🔵 Mixtral 8x7B', 
      description: 'Efficient mixture' 
    },
  ];

  const getCurrentModelLabel = () => {
    const model = modelOptions.find(m => m.value === currentModel);
    return model ? model.label : 'Unknown Model';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        <Settings size={16} />
        <span className="hidden sm:inline">{getCurrentModelLabel()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
              🟢 Free Models (Recommended)
            </div>
            {modelOptions.filter(opt => opt.label.includes('🟢')).map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onModelChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  currentModel === option.value
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </button>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
              🔵 Premium Models
            </div>
            {modelOptions.filter(opt => opt.label.includes('🔵')).map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onModelChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  currentModel === option.value
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              Current: {getCurrentModelLabel()}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};