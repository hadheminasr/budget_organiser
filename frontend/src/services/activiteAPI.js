import axios from "axios";

export const fetchActivite = async () => {
  const res = await axios.get(
    "/api/admin/BI/activite",
    { withCredentials: true }
  );
  return res.data.data;
};