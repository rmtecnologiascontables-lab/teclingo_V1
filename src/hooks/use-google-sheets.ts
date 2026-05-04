import { useState, useCallback } from "react";
import { gapi, type GSheetUser, type GSheetItem, type GSheetStats } from "../lib/google-sheets";

const isConfigured = () => gapi.isConfigured();

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await gapi.getUsers();
    } catch (e) {
      setError((e as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (user: Omit<GSheetUser, "id" | "created_at">) => {
    setLoading(true);
    setError(null);
    try {
      return await gapi.createUser(user);
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gapi.uploadFile(file, "avatars");
      await gapi.updateUser(userId, { avatar_url: result.webViewLink });
      return result;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getItems = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await gapi.getItems(category);
    } catch (e) {
      setError((e as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadItemFile = useCallback(async (file: File, type: "images" | "audios") => {
    setLoading(true);
    setError(null);
    try {
      return await gapi.uploadFile(file, type);
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await gapi.getStats(userId);
    } catch (e) {
      setError((e as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const saveStats = useCallback(async (stats: Omit<GSheetStats, "id">) => {
    setLoading(true);
    setError(null);
    try {
      return await gapi.saveStats(stats);
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUsers,
    createUser,
    uploadAvatar,
    getItems,
    uploadItemFile,
    getStats,
    saveStats,
    isConfigured: isConfigured(),
  };
}