import React, { useState, useEffect,useRef } from "react";
import { useMemo } from 'react';
import SurveyQuestionsComponent from "../Components/SurveyQuestionsComponent";
import ApplicationMetaDataComponent from "../Components/ApplicationMetaDataComponent";
import { useParams,useNavigate, useLocation} from "react-router-dom";
import TabNavigation from "../Components/TabNavigation";
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import axiosInstanceDirectus from "../axiosInstanceDirectus";
import FallbackScreen from "../Components/FallBackScreen";
import ApplicationResponseComponent from "../Components/ApplicationResponseComponent";
import SurveyInitializingComponent from "../Components/SurveyInitializingComponent";
import SurveyFollowUpComponent from "../Components/SurveyFollowUpComponent";
import { toast } from "react-toastify";

const SurveyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationUUID } = useParams();
  const {surveyStarted,applicationById,selectedGroupIndex, setSelectedGroupIndex,loading,surveyData,userData,surveyResponseByUserId,surveyResponseByAppId,isSurveySubmitted, setIsSurveySubmitted,setIsFinalResponseSubmitted,isFinalResponseSubmitted,currentPage} = useGlobalContext();
  const [responses, setResponses] = useState({});
  const [resolvedAppId, setResolvedAppId] = useState("");
  const surveyRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [consolidatedResponses, setConsolidatedResponses] = useState([]);
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || 1;
  const [selectedTab, setSelectedTab] = useState("Stakeholders"); 
  const {fetchUserData, fetchApplicationById, fetchSurveyData, fetchSurveyResponseByUserId,fetchSurveyResponseByAppId,fetchStakeholdersDataByApp } = useApiService();
  const surveyId = surveyData?.surveyId || "";
  const {
    applicationId,
    userId,
    userName,
    emailId,
    role
  } = useMemo(() => {
    const appId = applicationById?.applicationId || '';
    const uId = userData?.id || '';
    const email = userData?.email || '';
    const name = email.split('@')[0] || '';

    const derivedRole = email === applicationById?.businessOwner
      ? 'Business Owner'
      : email === applicationById?.itOwner
      ? 'IT Owner'
      : email === applicationById?.engineeringOwner
      ? 'Engineering Owner'
      : 'Unknown Role';

    return {
      applicationId: appId,
      userId: uId,
      userName: name,
      emailId: email,
      role: derivedRole
    };
  }, [applicationById, userData]);
  useEffect(() => {
    if (applicationId) {
      setResolvedAppId(applicationId);
    }
  }, [applicationId]);
  useEffect(() => {
    const initializeData = async () => {
      
      const promises = [];

      if (!userData || Object.keys(userData).length === 0) {
        promises.push(fetchUserData());
      }

      promises.push(fetchSurveyData());

      try {
        await Promise.all(promises);
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (applicationUUID) {
      fetchApplicationById(applicationUUID);
    }
  }, [applicationUUID,isSurveySubmitted,surveyStarted]);

  useEffect(() => {
    if (surveyId && userId) {
      fetchSurveyResponseByUserId(surveyId, userId);
    }
  }, [isSurveySubmitted, surveyId, userId,applicationUUID]);
  useEffect(() => {
      if (resolvedAppId && surveyId) {
        fetchSurveyResponseByAppId(surveyId, applicationId);
      }
  }, [isSurveySubmitted, resolvedAppId,applicationUUID]);

  useEffect(() => {
    if (applicationId) {
      fetchStakeholdersDataByApp(applicationId);
    }
  }, [applicationId]);
        
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Array.isArray(surveyResponseByAppId)) {
        const userResponse = surveyResponseByAppId.find(
          (response) => response.userId === userData.id
        ); 
        if (userResponse && userResponse.response) {
          const preFilledResponses = {};
          userResponse.response.forEach(({ evaluation_parameter, response, group }) => {
            if (!preFilledResponses[group]) {
              preFilledResponses[group] = {}; 
            }
            preFilledResponses[group][evaluation_parameter] = response;
          });
          setResponses(preFilledResponses);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [surveyResponseByAppId, applicationUUID]);
  
  useEffect(() => {
    if (applicationById) {
      setResponses((prev) => ({
        ...prev,
        General: {
          ...prev.General,
          "app_name": applicationById.applicationName,
          "app_description": prev.General?.["q-2002"] ?? applicationById.applicationDescription,
          "business_unit": prev.General?.["q-2003"] ?? applicationById.businessUnit,
          "business_owner": prev.General?.["q-2004"] ?? applicationById.businessOwner,
          "it_owner": prev.General?.["q-2005"] ?? applicationById.itOwner,
          "engineering_owner": prev.General?.["q-2006"] ?? applicationById.engineeringOwner,
        },
      }));
    }
  }, [applicationById]);  
  
const handleResponseChange = (group, evaluation_parameter, value) => {
  if (evaluation_parameter === "q-2001") return;  
  setResponses((prev) => ({
    ...prev,
    [group]: {
      ...(prev[group] || {}),
      [evaluation_parameter]: value, 
    },
  }));
};
  // const validateResponses = () => {
  //   if (!surveyData || !surveyData.question_groups) return false;
  
  //   for (const group of surveyData.question_groups) {
  //     if (!responses[group.groupName]) return false;
  
  //     for (const question of group.questions) {
  //       if (!responses[group.groupName][question.evaluation_parameter]?.trim()) return false; 
  //     }
  //   }
  //   return true;
  // };

  const userResponseOfspecificApp = surveyResponseByAppId.find(
    (response) => response.userId === userData.id
  ); 
  const responseId = userResponseOfspecificApp?.responseId;
  const handleSubmitSurvey = async () => {
    const allResponses = {
      General: {
        "q-2001": applicationById?.applicationName, 
        "q-2002": responses.General?.["q-2002"] || applicationById?.applicationDescription,
        "q-2003": responses.General?.["q-2003"] || applicationById?.applicationDepartment,
        "q-2004": responses.General?.["q-2004"] || applicationById?.businessOwner,
        "q-2005": responses.General?.["q-2005"] || applicationById?.itOwner,
        "q-2006": responses.General?.["q-2006"] || applicationById?.engineeringOwner,
        ...responses.General,
      },
      ...responses,
    };
    // if (!validateResponses()) {
    //   alert("Please answer all questions before submitting.");
    //   return;
    // }
    const formattedResponses = Object.entries(responses).flatMap(([group, fields]) =>
      Object.entries(fields).map(([evaluation_parameter, response]) => ({
        evaluation_parameter,
        response,
        group, 
      }))
    );
    try {  
      if (surveyResponseByAppId?.length > 0 && surveyResponseByUserId[0]?.responseId && userResponseOfspecificApp !== undefined) {
        await axiosInstanceDirectus.patch(`/items/survey_responses/${responseId}`, {
          response: formattedResponses,
        });
      } 
      else if (surveyResponseByUserId?.some(response => response.userId === userData.id && response.appId === applicationId)) {
        toast.info('You have already submitted this survey', {
          autoClose: 4000
        });
        return;
      }
      else {     
        await axiosInstanceDirectus.post("/items/survey_responses", {
          appId :applicationId,
          responseId: crypto.randomUUID(),
          userId,
          userName,
          role, 
          emailId,
          surveyId, 
          response: formattedResponses 
        });
      }
      await axiosInstanceDirectus.patch(`/items/applications/${applicationId}`, {
      applicationDescription: responses.General?.app_description || applicationById?.applicationDescription,
      businessOwner: responses.General?.business_owner || applicationById?.businessOwner,
      businessUnit: responses.General?.business_unit || applicationById?.businessUnit,
      itOwner: responses.General?.it_owner || applicationById?.itOwner,
      engineeringOwner: responses.General?.engineering_owner || applicationById?.engineeringOwner
    });
      
      setIsSurveySubmitted(true);
      setIsEditing(false)
    } catch (error) {
        console.error('Operation failed:', error);
        toast.error(
          typeof error === 'string' ? error : 
          error.message || 'An unexpected error occurred',
          { autoClose: 6000 }
        );
      }
  };  
  const handleAdminSubmit = async () => {
    try {
      let action;
      const adminResponseId = surveyResponseByAppId.find(item => item.role === "Admin")?.responseId;
      if (surveyResponseByAppId?.length > 0 && userData.role === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" &&
        (isFinalResponseSubmitted || adminResponseId !== undefined)) {
        await axiosInstanceDirectus.patch(`/items/survey_responses/${adminResponseId}`, {
          response: consolidatedResponses,
          userId,
          userName,
          role: "Admin", 
          emailId
        });
        action = "updated";
      } else {
        await axiosInstanceDirectus.post("/items/survey_responses", {
          appId: applicationId,
          responseId: crypto.randomUUID(),
          userId,
          userName,
          role: "Admin",
          emailId,
          surveyId,
          response: consolidatedResponses
        });
        await axiosInstanceDirectus.patch(
          `/items/applications/${applicationById.applicationId}`,
          { surveyStatus: "Survey completed" }
        );
        action = "submitted";
        setIsFinalResponseSubmitted(true); 
      }
      toast.success(`Responses ${action} successfully!`);
    } catch (error) {
      console.error('Failed to submit consolidated responses:', error);
      toast.error(
        `Failed to submit responses: ${error.response?.data?.message || error.message || 'Please try again'}`,
        { autoClose: 6000 }
      );
    }
  };
  if (loading) {
    return <div className="text-center text-gray-500 p-4">Loading survey...</div>;
  }
  const handleGroupChange = (index) => {
    setSelectedGroupIndex(index);
    setTimeout(() => {
      surveyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1);
  };
  
  const getFilteredGroups = (groups, role) => {
    switch (role) {
      case 'Business Owner':
        return groups.filter(group => 
          ['Business', 'Risk', 'General', 'Cost','Technical'].includes(group.groupName))
      case 'IT Owner':
        return groups.filter(group => 
          ['Business', 'Risk', 'General', 'Cost','Technical'].includes(group.groupName))
      case 'Engineering Owner':
        return groups.filter(group => 
          ['Business', 'Risk', 'General', 'Cost','Technical'].includes(group.groupName))
      default:
        return [];
    }
  };
  
  const groups = surveyData ? surveyData.question_groups : [];
  const filteredGroups = getFilteredGroups(groups, role);
  const filteredGroupNames = filteredGroups.map(group => group.groupName);
  const selectedGroup = filteredGroups[selectedGroupIndex] || null;
  const isFirstGroup = selectedGroupIndex === 0;
  const isLastGroup = selectedGroupIndex === filteredGroups.length - 1;
  const userResponse = surveyResponseByAppId?.find(
    (response) => response.userId === userData.id
  );

  if (userResponse && !isEditing && userData.role != "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f") {
    return (
      <FallbackScreen
        message="You have successfully submitted your survey!"
        imageSrc="/submitted.webp"
        buttonText="Edit Your Response"
        onButtonClick={() => {
          setIsEditing(true);
        }}
      />
    );
  }
  
  return (
    <div className="h-screen bg-gray-100 p-6 overflow-auto">
      <button
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
        onClick={() => {
          navigate(`/landingpage?page=${page}`);
        }}
      >
        <span className="mr-2">⬅</span> Back to Search
      </button>
      {applicationById && (
        <>
          <ApplicationMetaDataComponent application={applicationById} />
          <TabNavigation
            ref={surveyRef}
            groups={userData.role === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" 
              ? ["Stakeholders","Survey Follow-up", "Survey Response"] 
              : filteredGroupNames}
            selectedGroup={userData.role === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" 
              ? selectedTab 
              : selectedGroup?.groupName}
            onSelectGroup={(group) => {
              if (userData.role === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f") {
                setSelectedTab(group);
              } else {
                setSelectedGroupIndex(filteredGroups.findIndex(g => g.groupName === group));
              }
            }}
          />
          {userData.role === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" ? (
            <>
              {selectedTab === "Stakeholders" && (
                <SurveyInitializingComponent
                  applicationById={applicationById}
                />
              )}
              {selectedTab === "Survey Follow-up"  && (
                <SurveyFollowUpComponent
                  surveyResponseByAppId={surveyResponseByAppId}
                  applicationById={applicationById}
                />
              )}
              {selectedTab === "Survey Response" && (
                <ApplicationResponseComponent 
                  surveyResponseByAppId={surveyResponseByAppId}
                  surveyData={surveyData}
                  onConsolidatedResponsesChange={setConsolidatedResponses}
                  handleSubmit={handleAdminSubmit}
                />
              )}
            </>
          ) : (
            <>
              {selectedGroup && (
                <SurveyQuestionsComponent
                  group={selectedGroup.groupName}
                  questions={selectedGroup.questions}
                  responses={responses}
                  applicationById={applicationById}
                  onResponseChange={handleResponseChange}
                />
              )}
              <div className="mt-6 flex justify-between">
                <button
                  className={`p-3 rounded ${
                      isFirstGroup
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 text-white"
                  }`}
                  onClick={() =>
                      handleGroupChange(Math.max(selectedGroupIndex - 1, 0))
                  }
                  disabled={isFirstGroup}
                >
                  Previous
                </button>
                {isLastGroup ? (
                  <button
                      className="bg-green-500 text-white p-3 rounded"
                      onClick={handleSubmitSurvey}
                  >
                      {userResponse ? "Update Survey" : "Submit Survey"}
                  </button>
                  ) : (
                  <button
                      className="bg-blue-500 text-white p-3 rounded"
                      onClick={() => handleGroupChange(selectedGroupIndex + 1)}
                  >
                      Next
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
export default SurveyPage;
