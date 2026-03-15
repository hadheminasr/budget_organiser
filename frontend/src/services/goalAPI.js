import axios from "axios";
const BASE = "/api/goals";

export const fetchGoals = async (accountId) => {
  const res = await axios.get(`${BASE}/${accountId}`, { withCredentials: true });
  return res.data.Goal;
};

export const addGoal = async (accountId, data) => {
  const res = await axios.post(`${BASE}/${accountId}`, data, { withCredentials: true });
  return res.data.createdGoal;
};

export const updateGoal = async (goalId, data) => {
  const res = await axios.put(`${BASE}/${goalId}`, data, { withCredentials: true });
  return res.data.updatedGoal;
};

export const deleteGoal = async (goalId) => {
  await axios.delete(`${BASE}/${goalId}`, { withCredentials: true });
};