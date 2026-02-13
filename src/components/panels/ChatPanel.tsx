import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronDown, ChevronRight, RotateCcw, Trash2 } from 'lucide-react';
import { GenerationProgress } from '@/Agent';

interface Message {
  id: number;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  stage?: 'planning' | 'generating' | 'explaining' | 'complete' | 'error';
  data?: {
    plan?: any;
    code?: string;
    explanation?: string;
    reasoning?: any;
  };
}

interface ChatPanelProps {
  onGenerate: (prompt: string) => Promise<void>;
  onModify: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  hasCode: boolean;
  onClear: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onGenerate,
  onModify,
  isGenerating,
  progress,
  hasCode,
  onClear
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, progress]);

  useEffect(() => {
    if (progress) {
      if (progress.stage === 'complete' && progress.data) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'assistant',
          content: progress.data.explanation || 'UI generated successfully!',
          timestamp: Date.now(),
          stage: 'complete',
          data: progress.data
        }]);
      } else if (progress.stage === 'error') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          content: `Error: ${progress.message}`,
          timestamp: Date.now(),
          stage: 'error'
        }]);
      }
    }
  }, [progress?.stage]);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const prompt = input;
    setInput('');

    if (hasCode) {
      await onModify(prompt);
    } else {
      await onGenerate(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearChat = () => {
    setMessages([]);
    onClear();
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="Clear chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Start building your UI</p>
            <p className="text-sm">Describe what you want to create</p>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400">Try:</p>
              <button
                onClick={() => setInput("Create a dashboard with a navbar, sidebar, and a table showing user data")}
                className="text-xs text-blue-500 hover:text-blue-600 block"
              >
                "Create a dashboard with navbar, sidebar, and user table"
              </button>
              <button
                onClick={() => setInput("Build a contact form with name, email, and message inputs inside a card")}
                className="text-xs text-blue-500 hover:text-blue-600 block"
              >
                "Build a contact form inside a card"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-lg ${
              msg.type === 'user'
                ? 'bg-blue-600 text-white'
                : msg.type === 'system'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}>
              <div className="px-4 py-2">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              {/* Show plan details for complete messages */}
              {msg.stage === 'complete' && msg.data && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {/* Plan Section */}
                  {msg.data.plan && (
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => toggleSection(`plan-${msg.id}`)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {expandedSections.has(`plan-${msg.id}`) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>📄 Layout Plan</span>
                      </button>
                      {expandedSections.has(`plan-${msg.id}`) && (
                        <pre className="px-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 overflow-x-auto max-h-48">
                          {JSON.stringify(msg.data.plan, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  {/* Components used */}
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>🧩</span>
                    <span>Code generated with {countComponents(msg.data.code || '')} component imports</span>
                  </div>
                </div>
              )}
              
              <div className="px-4 py-1 text-xs opacity-60">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Progress indicator */}
        {isGenerating && progress && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 max-w-[90%]">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{progress.message}</span>
              </div>
              {progress.stage === 'planning' && progress.data?.plan && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Plan created</p>
              )}
              {progress.stage === 'generating' && progress.data?.code && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Code generated</p>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {hasCode && (
          <div className="mb-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <RotateCcw size={12} />
            <span>Modify mode: Your prompt will update the existing UI</span>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasCode ? "Describe changes to make..." : "Describe your UI..."}
            disabled={isGenerating}
            rows={3}
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

function countComponents(code: string): number {
  const imports = code.match(/import.*from.*@\/components\/ui/g);
  return imports?.length || 0;
}

export default ChatPanel;
