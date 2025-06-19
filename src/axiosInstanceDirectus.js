import axios from 'axios';

const axiosInstanceDirectus = axios.create({
    baseURL: 'http://localhost:8055',
    //http://144.24.137.92/directus
    //http://localhost:8055
    withCredentials: true, 
});
axiosInstanceDirectus.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem("next_refresh_time");
        if (window.refreshTimer) {
            clearTimeout(window.refreshTimer);
            window.refreshTimer = null;
        }
        localStorage.removeItem("isAuthenticated");
        window.location.href = "/"; 
      }
      if (error.response?.status === 403) {
        localStorage.removeItem("next_refresh_time");
        if (window.refreshTimer) {
            clearTimeout(window.refreshTimer);
            window.refreshTimer = null;
        }
        localStorage.removeItem("isAuthenticated");
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );


export default axiosInstanceDirectus;
