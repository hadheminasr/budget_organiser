import axios from "axios";

const BASE = "/api/Accounts";

export const fetchMyAccount = async (accountId) => {
  const res = await axios.get(`${BASE}/my/${accountId}`, { withCredentials: true });
  return res.data.account;
};

export const renameAccount = async (accountId, newName) => {
  await axios.put(
    `${BASE}/${accountId}`,
    { nameAccount: newName },
    { withCredentials: true }
  );
  const res = await axios.get(`${BASE}/my/${accountId}`, { withCredentials: true });
  return res.data.account;
};

export const removeMember = async (accountId, memberIdToRemove) => {
  await axios.delete(`${BASE}/${accountId}/members`, {
    data: { memberIdToRemove },
    withCredentials: true,
  });
};

export const deleteAccount = async (accountId) => {
  await axios.delete(`${BASE}/${accountId}`, { withCredentials: true });
};