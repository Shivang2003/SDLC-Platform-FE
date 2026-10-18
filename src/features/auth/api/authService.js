
import api from "../../../lib/axios";

export const loginUser = async (credentials) => {
  const response = await api.post("/public/login", credentials);
  return response.data;
};

export const signupUser = async (userData) => {
  const response = await api.post("/public/sign-up", userData);
  return response.data;
};
