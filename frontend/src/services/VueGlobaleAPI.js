import axios from "axios";

const BASE = "http://localhost:5000/api/admin/BI/VueGlobale";

export const fetchVueGlobale = async () => {
  const res = await axios.get(BASE, {
    withCredentials: true,
  });

  return res.data?.data;
};