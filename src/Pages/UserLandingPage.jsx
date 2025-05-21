import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import { useNavigate } from 'react-router-dom';
import LogoutButton from "../Components/LogoutButton";
import { toast } from 'react-toastify';

const UserLandingPage = () => {
  const { applications, userData } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                {currentItems.length > 0 ? (
                  currentItems.map((app) => (
                    <tr 
                      key={app.applicationId} 
                      className="hover:bg-orange-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/survey/${app.uuid}`)}
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
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number + 1)}
                    className={`px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                      currentPage === number + 1
                        ? 'bg-orange-100 text-orange-600 border-orange-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserLandingPage;