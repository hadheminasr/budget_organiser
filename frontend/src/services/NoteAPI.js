import axios from "axios";
const BASE = "/api/notes";

export const fetchNotes = async (accountId) => {
  const res = await axios.get(`${BASE}/${accountId}`, { withCredentials: true });
  return res.data.notes;
};

export const addNote = async (accountId, data) => {
  const res = await axios.post(`${BASE}/${accountId}`, data, { withCredentials: true });
  return res.data.note;
};

export const markNoteDone = async (noteId) => {
  const res = await axios.put(`${BASE}/done/${noteId}`, {}, { withCredentials: true });
  return res.data.note;
};

export const deleteNote = async (noteId) => {
  await axios.delete(`${BASE}/${noteId}`, { withCredentials: true });
};

export const updateNote = async (noteId, data) => {
  const res = await axios.put(`${BASE}/${noteId}`, data, { withCredentials: true });
  return res.data.note;
};