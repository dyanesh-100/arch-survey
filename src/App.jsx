import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes,Navigate } from 'react-router-dom';
import { startTokenRefresh } from './Services/authService';
import { useGlobalContext } from "./Context/GlobalContext"; 
import SurveyPage from './Pages/SurveyPage';
import SurveyResponsePage from './Pages/SurveyResponsePage';
import ApplicationSearchPage from './Pages/ApplicationSearchPage';
import LoginPage from './Pages/LoginPage';
import InviteHandler from './Pages/InviteHandler';
import UserLandingPage from './Pages/UserLandingPage';
import DataUploadPage from './Pages/DataUploadPage';
import QuestionsPreviewPage from './Pages/QuestionsPreviewPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/invitehandler" element={<InviteHandler/>} />
        <Route path="/landingpage" element={
                    isAuthenticated ? (
                        role === ADMIN_UUID ? <ApplicationSearchPage /> : <UserLandingPage />
                    ) : <Navigate to="/" />
                } />
        <Route path="/survey/:applicationUUID" element={<SurveyPage />} />
        <Route path="/responses" element={<SurveyResponsePage />} />
        <Route path="/questionspreview" element={<QuestionsPreviewPage />} />
        <Route path="/upload/:uploadType" element={<DataUploadPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
