import axios from "axios";

const BASE = "/api/Accounts";

export const fetchMyShareInfo = async (accountId) => {
  const res = await axios.get(`${BASE}/my/${accountId}`, { withCredentials: true });
  return res.data.account;
};

export const joinAccountByCode = async (code) => {
  const res = await axios.post(`${BASE}/join`, { code }, { withCredentials: true });
  return res.data.account;
};

export const regenerateShareCode = async (accountId) => {
  const res = await axios.put(
    `${BASE}/${accountId}/regenerate-code`,
    {},
    { withCredentials: true }
  );
  return res.data.sharingCode;
};