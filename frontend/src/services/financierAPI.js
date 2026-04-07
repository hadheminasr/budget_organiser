import axios from "axios";

export const fetchFinancier = async () => {
  const res = await axios.get("/api/admin/BI/financier", { withCredentials: true });
  return res.data.data;
};