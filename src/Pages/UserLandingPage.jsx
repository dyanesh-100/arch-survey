import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "../Components/LogoutButton";
import {ChevronLeft, ChevronRight} from 'lucide-react';

const UserLandingPage = () => {
  const { applications, userData } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isFirstRender = useRef(true);
  const applicationsPerPage = 6;
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

  const filteredByStatus = applications?.filter(app => 
    app.surveyStatus === "Survey started" || app.surveyStatus === "Survey completed"
  ) || [];
  const filteredApplications = filteredByStatus.filter(app => {
    const searchLower = searchQuery.toLowerCase();
    return (
      app.applicationName.toLowerCase().includes(searchLower) ||
      app.applicationId.toString().toLowerCase().includes(searchLower)
    );
  });
  useEffect(() => {
      const pageFromURL = parseInt(new URLSearchParams(location.search).get('page')) || 1;
      setCurrentPage(pageFromURL);
    }, [location.search]);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (searchQuery !== '') {
      setCurrentPage(1);
      navigate(`?page=1`);
    }
  }, [searchQuery]);
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;

  const currentApplications = filteredApplications.slice(
    indexOfFirstApplication,
    indexOfLastApplication
  );

  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`?page=${pageNumber}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-orange-100 p-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600">Survey Applications</h1>
          <LogoutButton />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-700 mb-6">
            Select an application to participate in the survey.
          </p>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by application name or ID..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); 
              }}
            />
          </div>
        
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentApplications.length > 0 ? (
                  currentApplications.map((app) => (
                    <tr 
                      key={app.applicationId} 
                      className="hover:bg-orange-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/survey/${app.uuid}?page=${currentPage}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.applicationId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{app.applicationName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{app.applicationDescription}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicationDepartment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.businessUnit}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      {filteredByStatus.length === 0 
                        ? "No surveys available at the moment. Please check back later." 
                        : "No applications match your search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredApplications.length > applicationsPerPage && (
            <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstApplication + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastApplication, filteredApplications.length)}
                </span>{' '}
                of <span className="font-medium">{filteredApplications.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserLandingPage;