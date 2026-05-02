// src/services/premiumAPI.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/premium-coach";

export const getPremiumCoach = async (accountId) => {
  if (!accountId) {
    throw new Error("accountId manquant");
  }

  const response = await axios.get(`${API_URL}/${accountId}`, {
    withCredentials: true,
  });

  return response.data;
};