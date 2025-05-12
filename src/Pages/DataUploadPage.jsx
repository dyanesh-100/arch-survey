import { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-feather";
import UploadCSV from "../Components/UploadCSV";
import UploadSummary from "../Components/UploadSummary"
import FieldMappingConfigurationContainer from '../Components/FieldMappingConfigurationContainer';
import questions from "../assets/Images/questions-sample.jpg";
import applications from "../assets/Images/applications-sample.jpg";
import axiosInstanceDirectus from "../axiosInstanceDirectus";

const DataUploadPage = () => {
  const { uploadType } = useParams();
  const navigate = useNavigate();
  const [mappedData, setMappedData] = useState(null);
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const apiEndpoints = {
    applications: "/applications",
    questions: "/questions",
  };
  const instructions = {
    applications: [
      "Ensure the CSV file contains all required application fields",
      "The first row should be column headers",
      "Required fields: name, email, submission_date",
      "File size should not exceed 5MB"
    ],
    questions: [
      "Ensure the CSV file contains all required question fields",
      "The first row should be column headers",
      "Required fields: question_text, category, difficulty",
      "File size should not exceed 5MB"
    ]
  };
  const sampleFormat = {
    applications: {
      format: "CSV format",
      image: applications,
      fileId: "04861051-0b47-46da-943d-843f9268c3ce.csv"
    },
    questions: {
      format: "CSV format",
      image: questions,
      fileId: "c61b2f3a-43cc-4cd9-990a-b9e3087b7f56.csv" 
    }
  };

  const directusUrl = "http://localhost:8055";
  const fileUrl = sampleFormat[uploadType]?.fileId
    ? `${directusUrl}/assets/${sampleFormat[uploadType].fileId}?download`
    : "#"; 
  const imageDetails = sampleFormat[uploadType] || { format: "", image: "" };

  const handleUpload = async () => {
    if (!mappedData) {
      alert("Please complete the configuration first");
      return;
    }

    try {
      const existingItemsResponse = await axiosInstanceDirectus.get(`/${uploadType}`, {
        params: {
          fields: [uploadType === 'applications' ? 'applicationId' : 'questionId'],
          filter: {
            [uploadType === 'applications' ? 'applicationId' : 'questionId']: {
              _in: mappedData.map(item => 
                uploadType === 'applications' ? item.applicationId : item.questionId
              )
            }
          }
        }
      });

      const existingItemIds = existingItemsResponse.data.data?.map(item => 
        uploadType === 'applications' ? item.applicationId : item.questionId
      ) || [];

      const results = await Promise.all(
        mappedData.map(async (item) => {
          const itemId = uploadType === 'applications' ? item.applicationId : item.questionId;
          const endpoint = `/${uploadType}`;
          
          if (existingItemIds.includes(itemId)) {
            const updateResponse = await axiosInstanceDirectus.patch(
              `${endpoint}/${itemId}`,
              item,
              {
                headers: {
                  "Content-Type": "application/json",
                }
              }
            );
            return {
              action: 'updated',
              id: itemId,
              name: uploadType === 'applications' ? item.applicationName : item.question,
              response: updateResponse,
              data: item 
            };
          } else {
            const createResponse = await axiosInstanceDirectus.post(
              endpoint,
              item,
              {
                headers: {
                  "Content-Type": "application/json",
                }
              }
            );
            return {
              action: 'created',
              id: itemId,
              name: uploadType === 'applications' ? item.applicationName : item.question,
              response: createResponse,
              data: item 
            };
          }
        })
      );
      if (uploadType === 'applications') {
        await handleApplicationStakeholders(results);
        // await handleDefaultAppQuestions();
      }
      const createdCount = results.filter(r => r.action === 'created').length;
      const updatedCount = results.filter(r => r.action === 'updated').length;
      setCreatedCount(createdCount);
      setUpdatedCount(updatedCount);
      setIsUploaded(true);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error processing ${uploadType}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  };
  const handleDefaultAppQuestions = async () => {
    const defaultQuestions = [
      {
        question_id: "q-2001",
        question: "What is the application name?",
        response_type: "text",
        evaluation_parameter: "app_name",
        options: [],
        question_group: "grp-100",
      },
      {
        question_id: "q-2002",
        question: "Provide a description of the application.",
        response_type: "text",
        evaluation_parameter: "app_description",
        options: [],
        question_group: "grp-100",
      },
      {
        question_id: "q-2003",
        question: "Which business unit does this application belong to?",
        response_type: "text",
        evaluation_parameter: "business_unit",
        options: [],
        question_group: "grp-100",
      },
      {
        question_id: "q-2004",
        question: "Who is the business owner of the application?",
        response_type: "text",
        evaluation_parameter: "business_owner",
        options: [],
        question_group: "grp-100",
      },
      {
        question_id: "q-2005",
        question: "Who is the IT owner of the application?",
        response_type: "text",
        evaluation_parameter: "it_owner",
        options: [],
        question_group: "grp-100",
      }
    ];
  
    try {
      const responses = await Promise.all(
        defaultQuestions.map((question) =>
          axiosInstanceDirectus.post('/questions', question)
        )
      );
      console.log("All questions submitted successfully", responses);
    } catch (error) {
      console.error("Error submitting questions", error);
    }
  };  
  const handleApplicationStakeholders = async (applicationResults) => {
    try {
      const existingStakeholdersResponse = await axiosInstanceDirectus.get('/application_stakeholders', {
        params: {
          fields: ['id', 'applicationId', 'email', 'role'],
          filter: {
            applicationId: {
              _in: applicationResults.map(app => app.id)
            }
          }
        }
      });
      
      const existingStakeholders = existingStakeholdersResponse.data.data || [];
      const stakeholderUpdates = [];
      
      for (const app of applicationResults) {
        const { applicationId, itOwner, businessOwner, engineeringOwner } = app.data;
        const stakeholders = [
          { email: itOwner, role: 'itOwner' },
          { email: businessOwner, role: 'businessOwner' },
          { email: engineeringOwner, role: 'engineeringOwner' }
        ].filter(s => s.email); 
        
        for (const { email, role } of stakeholders) {
          const existingStakeholder = existingStakeholders.find(
            s => s.applicationId === applicationId && s.email === email && s.role === role
          );
  
          if (existingStakeholder) {
            stakeholderUpdates.push(
              axiosInstanceDirectus.patch(`/application_stakeholders/${existingStakeholder.id}`, {
                applicationId: applicationId,
                email: email,
                role: role 
              })
            );
          } else {
            stakeholderUpdates.push(
              axiosInstanceDirectus.post('/application_stakeholders', {
                applicationId: applicationId,
                email: email,
                role: role 
              })
            );
          }
        }
      }
      
      await Promise.all(stakeholderUpdates);
  
    } catch (error) {
      console.error('Error updating stakeholders:', error);
      alert('Warning: Application data was saved but there was an issue updating stakeholders');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/landingpage')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Dashboard
        </button>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {instructions[uploadType]?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Sample {uploadType} ({sampleFormat[uploadType]?.format})
            </h3>
            <div className="flex justify-center">
              <img
                src={imageDetails.image}
                alt={`Sample ${uploadType} ${imageDetails.format}`}
                className="max-w-full h-auto border border-gray-200 rounded"
              />
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              Download a sample template <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">here</a>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
          {isUploaded ? (
            <UploadSummary
              createdCount={createdCount}
              updatedCount={updatedCount}
              uploadType={uploadType}
            />
            ) : (
              <>
              <FieldMappingConfigurationContainer 
                uploadType={uploadType}
                onMappingComplete={setMappedData}
                onFileSelect={setFile}
              />
              <UploadCSV 
                apiUrl={apiEndpoints[uploadType]} 
                file={file} 
                mappedData={mappedData}
                onUpload={handleUpload}
              />
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUploadPage;