import React, { useState, useMemo, useEffect } from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { Monitor, Smartphone, RefreshCw, AlertTriangle, Maximize2 } from 'lucide-react';
import * as UIComponents from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface PreviewPanelProps {
  code: string;
}

// Transform code for react-live compatibility
const transformCode = (code: string): string => {
  if (!code.trim()) return 'render(<div className="p-8 text-center text-gray-400">No preview available</div>)';

  let transformed = code;

  // Remove imports - react-live doesn't support them
  transformed = transformed.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  transformed = transformed.replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '');
  
  // Remove type imports
  transformed = transformed.replace(/^import\s+type\s+.*?;?\s*$/gm, '');
  
  // Remove export statements
  transformed = transformed.replace(/export\s+default\s+function\s+(\w+)/, 'function $1');
  transformed = transformed.replace(/export\s+default\s+/, '');
  transformed = transformed.replace(/export\s+/g, '');

  // Clean up empty lines at the start
  transformed = transformed.replace(/^\s*\n+/, '');

  // Find the main component name
  const componentMatch = transformed.match(/function\s+(\w+)\s*\(/);
  const componentName = componentMatch ? componentMatch[1] : null;

  // If we found a component, add the render call
  if (componentName) {
    // Remove any existing render calls
    transformed = transformed.replace(/render\s*\(\s*<[\s\S]*?>\s*\)\s*;?\s*$/, '');
    transformed = `${transformed.trim()}\n\nrender(<${componentName} />)`;
  } else {
    // Try to wrap JSX directly
    const jsxMatch = transformed.match(/<[A-Z][^>]*>[\s\S]*<\/[A-Z][^>]*>/);
    if (jsxMatch) {
      transformed = `render(${jsxMatch[0]})`;
    } else {
      transformed = `render(<div className="p-8 text-center text-gray-400">Could not render preview</div>)`;
    }
  }

  return transformed;
};

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ code }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const scope = useMemo(() => ({
    ...React,
    useState: React.useState,
    useEffect: React.useEffect,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useRef: React.useRef,
    ...UIComponents,
    Button: UIComponents.Button,
    Input: UIComponents.Input,
    Card: UIComponents.Card,
    Modal: UIComponents.Modal,
    Sidebar: UIComponents.Sidebar,
    Navbar: UIComponents.Navbar,
    Table: UIComponents.Table,
    Chart: UIComponents.Chart,
  }), []);

  const transformedCode = useMemo(() => {
    try {
      const result = transformCode(code);
      setError(null);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transform error');
      return '() => null';
    }
  }, [code]);

  // Reset preview when code changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [code]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
    setError(null);
  };

  const deviceWidths = {
    desktop: 'w-full',
    mobile: 'w-[375px]'
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Preview</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded transition-colors ${
                device === 'desktop'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Desktop view"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition-colors ${
                device === 'mobile'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Mobile view"
            >
              <Smartphone size={14} />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-4">
        {!code.trim() ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No preview available</p>
              <p className="text-sm mt-1">Generate UI to see the preview</p>
            </div>
          </div>
        ) : (
          <div className={`mx-auto ${deviceWidths[device]} min-h-full`}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden min-h-[400px]">
              <ErrorBoundary key={`eb-${key}`} onReset={handleRefresh}>
                <LiveProvider 
                  key={key}
                  code={transformedCode} 
                  scope={scope}
                  noInline={true}
                >
                  <div className="relative">
                    <LiveError className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 text-sm font-mono whitespace-pre-wrap" />
                    <LivePreview className="p-0" />
                  </div>
                </LiveProvider>
              </ErrorBoundary>
              
              {error && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Transform Warning</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{device === 'desktop' ? '100%' : '375px'} width</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Live
        </span>
      </div>
    </div>
  );
};

export default PreviewPanel;
