
import axios from "axios";
const BASE = "/api/categories";

export const fetchCategories = async (accountId) => {
  const res = await axios.get(`${BASE}/${accountId}`, { withCredentials: true });
  return res.data.Categories; // ← majuscule comme ton backend
};

export const addCategory = async (accountId, data) => {
  const res = await axios.post(`${BASE}/${accountId}`, data, { withCredentials: true });
  return res.data.category;
};

export const updateCategory = async (categoryId, data) => {
  const res = await axios.put(`${BASE}/${categoryId}`, data, { withCredentials: true });
  return res.data.Category;
};

export const deleteCategory = async (categoryId) => {
  await axios.delete(`${BASE}/${categoryId}`, { withCredentials: true });
};