import { create } from "zustand";
import api from "../lib/axios";

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,

  login: (user) => set({
    isAuthenticated: true,
    isCheckingAuth: false,
    user,
  }),

  logout: () => set({
    isAuthenticated: false,
    isCheckingAuth: false,
    user: null,
  }),

  checkAuth: async () => {
    try {
      const response = await api.get("/user/me");

      set({
        isAuthenticated: true,
        isCheckingAuth: false,
        user: response.data,
      });
    } catch {
      set({
        isAuthenticated: false,
        isCheckingAuth: false,
        user: null,
      });
    }
  },
}));