export const OPENROUTER_MODEL = "arcee-ai/trinity-large-preview:free" as const;

export const getOpenRouterApiKey = (): string | undefined => {
  // Prefer Vite-style import.meta.env
  const fromEnv = (import.meta as any).env?.VITE_OPENROUTER_API_KEY as string | undefined;
  if (fromEnv) return fromEnv;

  // Fallback to legacy REACT_APP_ style if injected at runtime
  if (typeof window !== 'undefined') {
    const globalKey = (window as any).OPENROUTER_API_KEY as string | undefined;
    if (globalKey) return globalKey;
  }

  return undefined;
};
