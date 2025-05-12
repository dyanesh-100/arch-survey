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
    
    const handleChange = (evaluation_parameter, value, isCheckbox) => {
      if (evaluation_parameter === "app_name") return; 

      if (isCheckbox) {
        const existingValues = Array.isArray(responses[group]?.[evaluation_parameter]) 
          ? responses[group][evaluation_parameter] 
          : [];
        
        const updatedValues = existingValues.includes(value)
          ? existingValues.filter((item) => item !== value)
          : [...existingValues, value];

        onResponseChange(group, evaluation_parameter, updatedValues);
      } else {
        onResponseChange(group, evaluation_parameter, value);
      }
    };

    return (
      <div className="pt-6 pb-8 overflow-auto">
        <h2 className="text-xl font-bold mb-4">{group}</h2>
        <div className="space-y-4">
          {questions && Array.isArray(questions) && questions.length > 0 ? (
            questions.map((item, index) => {
              const question = item.questions || item; // Handle both formats
              const questionId = question?.question_id; // Safe access
              const hasQuestionId = questionId !== undefined && questionId !== null;
              if (hasQuestionId && questionId === "q-2001") {
                return null;
              }
              const isPrepopulated = hasQuestionId && Object.keys(prepopulatedFields).includes(questionId);
              const prefilledValue = isPrepopulated && responses[group]?.[question.evaluation_parameter] === undefined
                ? prepopulatedFields[questionId]
                : (question.response_type === "checkbox" || question.response_type === "multiple-choice")
                  ? Array.isArray(responses[group]?.[question.evaluation_parameter]) 
                    ? responses[group][question.evaluation_parameter] 
                    : []
                  : responses[group]?.[question.evaluation_parameter] ?? "";

              return (
                <div key={index} className="bg-white p-4 rounded shadow">
                  <p className="font-medium">{question.question}</p>
                  <div className="mt-2 space-y-2">
                  {question.response_type === "text" && (
                    <div className="relative">
                        <input
                          type="text"
                          className={`p-2 border rounded w-full ${
                            hasQuestionId && questionId === "q-2001"
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : hasQuestionId && ["q-2002", "q-2003", "q-2004", "q-2005", "q-2006"].includes(questionId)
                                ? "bg-gray-50 text-gray-600"
                                : ""
                          }`}
                          value={prefilledValue}
                          onChange={(e) => handleChange(question.evaluation_parameter, e.target.value)}
                          disabled={hasQuestionId && questionId === "q-2001"}
                        />
                
                        {hasQuestionId && ["q-2002", "q-2003", "q-2004", "q-2005", "q-2006"].includes(questionId) && (
                          <span className="absolute right-2 top-2 text-xs text-blue-500 italic">
                            (Edit it if the values are outdated)
                          </span>
                        )}
                      </div>
                    )}
                    {question.response_type === "number" && (
                      <input
                        type="number"
                        className="p-2 border rounded w-full"
                        value={prefilledValue}
                        onChange={(e) => handleChange(question.evaluation_parameter, e.target.value)}
                      />
                    )}
                    {question.response_type === "dropdown" && (
                      <select
                        className="border p-2 rounded w-full"
                        value={prefilledValue}
                        onChange={(e) => handleChange(question.evaluation_parameter, e.target.value)}
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
                    {question.response_type === "radio" && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center">
                            <input
                              className="mr-2"
                              type="radio"
                              name={`${group}-${question.evaluation_parameter}`}
                              checked={prefilledValue === option}
                              onChange={() => handleChange(question.evaluation_parameter, option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    {(question.response_type === "checkbox" || question.response_type === "multiple-choice") && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center">
                            <input
                              className="mr-2 rounded"
                              type="checkbox"
                              checked={prefilledValue.includes(option)}
                              onChange={() => handleChange(question.evaluation_parameter, option, true)}
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