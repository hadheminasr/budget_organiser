import axios from "axios";

const BASE = "/api/Accounts";

export const fetchReport = async (accountId) => {
  const res = await axios.get(
    `${BASE}/${accountId}/report`,
    { withCredentials: true }
  );
  return res.data.report;
};