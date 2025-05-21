import React, { useState, useEffect, forwardRef } from "react";
import { Trash2, Plus, Download } from "lucide-react";
import InlineResponseEditor from "./InlineResponseEditor";
import { useGlobalContext } from "../Context/GlobalContext";
import TabNavigation from "../Components/TabNavigation";

const ConsolidatedUserResponsesTable = ({
  groupedResponses,
  deletedResponses,
  addedResponses,
  surveyData,
  onDeleteResponse,
  onAddResponse,
  surveyResponseByAppId,
  handleSubmit
}) => {
  const { isFinalResponseSubmitted } = useGlobalContext();
  const [editingField, setEditingField] = useState(null);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictFields, setConflictFields] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [allConflicts, setAllConflicts] = useState({});

  const isAdminSubmitted = surveyResponseByAppId.some(item => item.role === "Admin") || isFinalResponseSubmitted;
  const adminsResponse = surveyResponseByAppId.find(item => item.role === "Admin");

  const questionGroups = surveyData.question_groups
    .filter(group => group.groupName !== "General")
    .map(group => group.groupName);

  useEffect(() => {
    if (questionGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(questionGroups[0]);
    }
  }, [questionGroups]);

  const getEvaluationParametersForGroup = (groupName) => {
    const group = surveyData.question_groups.find(g => g.groupName === groupName);
    if (!group) return [];
    
    return group.questions.map(question => question.evaluation_parameter);
  };

  const getAllEvaluationParameters = () => {
    if (!selectedGroup) return [];
    return getEvaluationParametersForGroup(selectedGroup);
  };

  const checkAllConflicts = () => {
    const conflictsByGroup = {};
    let hasAnyConflict = false;

    questionGroups.forEach(groupName => {
      const groupConflicts = [];
      const evaluationParameters = getEvaluationParametersForGroup(groupName);

      evaluationParameters.forEach((evaluation_parameter) => {
        const responses = getAllResponsesForField(evaluation_parameter);
        const uniqueResponses = getUniqueResponses(evaluation_parameter);
        if (uniqueResponses.length > 1) {
          groupConflicts.push(evaluation_parameter);
          hasAnyConflict = true;
        }
      });

      if (groupConflicts.length > 0) {
        conflictsByGroup[groupName] = groupConflicts;
      }
    });

    setAllConflicts(conflictsByGroup);
    setHasConflicts(hasAnyConflict);
  };

  useEffect(() => {
    checkAllConflicts();
  }, [groupedResponses, deletedResponses, addedResponses]);

  const formatResponse = (response) => {
    if (Array.isArray(response)) {
      return response.join(", ");
    }
    return response || "N/A";
  };
  
  const isResponseDeleted = (evaluation_parameter, responseValue) => {
    return deletedResponses[`${evaluation_parameter}_${responseValue}`];
  };

  const getAllResponsesForField = (evaluation_parameter) => {
    if (isAdminSubmitted && adminsResponse) {
      const adminResponse = adminsResponse.response.find(
        r => r.evaluation_parameter === evaluation_parameter
      );
      return adminResponse ? [{ 
        response: adminResponse.response,
        userName: adminsResponse.userName,
        role: adminsResponse.role
      }] : [];
    }
    
    const responses = [];
    
    // Add original responses with user info
    surveyResponseByAppId.forEach(userResponse => {
      const foundResponse = userResponse.response.find(
        r => r.evaluation_parameter === evaluation_parameter
      );
      if (foundResponse) {
        responses.push({
          response: foundResponse.response,
          userName: userResponse.userName,
          role: userResponse.role
        });
      }
    });
    
    // Add any manually added responses
    const added = addedResponses[evaluation_parameter] || [];
    const formattedAdded = added.map((response) =>
      Array.isArray(response) 
        ? { response: response.join(", ") } 
        : { response }
    );
    
    return [...responses, ...formattedAdded];
  };
  
  const getUniqueResponses = (evaluation_parameter) => {
    const responses = getAllResponsesForField(evaluation_parameter);
    const responseGroups = {};
    
    responses.forEach((resp) => {
      const formatted = formatResponse(resp.response);
      if (!isResponseDeleted(evaluation_parameter, formatted)) {
        if (!responseGroups[formatted]) {
          responseGroups[formatted] = 0;
        }
        responseGroups[formatted]++;
      }
    });

    return Object.keys(responseGroups);
  };

  const getFieldType = (evaluation_parameter) => {
    const question = surveyData.question_groups
      .flatMap((group) => group.questions)
      .find((q) => q?.evaluation_parameter === evaluation_parameter);
  
    return {
      type: question?.response_type || null,
      options: question?.options || [],
    };
  };
  
  const handleSubmitWithValidation = () => {
    if (hasConflicts) {
      toast.error('Please resolve all conflicts before submitting', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }
    handleSubmit();
  };
  
  const downloadCSV = () => {
    const adminResponse = surveyResponseByAppId.find(item => item.role === "Admin");
    
    if (!adminResponse) {
      toast.warn('No admin response found to download', {
        position: 'top-right',
        autoClose: 4000,
      });
      return;
    }
    const headers = ["appId", ...adminResponse.response.map(item => item.evaluation_parameter)];
    const dataRow = [
      adminResponse.appId,
      ...adminResponse.response.map(item => item.response)
    ];

    let csvContent = headers.join(",") + "\n";
    csvContent += dataRow.map(field => `"${field}"`).join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `final_response_${adminResponse.appId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const formatConflictMessage = () => {
    return Object.entries(allConflicts).map(([groupName, conflicts]) => (
      <div key={groupName}>
        <p className="font-semibold">{groupName} Group:</p>
        <p>{conflicts.join(", ")}</p>
      </div>
    ));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Consolidated Responses
      </h2>
      <TabNavigation
        groups={questionGroups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
      />

      {hasConflicts && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Conflict Alert!</p>
          <p>The following fields have multiple responses that need resolution:</p>
          {formatConflictMessage()}
          <p>Please delete or consolidate responses before submitting.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3 text-left  text-gray-600">Field Name</th>
              <th className="border p-3 text-left text-gray-600">Responses</th>
            </tr>
          </thead>
          <tbody>
            {getAllEvaluationParameters().map((evaluation_parameter) => {
              const uniqueResponses = getUniqueResponses(evaluation_parameter);
              const fieldType = getFieldType(evaluation_parameter);
              const isConflictField = allConflicts[selectedGroup]?.includes(evaluation_parameter);
              const hasResponses = uniqueResponses.length > 0;

              return (
                <React.Fragment key={evaluation_parameter}>
                  {hasResponses ? (
                    uniqueResponses.map((responseValue, idx) => {
                      const matchingResponses = getAllResponsesForField(evaluation_parameter)
                        .filter(r => formatResponse(r.response) === responseValue && !isResponseDeleted(evaluation_parameter, responseValue));

                      return (
                        <tr
                          key={`${evaluation_parameter}_${responseValue}_${idx}`}
                          className={`hover:bg-gray-50 ${isConflictField ? "bg-red-50" : ""}`}
                        >
                          {idx === 0 && (
                            <td
                              rowSpan={uniqueResponses.length}
                              className="border p-3 text-base font-medium min-w-[100px]"
                            >
                              {evaluation_parameter}
                            </td>
                          )}
                          <td className="border p-3 text-gray-700">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                <div className="text-base font-medium min-w-[100px]">{responseValue}</div>
                                <div className="text-sm text-gray-500">
                                  {matchingResponses.map((r, i) => (
                                    <span key={i}>
                                      {r.userName} ({r.role})
                                      {i < matchingResponses.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => onDeleteResponse(evaluation_parameter, responseValue)}
                                className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key={evaluation_parameter} className="hover:bg-gray-50">
                      <td className="border p-3 text-gray-700">{evaluation_parameter}</td>
                      <td className="border p-3 text-gray-700">
                        {editingField?.name === evaluation_parameter ? (
                          <InlineResponseEditor
                            field={{
                              name: evaluation_parameter,
                              ...fieldType,
                            }}
                            onSave={(value) => {
                              onAddResponse(evaluation_parameter, value);
                              setEditingField(null);
                            }}
                            onCancel={() => setEditingField(null)}
                          />
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">No responses yet</span>
                            <button
                              onClick={() => setEditingField({
                                name: evaluation_parameter,
                                ...fieldType,
                              })}
                              className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer"
                            >
                              <Plus className="h-5 w-5 mr-1" />
                              Add Response
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-center items-center gap-4">
        <button 
          onClick={handleSubmitWithValidation}
          className={`bg-green-500 text-white p-3 rounded cursor-pointer ${
            hasConflicts ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
          }`}
          disabled={hasConflicts}
        >
          {isAdminSubmitted
            ? "Update Final Response"
            : "Submit Final Response"}
        </button>
        {isAdminSubmitted && (
          <>
            <button
              onClick={downloadCSV}
              className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download CSV
            </button>
            <span className="text-gray-700">
              Already submitted by{" "}
              {adminsResponse?.userName || "Admin"}
            </span>
          </>
        )}
      </div>
      {hasConflicts && (
        <div className="mt-2 text-center text-red-500">
          Please resolve all conflicts before submitting
        </div>
      )}
    </div>
  );
};

export default ConsolidatedUserResponsesTable;