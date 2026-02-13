import { useState, useEffect, useCallback } from 'react';

export interface Version {
  id: number;
  timestamp: number;
  code: string;
  plan: any;
  prompt: string;
}

const STORAGE_KEY = 'ai-ui-builder-versions';
const MAX_VERSIONS = 20;

export const useVersionHistory = () => {
  const [versions, setVersions] = useState<Version[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentVersionId, setCurrentVersionId] = useState<number | null>(() => {
    const saved = versions;
    return saved.length > 0 ? saved[saved.length - 1].id : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
    } catch (e) {
      console.error('Failed to save versions to localStorage:', e);
    }
  }, [versions]);

  const addVersion = useCallback((code: string, plan: any, prompt: string): Version => {
    const newVersion: Version = {
      id: Date.now(),
      timestamp: Date.now(),
      code,
      plan,
      prompt
    };

    setVersions(prev => {
      const updated = [...prev, newVersion];
      if (updated.length > MAX_VERSIONS) {
        return updated.slice(-MAX_VERSIONS);
      }
      return updated;
    });

    setCurrentVersionId(newVersion.id);
    return newVersion;
  }, []);

  const rollbackToVersion = useCallback((versionId: number): Version | null => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersionId(versionId);
      return version;
    }
    return null;
  }, [versions]);

  const clearHistory = useCallback(() => {
    setVersions([]);
    setCurrentVersionId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getCurrentVersion = useCallback((): Version | null => {
    if (!currentVersionId) return null;
    return versions.find(v => v.id === currentVersionId) || null;
  }, [versions, currentVersionId]);

  const deleteVersion = useCallback((versionId: number) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
    if (currentVersionId === versionId) {
      setCurrentVersionId(versions.length > 1 ? versions[versions.length - 2]?.id : null);
    }
  }, [versions, currentVersionId]);

  return {
    versions,
    currentVersionId,
    addVersion,
    rollbackToVersion,
    clearHistory,
    getCurrentVersion,
    deleteVersion,
    setCurrentVersionId
  };
};
