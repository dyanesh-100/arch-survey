import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const SurveyQuestionsComponent = ({group,questions}) => {
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const handleChange = (question, value) => {
    setResponses((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const handleSubmit = () => {
    localStorage.setItem("surveyResponses", JSON.stringify(responses));
    setSubmitted(true)
    alert("Responses saved! You can view them on the response page.");
  };
  const handleViewResponse = () => {
    navigate("/responses");
  }
  return (
    <div className="w-3/4 p-6 pb-8 overflow-auto">
      <h2 className="text-xl font-bold mb-4">{group}</h2>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p className="font-medium">{item.question}</p>
            <div className="mt-2 space-y-2">
              {item.options.map((option, i) => (
                <label key={i} className="block">
                  <input 
                    className="mr-2" 
                    type="radio" 
                    name={`${group}-q${index}`} 
                    checked={responses[item.question] === option}
                    value={option}
                    onChange={() => handleChange(item.question, option)}
                   />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="bg-blue-500 text-white p-2 rounded" onClick={handleSubmit}>
            Submit
        </button>
        {submitted && (
          <button className="bg-green-500 text-white p-2 rounded ml-4" onClick={handleViewResponse}>
            View Response
          </button>
        )}
      </div>
    </div>
  )
}

export default SurveyQuestionsComponent