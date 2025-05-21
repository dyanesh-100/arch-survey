import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstanceDirectus from "../axiosInstanceDirectus";

const SurveyResponsePage = () => {
  const [responses, setResponses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstanceDirectus
      .get(`/items/survey_responses`)
      .then((response) => {
        const responseData = response.data.data || response.data;
        const fetchedData = Array.isArray(responseData) ? responseData : [responseData];
        setResponses(fetchedData);
      })
      .catch((error) => console.error("Error fetching application details:", error));
  }, []);

  
  const adminResponses = responses.filter(response => response.role === "Admin");

  const downloadCSV = () => {
    if (adminResponses.length === 0) return;
    const allParams = new Set();
    adminResponses.forEach(response => {
      if (response.response && Array.isArray(response.response)) {
        response.response.forEach(item => {
          allParams.add(item.evaluation_parameter);
        });
      }
    });

    const headers = ["appId", "role", ...Array.from(allParams)];
    let csvContent = headers.join(",") + "\n";

    adminResponses.forEach(response => {
      const rowData = {
        appId: response.appId || "",
        role: response.role || ""
      };

      if (response.response && Array.isArray(response.response)) {
        response.response.forEach(item => {
          rowData[item.evaluation_parameter] = item.response || "";
        });
      }

      const row = headers.map(header => `"${rowData[header] || ""}"`).join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "survey_responses_admin.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFlattenedResponse = (response) => {
    const flattened = {
      appId: response.appId || "",
      role: response.role || ""
    };

    if (response.response && Array.isArray(response.response)) {
      response.response.forEach(item => {
        flattened[item.evaluation_parameter] = item.response || "";
      });
    }

    return flattened;
  };
  const getAllEvaluationParameters = () => {
    const params = new Set();
    adminResponses.forEach(response => {
      if (response.response && Array.isArray(response.response)) {
        response.response.forEach(item => {
          params.add(item.evaluation_parameter);
        });
      }
    });
    return Array.from(params);
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-semibold mb-4">Finalized Survey Responses</h1>

      {adminResponses.length === 0 ? (
        <p className="text-gray-500">No admin responses found.</p>
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
                  <th className="border p-2 text-left">appId</th>
                  <th className="border p-2 text-left">role</th>
                  {getAllEvaluationParameters().map(param => (
                    <th key={param} className="border p-2 text-left">{param}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminResponses.map((response, index) => {
                  const flattened = getFlattenedResponse(response);
                  return (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2">{flattened.appId}</td>
                      <td className="border p-2">{flattened.role}</td>
                      {getAllEvaluationParameters().map(param => (
                        <td key={`${index}-${param}`} className="border p-2">
                          {flattened[param] || ""}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <button 
        className="bg-blue-500 text-white p-2 rounded mt-4" 
        onClick={() => navigate("/landingpage")}
      >
        Go Back
      </button>
    </div>
  );
};

export default SurveyResponsePage;