import axios from "axios";

//const API_URL = import.meta.env.VITE_API_URL;
 
const Base="/api/accounts";

export const fetchDashboardData = async (accountId) => {
  const res = await axios.get(`${Base}/${accountId}/dashboard`);
  return res.data.dashboardData;
};