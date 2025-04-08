import React, { useState, useEffect,useRef } from "react";
import SurveyQuestionsComponent from "../Components/SurveyQuestionsComponent";
import ApplicationMetaDataComponent from "../Components/ApplicationMetaDataComponent";
import { useParams } from "react-router-dom";
import TabNavigation from "../Components/TabNavigation";
import { useGlobalContext } from "../Context/GlobalContext"; 
import { useApiService } from "../Services/apiService";
import axiosInstanceDirectus from "../axiosInstanceDirectus";
import FallbackScreen from "../Components/FallBackScreen";
import ApplicationResponseComponent from "../Components/ApplicationResponseComponent";

const SurveyPage = () => {
  const { applicationUUID } = useParams();
  const {applicationById,selectedGroupIndex, setSelectedGroupIndex,loading,surveyData,userData,surveyResponseByUserId,surveyResponseByAppId,isSurveySubmitted, setIsSurveySubmitted} = useGlobalContext();
  const [responses, setResponses] = useState({});
  const surveyRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const {fetchUserData, fetchApplicationById, fetchSurveyData, fetchSurveyResponseByUserId,fetchSurveyResponseByAppId } = useApiService();
  
  useEffect(() => {
      if (!userData || Object.keys(userData).length === 0) {
        fetchUserData();
      }
    }, [userData, fetchUserData]);
  useEffect(() => {
    if (applicationUUID) {
      fetchApplicationById(applicationUUID);
    }
  }, [applicationUUID]);

  useEffect(() => {
    fetchSurveyData();
  }, []);
  const applicationId = applicationById?.applicationId || "";
  const userId = userData?.id || "";
  const userName = userData?.first_name || "";
  const role = JSON.stringify(userData?.tags || []);
  
  const surveyId = surveyData?.surveyId || "";
  useEffect(() => {
    if (surveyId && userId) {
      fetchSurveyResponseByUserId(surveyId, userId);
    }
  }, [surveyId, userId,isSurveySubmitted]);

  useEffect(() => {
    if (surveyId && applicationId) {
      fetchSurveyResponseByAppId(surveyId, applicationId);
    }
  }, [surveyId, applicationId,isSurveySubmitted]);

  
  useEffect(() => {
    if (Array.isArray(surveyResponseByAppId)) {
      const userResponse = surveyResponseByAppId.find(
        (response) => response.userId === userData.id
      );
      if (userResponse && userResponse.response) {
        const preFilledResponses = {};
        userResponse.response.forEach(({ fieldName, response, group }) => {
          if (!preFilledResponses[group]) {
            preFilledResponses[group] = {}; 
          }
          preFilledResponses[group][fieldName] = response;
        });
        setResponses(preFilledResponses);
      }
    }
  }, [surveyResponseByAppId, userData.id]);
  
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
        },
      }));
    }
  }, [applicationById]);  
  
  const handleResponseChange = (group, fieldName, value) => {
    if (fieldName === "q-2001") return; 
  
    setResponses((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [fieldName]: value, 
      },
    }));
  
    
  };
  
  // const validateResponses = () => {
  //   if (!surveyData || !surveyData.question_groups) return false;
  
  //   for (const group of surveyData.question_groups) {
  //     if (!responses[group.groupName]) return false;
  
  //     for (const question of group.questions) {
  //       if (!responses[group.groupName][question.fieldName]?.trim()) return false; 
  //     }
  //   }
  //   return true;
  // };
  const checkDuplicateResponse = (userId, appId) => {
    return surveyResponseByUserId?.some(response => response.userId === userId && response.appId === appId);
  };
  
  const handleSubmitSurvey = async () => {
    const allResponses = {
      General: {
        "q-2001": applicationById?.applicationName, 
        "q-2002": responses.General?.["q-2002"] || applicationById?.applicationDescription,
        "q-2003": responses.General?.["q-2003"] || applicationById?.applicationDepartment,
        "q-2004": responses.General?.["q-2004"] || applicationById?.businessOwner,
        "q-2005": responses.General?.["q-2005"] || applicationById?.itOwner,
        ...responses.General,
      },
      ...responses,
    };

    // if (!validateResponses()) {
    //   alert("Please answer all questions before submitting.");
    //   return;
    // }
    const formattedResponses = Object.entries(responses).flatMap(([group, fields]) =>
      Object.entries(fields).map(([fieldName, response]) => ({
        fieldName,
        response,
        group, 
      }))
    );
    try {
      if (checkDuplicateResponse(userData.id, applicationId)) {
        alert("You have already submitted this survey.");
        return;
      }      
      if (surveyResponseByAppId && surveyResponseByAppId.responseId != null && surveyResponseByAppId.userId === userData.userId) {
        await axiosInstanceDirectus.patch(`/survey_responses/${surveyResponseByAppId.responseId}`, {
          response: formattedResponses,
        });
      } 
      else {
              
        await axiosInstanceDirectus.post("/survey_responses", {
          appId :applicationId,
          responseId: crypto.randomUUID(),
          userId,
          userName, 
          role,
          surveyId, 
          response: formattedResponses 
        });
      }
      await axiosInstanceDirectus.patch(`/applications/${applicationId}`, {
      applicationDescription: responses.General?.app_description || applicationById?.applicationDescription,
      businessOwner: responses.General?.business_owner || applicationById?.businessOwner,
      businessUnit: responses.General?.business_unit || applicationById?.businessUnit,
      itOwner: responses.General?.it_owner || applicationById?.itOwner,
    });
      
      setIsSurveySubmitted(true);
      setIsEditing(false)
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };  
  const handleGroupChange = (index) => {
    setSelectedGroupIndex(index);
    setTimeout(() => {
      surveyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1);
  };
  if (loading) {
    return <div className="text-center text-gray-500 p-4">Loading survey...</div>;
  }
  const groupNames = surveyData ? surveyData.question_groups.map((group) => group.groupName) : [];
  const selectedGroup = surveyData ? surveyData.question_groups[selectedGroupIndex] : null;
  const groups = surveyData ? surveyData.question_groups : [];
  const isFirstGroup = selectedGroupIndex === 0;
  const isLastGroup = selectedGroupIndex === groups.length - 1;
  

  const userResponse = surveyResponseByAppId?.find(
    (response) => response.userId === userData.id
  );
  
  if (userResponse && !isEditing) {
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
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        onClick={() => (window.location.href = "/landingpage")}
      >
        <span className="mr-2">⬅</span> Back to Search
      </button>
      {applicationById && (
        <>
          <ApplicationMetaDataComponent application={applicationById} />
          {userData.role === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" ? (
            <ApplicationResponseComponent 
              surveyResponseByAppId = {surveyResponseByAppId}
              surveyData={surveyData}
            />
          ) : (
            <>
              <TabNavigation
                ref={surveyRef}
                groups={groupNames}
                selectedGroup={selectedGroup?.groupName}
                onSelectGroup={(group) =>
                  setSelectedGroupIndex(groupNames.indexOf(group))
                }
              />
              {selectedGroup && (
                <SurveyQuestionsComponent
                  ref={surveyRef}
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
