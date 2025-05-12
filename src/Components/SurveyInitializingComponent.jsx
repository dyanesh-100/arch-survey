import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstanceDirectus from '../axiosInstanceDirectus';
import { useGlobalContext } from "../Context/GlobalContext"; 

const SurveyInitializingComponent = ({ applicationById }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {surveyStarted, setSurveyStarted} = useGlobalContext();
  const INVITE_ROLE_ID = '2f0727be-af3d-46f3-b576-0077ef74770b';
  const INVITE_URL = "http://localhost:5173/invitehandler"  
  useEffect(() => {
      if(applicationById.surveyStatus === 'Survey started'|| applicationById.surveyStatus === 'Survey completed')
        setSurveyStarted(true);
  }, [applicationById.surveyStatus]);
  useEffect(() => {
      if(applicationById.surveyStatus === 'Survey not yet started')
        setSurveyStarted(false);
  }, [applicationById.surveyStatus]);
  const stakeholders = [
    {
      name: applicationById.businessOwner.split('@')[0],
      role: 'Business Owner',
      email: applicationById.businessOwner
    },
    {
      name: applicationById.itOwner.split('@')[0],
      role: 'IT Owner',
      email: applicationById.itOwner
    },
    {
      name: applicationById.engineeringOwner.split('@')[0],
      role: 'Engineering Owner',
      email: applicationById.engineeringOwner
    }
  ];
  
  const handleStartSurvey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const existingUsersRes = await axios.get('http://localhost:8055/users', {
        withCredentials: true
      });
      const existingEmails = existingUsersRes.data?.data?.map(user => user.email);
      const newStakeholders = stakeholders.filter(stakeholder =>
        !existingEmails.includes(stakeholder.email)
      );
      for (const stakeholder of newStakeholders) {
        await axios.post(
          'http://localhost:8055/users/invite',
          {
            email: stakeholder.email,
            role: INVITE_ROLE_ID,
            invite_url: INVITE_URL
          }
        );
      }
      await axiosInstanceDirectus.patch(
        `/applications/${applicationById.applicationId}`,
        {
          surveyStatus: 'Survey started'
        }
      );
      setSurveyStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start survey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Stakeholders</h2>
      
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stakeholder Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stakeholders.map((stakeholder, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stakeholder.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stakeholder.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stakeholder.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-start space-y-4">
        {surveyStarted ? (
          <p className="text-sm font-medium text-green-600">
            Survey started successfully!
          </p>
        ) : (
          <>
            <button
              onClick={handleStartSurvey}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Start Survey'
              )}
            </button>
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SurveyInitializingComponent;