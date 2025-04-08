import React from "react";

const SurveyQuestionsComponent = React.forwardRef(
  ({ group, questions, responses, onResponseChange, applicationById }, ref) => {
    // Prepopulated values from applicationById
    const prepopulatedFields = {
      "q-2001": applicationById?.applicationName,
      "q-2002": applicationById?.applicationDescription,
      "q-2003": applicationById?.applicationDepartment,
      "q-2004": applicationById?.businessOwner,
      "q-2005": applicationById?.itOwner,
    };

    // Handles response updates
    const handleChange = (fieldName, value, isCheckbox) => {
      if (fieldName === "q-2001") return; // Prevent changes to q-2001

      if (isCheckbox) {
        const existingValues = responses[group]?.[fieldName] || [];
        const updatedValues = existingValues.includes(value)
          ? existingValues.filter((item) => item !== value)
          : [...existingValues, value];

        onResponseChange(group, fieldName, updatedValues);
      } else {
        onResponseChange(group, fieldName, value);
      }
    };

    return (
      <div ref={ref} className="pt-6 pb-8 overflow-auto">
        <h2 className="text-xl font-bold mb-4">{group}</h2>
        <div className="space-y-4">
          {questions && Array.isArray(questions) && questions.length > 0 ? (
            questions.map((item, index) => {
              const isPrepopulated = Object.keys(prepopulatedFields).includes(item.questionId);
              const prefilledValue =
                isPrepopulated && responses[group]?.[item.fieldName] === undefined
                  ? prepopulatedFields[item.questionId]
                  : responses[group]?.[item.fieldName] ?? "";

              return (
                <div key={index} className="bg-white p-4 rounded shadow">
                  <p className="font-medium">{item.question}</p>
                  <div className="mt-2 space-y-2">
                    {/* Text Input */}
                    {item.responseType === "text" && (
                      <input
                        type="text"
                        className="p-2 border rounded w-full"
                        value={prefilledValue}
                        onChange={(e) => handleChange(item.fieldName, e.target.value)}
                        disabled={item.questionId === "q-2001"} // q-2001 remains uneditable
                      />
                    )}

                    {/* Number Input */}
                    {item.responseType === "number" && (
                      <input
                        type="number"
                        className="p-2 border rounded w-full"
                        value={prefilledValue}
                        onChange={(e) => handleChange(item.fieldName, e.target.value)}
                      />
                    )}

                    {/* Dropdown, Radio, Checkbox Inputs */}
                    {["radio", "multiple-choice", "dropdown"].includes(item.responseType) && (
                      <div>
                        {item.responseType === "dropdown" ? (
                          <select
                            className="border p-2 rounded w-full"
                            value={prefilledValue}
                            onChange={(e) => handleChange(item.fieldName, e.target.value)}
                          >
                            <option value="" disabled>
                              Select an option
                            </option>
                            {item.options.map((option, i) => (
                              <option key={i} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.options.map((option, i) => (
                            <label key={i} className="block">
                              <input
                                className="mr-2"
                                type={item.responseType === "radio" ? "radio" : "checkbox"}
                                name={item.responseType === "radio" ? `${group}-q${index}` : undefined}
                                checked={
                                  item.responseType === "radio"
                                    ? prefilledValue === option
                                    : prefilledValue.includes(option) || false
                                }
                                value={option}
                                onChange={() => handleChange(item.fieldName, option, item.responseType === "multiple-choice")}
                              />
                              {option}
                            </label>
                          ))
                        )}
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
  }
);

export default SurveyQuestionsComponent;
