import axios from "axios";

const API = "http://localhost:5000/api/account-profile";

export const accountProfileAPI = {
  async getAccountProfile(accountId) {
    const { data } = await axios.get(`${API}/${accountId}`, {
      withCredentials: true,
    });
    return data;
  },

  async createAccountProfile(accountId, profileData) {
    const { data } = await axios.post(
      `${API}/${accountId}/first-login`,
      profileData,
      { withCredentials: true }
    );
    return data;
  },

  async updateAccountProfile(accountId, profileData) {
    const { data } = await axios.put(`${API}/${accountId}`, profileData, {
      withCredentials: true,
    });
    return data;
  },
};