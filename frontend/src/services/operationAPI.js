import axios from "axios";
const BASE = "/api/operations";

export const fetchOperations = async (accountId) => {
  const res = await axios.get(`${BASE}/${accountId}`, { withCredentials: true });
  return res.data.operations;
};

export const addOperation = async (accountId, data) => {
  const res = await axios.post(`${BASE}/${accountId}`, data, { withCredentials: true });
  return res.data.operation;
};

export const updateOperation = async (operationId, data) => {
  const res = await axios.put(`${BASE}/${operationId}`, data, { withCredentials: true });
  return res.data.operation;
};

export const deleteOperation = async (operationId) => {
  await axios.delete(`${BASE}/${operationId}`, { withCredentials: true });
};