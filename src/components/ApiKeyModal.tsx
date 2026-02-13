import React, { useState } from 'react';
import { Key, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('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');
      return;
    }
    if (!apiKey.startsWith('sk-')) {
      setError('API key should start with "sk-"');
      return;
    }
    onSubmit(apiKey.trim());
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">PraveenAI</h1>
          <p className="text-blue-100 text-xs">Made by Praveen </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="sk-or-v1-..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Start Building
          </button>

          <div className="text-center">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Get your API key from OpenRouter
              <ExternalLink size={14} />
            </a>
          </div>
        </form>

        {/* Info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">What you can build:</p>
            <ul className="space-y-1 text-xs">
              <li>• Dashboards with charts and tables</li>
              <li>• Forms with inputs and buttons</li>
              <li>• Navigation with navbar and sidebar</li>
              <li>• Modals and card-based layouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
