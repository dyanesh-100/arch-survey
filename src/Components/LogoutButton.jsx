import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../Services/authService"; 


const LogoutButton = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout(); 
    window.location.href = "/";
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("next_refresh_time");
  };

  return (
    <button 
      onClick={handleLogout} 
      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
