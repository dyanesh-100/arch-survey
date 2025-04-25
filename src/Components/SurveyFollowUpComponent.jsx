import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import axios from 'axios';
import axiosInstanceDirectus from '../axiosInstanceDirectus';

const SurveyFollowUpComponent = ({ surveyResponseByAppId, applicationById }) => {
  const {stakeHoldersData,surveyStarted} = useGlobalContext();
  const { fetchUserDataByEmail,fetchStakeholdersDataByEmail } = useApiService();
  const [reminders, setReminders] = useState({});
  const [isLoading, setIsLoading] = useState(false);
    
  const formatDate = (dateString) => {
    if (!dateString) return null;
  
    let isoDate = dateString;
  
    if (typeof dateString === 'string') {
      if (dateString.includes(' ') && !dateString.includes('T')) {
        isoDate = dateString.replace(' ', 'T') + 'Z';
      } else if (!dateString.endsWith('Z') && dateString.includes('T')) {
        isoDate = dateString + 'Z';
      }
    }
    return DateTime.fromISO(isoDate, { zone: 'utc' })
      .setZone('Asia/Kolkata')
      .toFormat('dd MMM yyyy, hh:mm:ss a');
  };
  useEffect(() => {
    if (stakeHoldersData && stakeHoldersData.length > 0) {
      const initialReminders = {};
      stakeHoldersData.forEach(stakeholder => {
        if (stakeholder.reminderSentTime) {
          
          initialReminders[stakeholder.email] = new Date(formatDate(stakeholder.reminderSentTime));
        }
      });
      setReminders(initialReminders);
    }
  }, [stakeHoldersData]);
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

  const stakeholdersWithStatus = stakeholders.map(stakeholder => {
    let status = 'Yet to submit the response';
    if (surveyResponseByAppId) {
      const hasSubmitted = surveyResponseByAppId.some(
        response => response.emailId === stakeholder.email
      );
      if (hasSubmitted) {
        status = 'Submitted the response';
      }
    }

    let submittedOn = null;
    let updatedOn = null;
    if (status === 'Submitted the response') {
      const userResponse = surveyResponseByAppId.find(
        response => response.emailId === stakeholder.email
      );
      submittedOn = formatDate(userResponse?.createdOn);
      updatedOn = formatDate(userResponse?.updatedOn);
    }
    
    return {
      ...stakeholder,
      status,
      submittedOn,
      updatedOn
    };
  });

  const hasSubmittedResponses = stakeholdersWithStatus.some(
    stakeholder => stakeholder.status === 'Submitted the response'
  );

  
  const handleSendReminder = async (email) => {
    try {
      setIsLoading(true);
      const [stakeholdersData, userDataByEmail] = await Promise.all([
        fetchStakeholdersDataByEmail(email),
        fetchUserDataByEmail(email)
      ]);
      const recipientId = userDataByEmail[0].id;
      const stakeholderId = stakeholdersData[0].id;
      const timestamp = new Date();
      const notificationPayload = [{
        recipient: recipientId,
        subject: "Reminder: Your Feedback is Valuable to Us",
        message: "Hi there! We kindly remind you to participate in the survey...",
      }];
      const [notificationResponse] = await Promise.all([
        axios.post("http://localhost:8055/notifications", notificationPayload, {
          withCredentials: true
        }),
        axiosInstanceDirectus.patch(`/application_stakeholders/${stakeholderId}`, {
          reminderSentTime: timestamp.toISOString()
        })
      ]);
      
      setReminders(prev => ({ ...prev, [email]: timestamp }));
  
      return { success: true, timestamp };
    } catch (error) {
      console.error("Error sending reminder:", error);
      throw error; 
    }finally {
      setIsLoading(false);
    }
  };

  const TimeAgo = ({ date }) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
      if (!date) return;

      const updateTimeAgo = () => {
        const currentTime = new Date();
        const diffInSeconds = Math.floor((currentTime - new Date(date)) / 1000);
        
        let relativeTime;
        
        if (diffInSeconds < 60) {
          relativeTime = `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60);
          relativeTime = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600);
          relativeTime = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
          const days = Math.floor(diffInSeconds / 86400);
          relativeTime = `${days} day${days !== 1 ? 's' : ''} ago`;
        }
        setTimeAgo(relativeTime);
      };

      updateTimeAgo();
      const interval = setInterval(updateTimeAgo, 60000);
      return () => clearInterval(interval);
    }, [date]);

    return timeAgo ? <span className="ml-2 text-gray-500 text-xs">Reminder sent {timeAgo}</span> : null;
  };
  if(!surveyStarted){
    return(
      <div className='className="p-6 text-gray-500 text-center text-lg'>Survey not yet started.</div>
    )
  }
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Survey Follow-up</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stakeholder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {hasSubmittedResponses && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated On
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stakeholdersWithStatus.map((stakeholder, index) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stakeholder.status === 'Submitted the response' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {stakeholder.status}
                  </span>
                </td>
                {hasSubmittedResponses && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stakeholder.submittedOn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stakeholder.updatedOn || '-'}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stakeholder.status !== 'Submitted the response' && (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSendReminder(stakeholder.email)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                          reminders[stakeholder.email]
                            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? 'Sending...' : 
                        reminders[stakeholder.email] ? 'Send Again' : 'Send Reminder'}
                      </button>
                      {reminders[stakeholder.email] && (
                        <TimeAgo date={reminders[stakeholder.email]} />
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SurveyFollowUpComponent;