import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import LogoutButton from "../Components/LogoutButton";
import SurveyStatus from "../Components/SurveyStatus"
import UploadButton from "../Components/UploadButton";
import axiosInstanceDirectus from "../axiosInstanceDirectus";
import { Plus, ChevronLeft, ChevronRight, Trash2, Search, Check } from 'lucide-react';
import ConfirmToast from "../Components/ConfirmToast";
import { toast } from "react-toastify";

const ApplicationSearchPage = () => {
  const { applications, userData, setApplications } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchApplications, fetchUserData } = useApiService();
  const [currentPage, setCurrentPage] = useState(1);
  const isFirstRender = useRef(true);
  const applicationsPerPage = 6;
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const columnSelectorRef = useRef(null);

  const defaultColumns = [
    { key: 'applicationId', label: 'Application ID' },
    { key: 'applicationName', label: 'Application Name' },
    { key: 'applicationDescription', label: 'Application Description' },
    { key: 'applicationDepartment', label: 'Department' },
    { key: 'businessUnit', label: 'Business Unit' }
  ];
  const actionColumns = [
    { key: 'surveyStatus', label: 'Survey Status' },
    { key: 'actions', label: 'Actions' }
  ];
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const savedColumns = localStorage.getItem('selectedApplicationColumns');
    return savedColumns ? JSON.parse(savedColumns) : defaultColumns.map(col => col.key);
  });

  const [availableColumns, setAvailableColumns] = useState([]);
  useEffect(() => {
    const newPage = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    setCurrentPage(newPage);
  }, [location.search]);
  useEffect(() => {
    localStorage.setItem('selectedApplicationColumns', JSON.stringify(selectedColumns));
  }, [selectedColumns]);

  useEffect(() => {
    if (!userData || Object.keys(userData).length === 0) {
      fetchUserData();
    }
  }, [userData, fetchUserData]);
  
  useEffect(() => {
    fetchApplications(); 

  }, [applications]);
  useEffect(() => {
    if (applications.length > 0) {
      const allKeys = new Set();
      defaultColumns.forEach(col => allKeys.add(col.key));
      
      applications.forEach(app => {
        Object.keys(app).forEach(key => {
          if (![...defaultColumns, ...actionColumns].some(col => col.key === key) && 
               key !== 'survey_responses' && 
              key !== 'application_stakeholders' && 
              key !== 'unMappedCMDBFields' && 
              key !== 'uuid') {
            allKeys.add(key);
          }
        });
        if (app.unMappedCMDBFields && typeof app.unMappedCMDBFields === 'object') {
          Object.keys(app.unMappedCMDBFields).forEach(key => {
            allKeys.add(`unMappedCMDBFields.${key}`);
          });
        }
      });
      
      const newAvailableColumns = Array.from(allKeys).map(key => {
        const defaultCol = defaultColumns.find(col => col.key === key);
        return {
          key,
          label: defaultCol ? defaultCol.label : 
                 key.includes('unMappedCMDBFields.') 
                   ? key.replace('unMappedCMDBFields.', '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                   : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        };
      });
      
      setAvailableColumns(newAvailableColumns);
    }
  }, [applications]);

  const handleDelete = async (applicationId, e) => {
    e.stopPropagation();
    try {
      await axiosInstanceDirectus.delete(`/items/applications/${applicationId}`);
      const updatedApplications = applications.filter(app => app.applicationId !== applicationId);
      setApplications(updatedApplications);
      const updatedFiltered = updatedApplications.filter(app => 
        app.applicationName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const maxPage = Math.ceil(updatedFiltered.length / applicationsPerPage);
      if (currentPage > maxPage) {
        const newPage = Math.max(1, maxPage);
        setCurrentPage(newPage);
        navigate(`?page=${newPage}`);
      }
      toast.success(`Application ${applicationId} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete application: ${error.message}`);
      console.error("Error deleting application:", error);
    }
  };

  const toggleColumn = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const filteredApplications = applications?.filter((application) => 
    application?.applicationName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredAvailableColumns = availableColumns.filter(column => 
    column.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
  );
  

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
  useEffect(() => {
    if (filteredApplications.length > 0) {
      const maxPage = Math.ceil(filteredApplications.length / applicationsPerPage);
      if (currentPage > maxPage) {
        const newPage = Math.max(1, maxPage);
        setCurrentPage(newPage);
        navigate(`?page=${newPage}`);
      }
    }
  }, [filteredApplications.length, currentPage, navigate]);
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target)) {
            setShowColumnSelector(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-md"
            onClick={() => navigate("/questionspreview")}
          >
            Preview questions
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            <div className="w-full mx-auto bg-white rounded-lg shadow-sm border border-gray-200 relative">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="p-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="relative" ref={columnSelectorRef}>
                  <button 
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Columns</span>
                  </button>
                  {showColumnSelector && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1" style={{ top: '100%' }}>
                      <div className=" top-0 bg-white px-3 py-2 border-b border-gray-200">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search columns..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={columnSearchQuery}
                            onChange={(e) => setColumnSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-96">
                        <div className="px-3 py-2 text-xs text-gray-500 uppercase font-medium">Available Columns</div>
                          {filteredAvailableColumns.map(column => (
                            <button
                              key={column.key}
                              onClick={() => toggleColumn(column.key)}
                              className={`flex items-center w-full text-left px-4 py-2 text-sm ${selectedColumns.includes(column.key) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                              <span className={`inline-flex items-center justify-center w-4 h-4 mr-2 border rounded ${selectedColumns.includes(column.key) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                {selectedColumns.includes(column.key) && <Check className="w-3 h-3" />}
                              </span>
                              {column.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
          
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {defaultColumns
                        .filter(column => selectedColumns.includes(column.key))
                        .map(column => (
                          <th 
                            key={column.key}
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column.label}
                          </th>
                        ))}
                      {selectedColumns
                        .filter(col => !defaultColumns.some(c => c.key === col))
                        .map(columnKey => {
                          const column = availableColumns.find(col => col.key === columnKey);
                          let displayLabel = column?.label || columnKey;
                          
                          if (columnKey.startsWith('unMappedCMDBFields.')) {
                            displayLabel = columnKey.replace('unMappedCMDBFields.', '')
                              .replace(/_/g, ' ')
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase());
                          }

                          return (
                            <th 
                              key={columnKey}
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {displayLabel}
                            </th>
                          );
                        })}
                      {actionColumns.map(column => (
                        <th 
                          key={column.key}
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentApplications.map((application) => (
                      <tr 
                        key={application.applicationId} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/survey/${application.uuid}?page=${currentPage}`)}

                      >
                        {defaultColumns
                          .filter(column => selectedColumns.includes(column.key))
                          .map(column => (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{application[column.key] || '-'}</div>
                            </td>
                          ))}
                        {selectedColumns
                          .filter(col => !defaultColumns.some(c => c.key === col))
                          .map(columnKey => {
                            if (columnKey.startsWith('unMappedCMDBFields.')) {
                              const fieldName = columnKey.replace('unMappedCMDBFields.', '');
                              return (
                                <td key={columnKey} className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {application.unMappedCMDBFields?.[fieldName] || '-'}
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td key={columnKey} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{application[columnKey] || '-'}</div>
                              </td>
                            );
                          })}
                        <td className="px-6 py-4 whitespace-nowrap">
                              <SurveyStatus application={application} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              ConfirmToast(
                                `Do you want to delete application ${application.applicationId}?`, 
                                () => handleDelete(application.applicationId, e)
                              );
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="Delete application"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredApplications.length > 0 && (
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationSearchPage;