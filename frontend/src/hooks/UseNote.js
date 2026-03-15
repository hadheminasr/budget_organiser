import { useState, useEffect } from "react";
import { fetchNotes } from "../services/NoteAPI";
import { useAuth } from "../context/AuthContext";

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user?.accountId) { setLoading(false); return; }
    fetchNotes(user.accountId)
      .then(setNotes)
      .catch(err => setError(err.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, [user?.accountId]);

  return { notes, setNotes, loading, error };
};