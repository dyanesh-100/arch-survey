import React, { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import InlineResponseEditor from "./InlineResponseEditor";
import { useGlobalContext } from "../Context/GlobalContext"; 
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
  const {isFinalResponseSubmitted} = useGlobalContext();
  const [editingField, setEditingField] = useState(null);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictFields, setConflictFields] = useState([]);
  useEffect(() => {
    const conflicts = [];
    let conflictExists = false;

    Object.keys(groupedResponses).forEach((fieldName) => {
      const responses = getAllResponsesForField(fieldName);
      const uniqueResponses = getUniqueResponses(fieldName);
      if (uniqueResponses.length > 1) {
        conflictExists = true;
        conflicts.push(fieldName);
      }
    });

    setHasConflicts(conflictExists);
    setConflictFields(conflicts);
  }, [groupedResponses, deletedResponses, addedResponses]);

  const formatResponse = (response) => {
    if (Array.isArray(response)) {
      return response.join(", ");
    }
    return response || "N/A";
  };

  const isResponseDeleted = (fieldName, responseValue) => {
    return deletedResponses[`${fieldName}_${responseValue}`];
  };

  const getAllResponsesForField = (fieldName) => {
    const originalResponses = groupedResponses[fieldName] || [];
    const added = addedResponses[fieldName] || [];
    const formattedAdded = added.map((response) =>
      Array.isArray(response) ? { response: response } : { response }
    );
    return [...originalResponses, ...formattedAdded];
  };

  const getUniqueResponses = (fieldName) => {
    const responses = getAllResponsesForField(fieldName);
    const responseGroups = {};
    
    responses.forEach((resp) => {
      const formatted = formatResponse(resp.response);
      if (!isResponseDeleted(fieldName, formatted)) {
        if (!responseGroups[formatted]) {
          responseGroups[formatted] = 0;
        }
        responseGroups[formatted]++;
      }
    });

    return Object.keys(responseGroups);
  };

  const getFieldType = (fieldName) => {
    const question = surveyData.question_groups.flatMap(
      (group) => group.groups.questions
    ).find((q) => q.questions.fieldName === fieldName)?.questions;
    return {
      type: question?.responseType,
      options: question?.options || [],
    };
  };

  const handleSubmitWithValidation = () => {
    if (hasConflicts) {
      alert(`Please resolve conflicts in the following fields before submitting: ${conflictFields.join(", ")}`);
      return;
    }
    handleSubmit();
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Consolidated Responses
      </h2>
      
      {hasConflicts && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Conflict Alert!</p>
          <p>The following fields have multiple responses that need resolution: {conflictFields.join(", ")}</p>
          <p>Please delete or consolidate responses before submitting.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-3 text-left text-gray-600">Field Name</th>
              <th className="border p-3 text-left text-gray-600">Responses</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedResponses).map((fieldName) => {
              const uniqueResponses = getUniqueResponses(fieldName);
              const fieldType = getFieldType(fieldName);
              const isConflictField = conflictFields.includes(fieldName);

              if (uniqueResponses.length === 0) {
                return (
                  <tr key={fieldName} className="hover:bg-gray-50">
                    <td className="border p-3 text-gray-700">{fieldName}</td>
                    <td className="border p-3 text-gray-700">
                      {editingField?.name === fieldName ? (
                        <InlineResponseEditor
                          field={{
                            name: fieldName,
                            ...fieldType,
                          }}
                          onSave={(value) => {
                            onAddResponse(fieldName, value);
                            setEditingField(null);
                          }}
                          onCancel={() => setEditingField(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setEditingField({
                            name: fieldName,
                            ...fieldType,
                          })}
                          className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer"
                        >
                          <Plus className="h-5 w-5 mr-1" />
                          Add Response
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }

              return uniqueResponses.map((responseValue, idx) => (
                <tr
                  key={`${fieldName}_${responseValue}_${idx}`}
                  className={`hover:bg-gray-50 ${isConflictField ? "bg-red-50" : ""}`}
                >
                  {idx === 0 && (
                    <td
                      rowSpan={uniqueResponses.length}
                      className="border p-3 text-gray-700"
                    >
                      {fieldName}
                      {editingField?.name === fieldName && (
                        <InlineResponseEditor
                          field={editingField}
                          onSave={(value) => {
                            onAddResponse(fieldName, value);
                            setEditingField(null);
                          }}
                          onCancel={() => setEditingField(null)}
                        />
                      )}
                    </td>
                  )}
                  <td className="border p-3 text-gray-700 flex justify-between items-center">
                    {responseValue}
                    <button
                      onClick={() => onDeleteResponse(fieldName, responseValue)}
                      className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ));
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
          {surveyResponseByAppId.some(item => item.role === "Admin") || isFinalResponseSubmitted
            ? "Update Final Response"
            : "Submit Final Response"}
        </button>
        {(surveyResponseByAppId.find(item => item.role === "Admin")?.userName || isFinalResponseSubmitted) && (
          <span className="text-gray-700">
            Already submitted by{" "}
            {surveyResponseByAppId.find(item => item.role === "Admin")?.userName || "Admin"}
          </span>
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