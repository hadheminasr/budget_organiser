import { useEffect, useState, useCallback } from "react";
import { accountProfileAPI } from "../services/accountProfileAPI";

export function useAccountProfile(accountId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!accountId) return;

    setLoading(true);
    setError("");

    try {
      const res = await accountProfileAPI.getAccountProfile(accountId);
      setProfile(res.profile ?? null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Erreur lors de la récupération du profil du compte"
      );
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const createProfile = async (profileData) => {
    if (!accountId) return null;

    setLoading(true);
    setError("");

    try {
      const res = await accountProfileAPI.createAccountProfile(
        accountId,
        profileData
      );
      setProfile(res.profile ?? null);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Erreur lors de la création du profil du compte";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    if (!accountId) return null;

    setLoading(true);
    setError("");

    try {
      const res = await accountProfileAPI.updateAccountProfile(
        accountId,
        profileData
      );
      setProfile(res.profile ?? null);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Erreur lors de la mise à jour du profil du compte";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
  };
}