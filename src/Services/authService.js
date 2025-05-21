import axios from "axios";
import axiosInstanceDirectus from "../axiosInstanceDirectus";

const REFRESH_INTERVAL = 10 * 60 * 1000;

axios.defaults.withCredentials = true;

export const login = async (email, password) => {
  try {
    const response = await axiosInstanceDirectus.post(
      "/auth/login",
      {
        email,
        password,
        mode: "session",
      },
      { withCredentials: true }
    );
    const nextRefreshTime = Date.now() + REFRESH_INTERVAL;
    localStorage.setItem("next_refresh_time", nextRefreshTime.toString());
    localStorage.setItem("isAuthenticated", "true");
    startTokenRefresh();
    return response.data;
  } catch (error) {
    console.error("[ERROR] Login failed:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstanceDirectus.post("/auth/refresh", { mode: "session" });    
    const nextRefreshTime = Date.now() + REFRESH_INTERVAL;
    localStorage.setItem("next_refresh_time", nextRefreshTime.toString());
    
    return response.data;
  } catch (error) {
    console.error("[ERROR] Token refresh failed:", error);
    return null;
  }
};

export const startTokenRefresh = () => {
  if (window.refreshTimer) return; 
  const nextRefreshTime = localStorage.getItem("next_refresh_time");
  if (!nextRefreshTime) {
    return;
  }
  const timeUntilNextRefresh = Math.max(parseInt(nextRefreshTime, 10) - Date.now(), 0);

  const refreshLoop = async () => {
    if (!localStorage.getItem("next_refresh_time")) {
      return;
    }
    await refreshToken();
    setTimeout(refreshLoop, REFRESH_INTERVAL);
  };

  window.refreshTimer = setTimeout(refreshLoop, timeUntilNextRefresh);
};

export const logout = async () => {
  try {
    await axiosInstanceDirectus.post("/auth/logout", { mode: "session" });
    localStorage.removeItem("next_refresh_time");
    if (window.refreshTimer) {
      clearTimeout(window.refreshTimer);
      window.refreshTimer = null;
    }
  } catch (error) {
    console.error("[ERROR] Logout failed:", error);
  }
};
