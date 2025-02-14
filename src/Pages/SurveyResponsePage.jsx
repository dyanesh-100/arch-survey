import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SurveyResponsePage = () => {
  const [responses, setResponses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedResponses = localStorage.getItem("surveyResponses");
    if (storedResponses) {
      setResponses(JSON.parse(storedResponses));
    }
  }, []);
  const handleDownload = () => {
    const responseText = JSON.stringify(responses, null, 2); 
    const blob = new Blob([responseText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "survey_responses.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-6">
      <h2 className="text-xl font-bold mb-4">Survey Responses</h2>
      <pre className="bg-gray-100 w-full p-4 rounded shadow whitespace-pre-wrap break-words">
        {JSON.stringify(responses, null, 2)}
      </pre>
      <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={() => navigate("/")}>
        Go Back
      </button>
      <button
        onClick={handleDownload}
        className="mt-4 ml-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Download Responses
      </button>
    </div>
  );
};

export default SurveyResponsePage;
