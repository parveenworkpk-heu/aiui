import React, { useState, useCallback, useEffect } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { TrinityAgent, GenerationProgress } from '@/Agent';
import { ChatPanel } from '@/components/panels/ChatPanel';
import { CodePanel } from '@/components/panels/CodePanel';
import { PreviewPanel } from '@/components/panels/PreviewPanel';


const AppContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [agent, setAgent] = useState<TrinityAgent | null>(null);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [activePanel, setActivePanel] = useState<'chat' | 'code' | 'preview'>('chat');

  const {
    versions,
    currentVersionId,
    addVersion,
    rollbackToVersion,
    clearHistory
  } = useVersionHistory();

  // Initialize agent from environment / config
  useEffect(() => {
    try {
      setAgent(new TrinityAgent());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!agent) return;

    setIsGenerating(true);
    setProgress({ stage: 'planning', message: 'Starting...' });

    try {
      let finalCode = '';
      let finalPlan = null;

      for await (const update of agent.generateWithProgress(prompt, setProgress)) {
        if (update.stage === 'complete' && update.data) {
          finalCode = update.data.code;
          finalPlan = update.data.plan;
          setCode(finalCode);
          addVersion(finalCode, finalPlan, prompt);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      setProgress({
        stage: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate UI'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [agent, addVersion]);

  const handleModify = useCallback(async (prompt: string) => {
    if (!agent || !code) return;

    setIsGenerating(true);
    setProgress({ stage: 'generating', message: '🔧 Modifying code...' });

    try {
      const { code: newCode } = await agent.modifyCode(code, prompt);
      setCode(newCode);
      addVersion(newCode, null, `Modify: ${prompt}`);
      setProgress({ stage: 'complete', message: '✨ Code updated!', data: { code: newCode } });
    } catch (error) {
      console.error('Modification error:', error);
      setProgress({
        stage: 'error',
        message: error instanceof Error ? error.message : 'Failed to modify UI'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [agent, code, addVersion]);

  const handleRollback = useCallback((versionId: number) => {
    const version = rollbackToVersion(versionId);
    if (version) {
      setCode(version.code);
    }
  }, [rollbackToVersion]);

  const handleClear = useCallback(() => {
    setCode('');
    clearHistory();
    setProgress(null);
  }, [clearHistory]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-900 dark:text-white hidden sm:block">PraveenAI</h1>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">Made by Praveen</span>
          </div>
        </div>

        {/* Mobile panel switcher */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setActivePanel('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              activePanel === 'chat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActivePanel('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              activePanel === 'code' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActivePanel('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              activePanel === 'preview' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          

        </div>
      </header>

      {/* Main content - 3 panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - 25% */}
        <div className={`w-full md:w-1/4 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 ${
          activePanel !== 'chat' ? 'hidden md:block' : ''
        }`}>
          <ChatPanel
            onGenerate={handleGenerate}
            onModify={handleModify}
            isGenerating={isGenerating}
            progress={progress}
            hasCode={!!code}
            onClear={handleClear}
          />
        </div>

        {/* Code Panel - 35% */}
        <div className={`w-full md:w-[35%] border-r border-gray-200 dark:border-gray-700 flex-shrink-0 ${
          activePanel !== 'code' ? 'hidden md:block' : ''
        }`}>
          <CodePanel
            code={code}
            onCodeChange={handleCodeChange}
            versions={versions}
            currentVersionId={currentVersionId}
            onRollback={handleRollback}
          />
        </div>

        {/* Preview Panel - 40% */}
        <div className={`w-full md:flex-1 ${
          activePanel !== 'preview' ? 'hidden md:block' : ''
        }`}>
          <PreviewPanel code={code} />
        </div>
      </div>

      {/* Responsive message for small screens */}
      <div className="hidden max-[640px]:flex fixed inset-0 bg-gray-900/95 items-center justify-center p-6 z-50">
        <div className="text-center text-white">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h2 className="text-xl font-bold mb-2">Best on larger screens</h2>
          <p className="text-gray-400 text-sm">For the best experience, please use a tablet or desktop device.</p>
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
