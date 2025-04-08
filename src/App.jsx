import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes,Navigate } from 'react-router-dom';
import SurveyPage from './Pages/SurveyPage';
import SurveyResponsePage from './Pages/SurveyResponsePage';
import ApplicationSearchPage from './Pages/ApplicationSearchPage';
import ConfigurationPage from './Pages/ConfigurationPage';
import LoginPage from './Pages/LoginPage';
import { startTokenRefresh } from './Services/authService';
import { useGlobalContext } from "./context/GlobalContext"; 
import UserLandingPage from './Pages/UserLandingPage';
const ADMIN_UUID = "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f";
const App = () => {
  const [role, setRole] = useState(null);
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const {userData} = useGlobalContext();
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {  
      setRole(userData.role)
      startTokenRefresh();
    }
  }, [userData]);
  
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/landingpage" element={
                    isAuthenticated ? (
                        role === ADMIN_UUID ? <ApplicationSearchPage /> : <UserLandingPage />
                    ) : <Navigate to="/" />
                } />
        <Route path="/survey/:applicationUUID" element={<SurveyPage />} />
        <Route path="/responses" element={<SurveyResponsePage />} />
        <Route path="/fieldmapping" element={<ConfigurationPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
