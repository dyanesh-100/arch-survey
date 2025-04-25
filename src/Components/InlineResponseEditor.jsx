import { useState } from "react";

const InlineResponseEditor = ({
  field,
  onSave,
  onCancel,
}) => {
  const [newValue, setNewValue] = useState("");
  const handleCheckboxChange = (option) => {
    const currentValues = Array.isArray(newValue) ? newValue : [];
    if (currentValues.includes(option)) {
      setNewValue(currentValues.filter(v => v !== option));
    } else {
      setNewValue([...currentValues, option]);
    }
  };

  const handleSave = () => {
    if (newValue !== "") {
      onSave(newValue);
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
      {["radio", "dropdown"].includes(field.type) ? (
        <div className="space-y-2">
          {field.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`option-${index}`}
                name={field.name}
                value={option}
                checked={newValue === option}
                onChange={() => setNewValue(option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor={`option-${index}`} className="ml-2 block text-sm text-gray-700">
                {option}
              </label>
            </div>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <div className="space-y-2">
          {field.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                id={`option-${index}`}
                name={field.name}
                checked={Array.isArray(newValue) && newValue.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor={`option-${index}`} className="ml-2 block text-sm text-gray-700">
                {option}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={`Enter ${field.type} response`}
        />
      )}
  
      <div className="flex justify-end space-x-3 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Response
        </button>
      </div>
    </div>
  );
};

export default InlineResponseEditor;