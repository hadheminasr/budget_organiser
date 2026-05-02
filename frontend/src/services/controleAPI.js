import axios from "axios";

const BASE        = "/api/admin/BI/controle";
const ACCOUNTS    = "/api/Accounts";

export const fetchControle = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.badge)  params.append("badge",  filters.badge);
  if (filters.search) params.append("search", filters.search);

  const res = await axios.get(`${BASE}?${params}`, { withCredentials: true });
  return res.data.data;
};

// toggle bloquer/débloquer

export const toggleBlock = async (accountId, isCurrentlyBlocked) => {
  const res = await axios.put(
    `${ACCOUNTS}/${accountId}`,
    { isBlocked: !isCurrentlyBlocked }, 
    { withCredentials: true }
  );
  return res.data;
};

//supprimer un compte
export const deleteCompte = async (accountId) => {
  await axios.delete(
    `${ACCOUNTS}/${accountId}`,
    { withCredentials: true }
  );
};