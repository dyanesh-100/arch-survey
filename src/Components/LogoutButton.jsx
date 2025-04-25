import React from "react";
import { logout } from "../Services/authService"; 

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await logout(); 
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("next_refresh_time");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <button 
      onClick={handleLogout} 
      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
