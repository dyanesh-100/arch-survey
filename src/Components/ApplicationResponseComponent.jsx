import { useState, useEffect, useCallback } from "react";
import IndividualUserResponseTable from "./IndividualUserResponseTable";
import ConsolidatedUserResponsesTable from "./ConsolidatedUserResponsesTable";
import { useGlobalContext } from "../Context/GlobalContext"; 

const ApplicationResponseComponent = ({ 
  surveyData, 
  surveyResponseByAppId,
  onConsolidatedResponsesChange,
  handleSubmit
}) => {
  const [deletedResponses, setDeletedResponses] = useState({});
  const {surveyStarted} = useGlobalContext();
  const [addedResponses, setAddedResponses] = useState({});
  const formatResponse = (response) => {
    if (Array.isArray(response)) {
      return response.join(", ");
    }
    return response || "N/A";
  };
  const updateConsolidatedResponses = useCallback(() => {
    const groupedResponses = {};
    const adminResponse = surveyResponseByAppId.find(item => item.role === "Admin");
    
    // If admin response exists, use only that
    if (adminResponse) {
      adminResponse.response.forEach(({ evaluation_parameter, response: responseValue }) => {
        if (!groupedResponses[evaluation_parameter]) {
          groupedResponses[evaluation_parameter] = [];
        }
        groupedResponses[evaluation_parameter].push({ response: responseValue });
      });
    } else {
      // Otherwise, collect all non-admin responses as before
      surveyResponseByAppId.forEach(({ role, response }) => {
        if (role !== "Admin") {
          response.forEach(({ group, evaluation_parameter, response: responseValue }) => {
            if (group !== "General") {
              if (!groupedResponses[evaluation_parameter]) {
                groupedResponses[evaluation_parameter] = [];
              }
              groupedResponses[evaluation_parameter].push({ response: responseValue });
            }
          });
        }
      });
    }
    
    const finalResponses = [];
    const evaluationParameters = surveyData?.question_groups?.flatMap((group) =>
      group?.questions?.map((question) => question?.evaluation_parameter).filter(Boolean)
    ) || [];

    evaluationParameters.forEach(evaluation_parameter => {
      const originalResponses = groupedResponses[evaluation_parameter] || [];
      const added = addedResponses[evaluation_parameter] || [];
      const formattedAdded = added.map(response => ({ response }));
      const combinedResponses = [...originalResponses, ...formattedAdded];
      const filteredResponses = combinedResponses.filter(resp => {
        const formatted = formatResponse(resp.response);
        return !deletedResponses[`${evaluation_parameter}_${formatted}`];
      });
      const question = surveyData.question_groups.flatMap(
        group => group.questions
      ).find(q => q.evaluation_parameter === evaluation_parameter);
      
      const fieldType = question?.response_type;
      const options = question?.options || [];
      
      if (filteredResponses.length === 0 && added.length > 0) {
        const lastAdded = added[added.length - 1];
        finalResponses.push({
          evaluation_parameter,
          response: lastAdded
        });
        return;
      }

      if (filteredResponses.length > 0) {
        if (fieldType === "checkbox") {
          const allOptions = new Set();
          filteredResponses.forEach(resp => {
            if (Array.isArray(resp.response)) {
              resp.response.forEach(opt => allOptions.add(opt));
            } else if (resp.response) {
              allOptions.add(resp.response);
            }
          });
          
          if (allOptions.size > 0) {
            finalResponses.push({
              evaluation_parameter,
              response: Array.from(allOptions)
            });
          }
        } else {
          const lastResponse = filteredResponses[filteredResponses.length - 1].response;
          finalResponses.push({
            evaluation_parameter,
            response: lastResponse
          });
        }
      }
    });
    
    onConsolidatedResponsesChange(finalResponses);
  }, [surveyResponseByAppId, surveyData, addedResponses, deletedResponses, onConsolidatedResponsesChange]);

  useEffect(() => {
    updateConsolidatedResponses();
  }, [updateConsolidatedResponses]);

  if (!surveyResponseByAppId || surveyResponseByAppId.length === 0) {
    return <div className="p-6 text-gray-500 text-center text-lg">No responses found.</div>;
  }
  if(!surveyStarted){
    return(
      <div className='className="p-6 text-gray-500 text-center text-lg'>Survey not yet started.</div>
    )
  }
  const evaluationParameters = surveyData?.question_groups?.flatMap((group) =>
    group?.questions?.map((question) => question?.evaluation_parameter).filter(Boolean)
  ) || [];

  const handleDeleteResponse = (evaluation_parameter, responseValue) => {
    setDeletedResponses((prev) => ({
      ...prev,
      [`${evaluation_parameter}_${responseValue}`]: true,
    }));
  };

  const handleAddResponse = (evaluation_parameter, newValue) => {
    setAddedResponses((prev) => ({
      ...prev,
      [evaluation_parameter]: [...(prev[evaluation_parameter] || []), newValue],
    }));
    setDeletedResponses((prev) => {
      const newState = { ...prev };
      const formattedNew = Array.isArray(newValue) ? newValue : [newValue];
      formattedNew.forEach((val) => {
        delete newState[`${evaluation_parameter}_${val}`];
      });
      return newState;
    });
  };

  const userResponses = surveyResponseByAppId  
    .filter(item => item.role !== "Admin")
    .map((item) => {
      const responseMap = {};
      item.response.forEach(({ evaluation_parameter, response }) => {
        responseMap[evaluation_parameter] = response;
      });
      return {
        userName: item.userName,
        role: item.role,
        responseMap,
      };
    });
  const groupedResponses = {};
  surveyResponseByAppId.forEach(({ role, response }) => {
    if (role !== "Admin") {
      response.forEach(({ group, evaluation_parameter, response: responseValue }) => {
        if (group !== "General") {
          if (!groupedResponses[evaluation_parameter]) {
            groupedResponses[evaluation_parameter] = [];
          }
          groupedResponses[evaluation_parameter].push({ response: responseValue });
        }
      });
    }
  });  
  if(!surveyStarted){
    return(
      <div className='className="p-6 text-gray-500 text-center text-lg'>Survey not yet started.</div>
    )
  }
  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Survey Responses
      </h1>
  
      <div className="space-y-6">
        {userResponses.map(({ userName, role, responseMap }, index) => (
          <IndividualUserResponseTable
            key={index}
            userName={userName}
            role={role}
            responseMap={responseMap}
            evaluationParameters={evaluationParameters}
          />
        ))}
      </div>
  
      <div className="mt-8">
        <ConsolidatedUserResponsesTable
          groupedResponses={groupedResponses}
          surveyResponseByAppId={surveyResponseByAppId}
          deletedResponses={deletedResponses}
          addedResponses={addedResponses}
          surveyData={surveyData}
          onDeleteResponse={handleDeleteResponse}
          onAddResponse={handleAddResponse}
          handleSubmit={handleSubmit}
        />
      </div>      
    </div>
  );
};

export default ApplicationResponseComponent;