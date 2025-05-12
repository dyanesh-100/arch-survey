import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { fetchApplications, fetchUserData } = useApiService();
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 5;

  useEffect(() => {
    if (!userData || Object.keys(userData).length === 0) {
      fetchUserData();
    }
  }, [userData, fetchUserData]);
  
  useEffect(() => {
    fetchApplications(); 
  }, [location.pathname, location.search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
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

  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = filteredApplications.slice(
    indexOfFirstApplication,
    indexOfLastApplication
  );
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <nav className="flex mb-8 justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Application Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and search your applications</p>
        </div>
        <div className="flex gap-4 justify-center">
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
        <div className="flex items-center space-x-4">
          <LogoutButton />
        </div>
      </nav>
      <div className="flex flex-col items-center">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-center p-8">
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
              className="p-3 w-full border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="flex items-center justify-between bg-blue-50 text-blue-800 p-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="text-sm font-medium">Survey status updates automatically. Manual refresh may be needed occasionally.</span>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center"
              >
                Refresh now
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>

            <ApplicationList 
              applications={currentApplications} 
              onSelect={(app) => navigate(`/survey/${app.uuid}`)}
              onDelete={handleDelete}
            />

            {filteredApplications.length > applicationsPerPage && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                      currentPage === number
                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationSearchPage;