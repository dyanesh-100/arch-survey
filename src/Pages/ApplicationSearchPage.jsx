import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationList from "../Components/ApplicationList";
import LogoutButton from "../Components/LogoutButton";
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import UploadButton from "../Components/UploadButton";
import axiosInstanceDirectus from "../axiosInstanceDirectus";

const ApplicationSearchPage = () => {
  const { applications, userData, setApplications } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { fetchApplications, fetchUserData } = useApiService();
  
  useEffect(() => {
    if (!userData || Object.keys(userData).length === 0) {
      fetchUserData();
    }
  }, [userData, fetchUserData]);
  
  useEffect(() => {
    fetchApplications(); 
  }, []);

  const handleDelete = async (applicationId) => {
    try {
      await axiosInstanceDirectus.delete(`/applications/${applicationId}`);
      setApplications(applications.filter(app => app.applicationId !== applicationId));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const filteredApplications = applications?.filter((application) => 
    application?.applicationName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <nav className="flex mb-8 justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Application Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and search your applications</p>
        </div>
        <div className="flex items-center space-x-4">
          <LogoutButton />
        </div>
      </nav>
      <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-8 justify-center">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-md"
          onClick={() => navigate("/responses")}
        >
          View Responses
        </button>
        <div className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-md">
          <UploadButton 
            label="Upload Applications" 
            navigateTo="/upload/applications"
          />
        </div>
        <div className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-md">
          <UploadButton 
            label="Upload Questions" 
            navigateTo="/upload/questions"
          />
        </div>
        
      </div>
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className=" text-center p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Welcome to Your Application Dashboard</h3>
            <p className="text-gray-500 mb-4">
                To get started, please import your application inventory using the "Upload Applications" button above.
                <br />
                After importing applications, you also want to upload your questions inventory.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full mx-auto">
          <input
            type="text"
            placeholder="Search applications..."
            className="p-3 w-full border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ApplicationList 
            applications={filteredApplications} 
            onSelect={(app) => navigate(`/survey/${app.uuid}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
    </div>
  );
};

export default ApplicationSearchPage;