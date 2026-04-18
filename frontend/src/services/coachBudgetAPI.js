import axios from "axios";

const API = "http://localhost:5000/api/coach-budget";

export const coachBudgetAPI = {
  async getCoachBudget(accountId) {
    const { data } = await axios.get(`${API}/${accountId}`, {
      withCredentials: true,
    });
    return data;
  },
};