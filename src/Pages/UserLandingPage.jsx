import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import { useNavigate } from 'react-router-dom';
import ApplicationList from "../Components/ApplicationList";
import LogoutButton from "../Components/LogoutButton";

const UserLandingPage = () => {
  
  const { applications,userData } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { fetchApplications,fetchUserData } = useApiService();
  useEffect(() => {
      if (!userData || Object.keys(userData).length === 0) {
        fetchUserData();
      }
    }, [userData, fetchUserData]);
  useEffect(() => {
    fetchApplications(); 
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-orange-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-orange-600">Welcome to Our Survey!</h1>
          <LogoutButton />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-lg text-gray-700 mb-6">
            We value your feedback! Please select the application you want to attend the survey for from the list below.
          </p>
        </motion.div>

        <div className="mt-8">
          <ApplicationList 
            applications={applications}  
            onSelect={(app) => navigate(`/survey/${app.uuid}`)} 
          />
        </div>
      </div>
    </div>
  );
};

export default UserLandingPage;
