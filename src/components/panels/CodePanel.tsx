import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Code2, History, Download } from 'lucide-react';
import { Version } from '@/hooks/useVersionHistory';

interface CodePanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  versions: Version[];
  currentVersionId: number | null;
  onRollback: (versionId: number) => void;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  onCodeChange,
  versions,
  currentVersionId,
  onRollback
}) => {
  const [localCode, setLocalCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  // Debounced code update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCode !== code) {
        onCodeChange(localCode);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localCode, code, onCodeChange]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [localCode]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([localCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedUI.tsx';
    a.click();
    URL.revokeObjectURL(url);
  }, [localCode]);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const lineNumbers = localCode.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Code Editor</h2>
          {currentVersionId && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              v{versions.findIndex(v => v.id === currentVersionId) + 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded transition-colors ${
              showHistory 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Version history"
          >
            <History size={16} />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Download code"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Version History Sidebar */}
      {showHistory && versions.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-48 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">Version History</p>
            <div className="space-y-1">
              {versions.slice().reverse().map((version, idx) => (
                <button
                  key={version.id}
                  onClick={() => onRollback(version.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    version.id === currentVersionId
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">v{versions.length - idx}</span>
                    <span className="text-xs text-gray-500">{formatTime(version.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{version.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex">
        {/* Line numbers */}
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-xs font-mono py-3 px-2 text-right select-none overflow-hidden border-r border-gray-200 dark:border-gray-700">
          {Array.from({ length: lineNumbers }, (_, i) => (
            <div key={i + 1} className="h-5 leading-5">
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Code textarea */}
        <textarea
          value={localCode}
          onChange={(e) => setLocalCode(e.target.value)}
          className="flex-1 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm p-3 leading-5 focus:outline-none overflow-auto"
          spellCheck={false}
          placeholder="// Generated code will appear here..."
        />
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{lineNumbers} lines</span>
        <span>TypeScript React</span>
      </div>
    </div>
  );
};

export default CodePanel;
