import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstanceDirectus from "../axiosInstanceDirectus";

const SurveyResponsePage = () => {
  const [responses, setResponses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstanceDirectus
      .get(`/survey_responses`)
      .then((response) => {
        const fetchedData = response.data.data;
        
        const flattenedResponses = fetchedData.map(item => {
          const flattened = { ...item };
          
          item.response.forEach(({ fieldName, response }) => {
            flattened[fieldName] = response;
          });
          
          delete flattened.response;
          
          return flattened;
        });

        setResponses(flattenedResponses);
      })
      .catch((error) => console.error("Error fetching application details:", error));
  }, []);

  const downloadCSV = () => {
    if (responses.length === 0) return;

    const filteredKeys = Object.keys(responses[0]).filter(key => key !== "_id" && key !== "__v"); 

    let csvContent = filteredKeys.join(",") + "\n";

    responses.forEach(response => {
      let row = filteredKeys.map(key => `"${response[key] ?? ""}"`).join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "survey_responses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-semibold mb-4">Survey Responses</h1>

      {responses.length === 0 ? (
        <p className="text-gray-500">No responses found.</p>
      ) : (
        <>
          <button
            className="bg-green-500 text-white p-2 rounded mb-4"
            onClick={downloadCSV}
          >
            Download CSV
          </button>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  {Object.keys(responses[0])
                    .filter(key => key !== "_id" && key !== "__v") 
                    .map((key) => (
                      <th key={key} className="border p-2 text-left">{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    {Object.keys(response)
                      .filter(key => key !== "_id" && key !== "__v")
                      .map((key) => (
                        <td key={key} className="border p-2">{String(response[key])}</td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={() => navigate("/landingpage")}>
        Go Back
      </button>
    </div>
  );
};
export default SurveyResponsePage;
