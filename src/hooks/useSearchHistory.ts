import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cleanexpress_search_history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook pour gérer l'historique de recherche
 */
export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  }, []);

  // Sauvegarder l'historique dans localStorage
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }, []);

  // Ajouter une recherche à l'historique
  const addToHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const trimmedQuery = query.trim().toLowerCase();
      const newHistory = [
        trimmedQuery,
        ...history.filter((item) => item !== trimmedQuery),
      ].slice(0, MAX_HISTORY_ITEMS);

      saveHistory(newHistory);
    },
    [history, saveHistory]
  );

  // Supprimer un élément de l'historique
  const removeFromHistory = useCallback(
    (query: string) => {
      const newHistory = history.filter((item) => item !== query);
      saveHistory(newHistory);
    },
    [history, saveHistory]
  );

  // Vider l'historique
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Obtenir les suggestions basées sur une query
  const getSuggestions = useCallback(
    (query: string, maxResults: number = 5): string[] => {
      if (!query.trim()) return history.slice(0, maxResults);

      const queryLower = query.trim().toLowerCase();
      return history
        .filter((item) => item.includes(queryLower))
        .slice(0, maxResults);
    },
    [history]
  );

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getSuggestions,
  };
};

