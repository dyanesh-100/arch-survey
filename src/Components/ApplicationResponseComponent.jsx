import { useState, useEffect, useCallback } from "react";
import IndividualUserResponseTable from "./IndividualUserResponseTable";
import ConsolidatedUserResponsesTable from "./ConsolidatedUserResponsesTable";

const ApplicationResponseComponent = ({ 
  surveyData, 
  surveyResponseByAppId,
  onConsolidatedResponsesChange,
  handleSubmit
}) => {
  const [deletedResponses, setDeletedResponses] = useState({});
  const [addedResponses, setAddedResponses] = useState({});

  const hasAllRequiredRoles = useCallback(() => {
    if (!surveyResponseByAppId) return false;
    
    const requiredRoles = new Set(['IT Owner', 'Engineering Owner', 'Business Owner']);
    const presentRoles = new Set();
    
    surveyResponseByAppId.forEach(({ role }) => {
      if (requiredRoles.has(role)) {
        presentRoles.add(role);
      }
    });
    
    return presentRoles.size === requiredRoles.size;
  }, [surveyResponseByAppId]);

  const formatResponse = (response) => {
    if (Array.isArray(response)) {
      return response.join(", ");
    }
    return response || "N/A";
  };

  const updateConsolidatedResponses = useCallback(() => {
    if (!surveyResponseByAppId || !hasAllRequiredRoles()) return;

    const groupedResponses = {};
    surveyResponseByAppId.forEach(({ role, response }) => {
      if (role !== "Admin") {
        response.forEach(({ group, fieldName, response: responseValue }) => {
          if (group !== "General") {
            if (!groupedResponses[fieldName]) {
              groupedResponses[fieldName] = [];
            }
            groupedResponses[fieldName].push({ response: responseValue });
          }
        });
      }
    }); 
    
    const finalResponses = [];
    const fieldNames = surveyData?.question_groups?.flatMap((group) =>
      group?.groups?.questions?.map((questionItem) => questionItem?.questions?.fieldName).filter(Boolean)
    ) || [];

    fieldNames.forEach(fieldName => {
      if (!groupedResponses[fieldName]) return;
      const allResponses = groupedResponses[fieldName] || [];
      const added = addedResponses[fieldName] || [];
      const formattedAdded = added.map(response => ({ response }));
      const combinedResponses = [...allResponses, ...formattedAdded];
      const filteredResponses = combinedResponses.filter(resp => {
        const formatted = formatResponse(resp.response);
        return !deletedResponses[`${fieldName}_${formatted}`];
      });
      if (filteredResponses.length > 0) {
        const fieldType = surveyData.question_groups.flatMap(
          group => group.groups.questions
        ).find(q => q.questions.fieldName === fieldName)?.questions.responseType;
        
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
              fieldName,
              response: Array.from(allOptions)
            });
          }
        } else {
          const lastResponse = filteredResponses[filteredResponses.length - 1].response;
          finalResponses.push({
            fieldName,
            response: lastResponse
          });
        }
      }
    });
    onConsolidatedResponsesChange(finalResponses);
  }, [surveyResponseByAppId, surveyData, addedResponses, deletedResponses, onConsolidatedResponsesChange, hasAllRequiredRoles]);

  useEffect(() => {
    updateConsolidatedResponses();
  }, [updateConsolidatedResponses]);

  if (!surveyResponseByAppId || surveyResponseByAppId.length === 0) {
    return <div className="p-6 text-gray-500 text-center text-lg">No responses found.</div>;
  }

  const fieldNames = surveyData?.question_groups?.flatMap((group) =>
    group?.groups?.questions?.map((questionItem) => questionItem?.questions?.fieldName).filter(Boolean)
  ) || [];

  const handleDeleteResponse = (fieldName, responseValue) => {
    setDeletedResponses((prev) => ({
      ...prev,
      [`${fieldName}_${responseValue}`]: true,
    }));
  };

  const handleAddResponse = (fieldName, newValue) => {
    setAddedResponses((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), newValue],
    }));
    setDeletedResponses((prev) => {
      const newState = { ...prev };
      const formattedNew = Array.isArray(newValue) ? newValue : [newValue];
      formattedNew.forEach((val) => {
        delete newState[`${fieldName}_${val}`];
      });
      return newState;
    });
  };

  const userResponses = surveyResponseByAppId
    .filter(item => item.role !== "Admin")
    .map((item) => {
      const responseMap = {};
      item.response.forEach(({ fieldName, response }) => {
        responseMap[fieldName] = response;
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
      response.forEach(({ group, fieldName, response: responseValue }) => {
        if (group !== "General") {
          if (!groupedResponses[fieldName]) {
            groupedResponses[fieldName] = [];
          }
          groupedResponses[fieldName].push({ response: responseValue });
        }
      });
    }
  });  

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
            fieldNames={fieldNames}
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
     
        {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <p className="text-gray-700">
            The consolidated response review will be available once all stakeholders 
            (IT Owner, Engineering Owner, and Business Owner) have submitted their responses.
            You will then be able to review, edit, and submit the final application response.
          </p>
        </div> */}
      
    </div>
  );
};

export default ApplicationResponseComponent;