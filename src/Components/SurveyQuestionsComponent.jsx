import React from "react";

const SurveyQuestionsComponent = ({ group, questions, responses, onResponseChange, applicationById }) => {
    const prepopulatedFields = {
      "q-2001": applicationById?.applicationName,
      "q-2002": applicationById?.applicationDescription,
      "q-2003": applicationById?.applicationDepartment,
      "q-2004": applicationById?.businessOwner,
      "q-2005": applicationById?.itOwner,
      "q-2006": applicationById?.engineeringOwner
    };

    const handleChange = (fieldName, value, isCheckbox) => {
      if (fieldName === "q-2001") return; 

      if (isCheckbox) {
        const existingValues = Array.isArray(responses[group]?.[fieldName]) 
          ? responses[group][fieldName] 
          : [];
        
        const updatedValues = existingValues.includes(value)
          ? existingValues.filter((item) => item !== value)
          : [...existingValues, value];

        onResponseChange(group, fieldName, updatedValues);
      } else {
        onResponseChange(group, fieldName, value);
      }
    };

    return (
      <div className="pt-6 pb-8 overflow-auto">
        <h2 className="text-xl font-bold mb-4">{group}</h2>
        <div className="space-y-4">
          {questions && Array.isArray(questions) && questions.length > 0 ? (
            questions.map((item, index) => {
              const question = item.questions; 
              const isPrepopulated = Object.keys(prepopulatedFields).includes(question.questionId);
              const prefilledValue = isPrepopulated && responses[group]?.[question.fieldName] === undefined
                ? prepopulatedFields[question.questionId]
                : (question.responseType === "checkbox" || question.responseType === "multiple-choice")
                  ? Array.isArray(responses[group]?.[question.fieldName]) 
                    ? responses[group][question.fieldName] 
                    : []
                  : responses[group]?.[question.fieldName] ?? "";

              return (
                <div key={index} className="bg-white p-4 rounded shadow">
                  <p className="font-medium">{question.question}</p>
                  <div className="mt-2 space-y-2">
                  {question.responseType === "text" && (
                    <div className="relative">
                        <input
                          type="text"
                          className={`p-2 border rounded w-full ${
                            question.questionId === "q-2001"
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : ["q-2002", "q-2003", "q-2004", "q-2005", "q-2006"].includes(question.questionId)
                                ? "bg-gray-50 text-gray-600"
                                : ""
                          }`}
                          value={prefilledValue}
                          onChange={(e) => handleChange(question.fieldName, e.target.value)}
                          disabled={question.questionId === "q-2001"}
                        />
                        {question.questionId === "q-2001" && (
                          <span className="absolute right-2 top-2 text-xs text-gray-500">
                            (Application name cannot be edited)
                          </span>
                        )}
                        {["q-2002", "q-2003", "q-2004", "q-2005", "q-2006"].includes(question.questionId) && (
                          <span className="absolute right-2 top-2 text-xs text-blue-500 italic">
                            (Edit it if the values are outdated)
                          </span>
                        )}
                      </div>
                    )}
                    {question.responseType === "number" && (
                      <input
                        type="number"
                        className="p-2 border rounded w-full"
                        value={prefilledValue}
                        onChange={(e) => handleChange(question.fieldName, e.target.value)}
                      />
                    )}
                    {question.responseType === "dropdown" && (
                      <select
                        className="border p-2 rounded w-full"
                        value={prefilledValue}
                        onChange={(e) => handleChange(question.fieldName, e.target.value)}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {question.options.map((option, i) => (
                          <option key={i} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {question.responseType === "radio" && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center">
                            <input
                              className="mr-2"
                              type="radio"
                              name={`${group}-${question.fieldName}`}
                              checked={prefilledValue === option}
                              onChange={() => handleChange(question.fieldName, option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    {(question.responseType === "checkbox" || question.responseType === "multiple-choice") && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center">
                            <input
                              className="mr-2 rounded"
                              type="checkbox"
                              checked={prefilledValue.includes(option)}
                              onChange={() => handleChange(question.fieldName, option, true)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No questions available.</p>
          )}
        </div>
      </div>
    );
  };

export default SurveyQuestionsComponent;