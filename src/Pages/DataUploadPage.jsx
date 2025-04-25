import { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-feather";
import UploadCSV from "../Components/UploadCSV";
import FieldMappingConfigurationContainer from '../Components/FieldMappingConfigurationContainer';
import questions from "../assets/Images/questions-sample.jpg";
import applications from "../assets/Images/applications-sample.jpg";
import axiosInstanceDirectus from "../axiosInstanceDirectus";

const DataUploadPage = () => {
  const { uploadType } = useParams();
  const navigate = useNavigate();
  const [mappedData, setMappedData] = useState(null);
  const [file, setFile] = useState(null);

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
  const validateEmails = (data) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEntries = [];
    data.forEach(app => {
      const invalidFields = [];
      if (app.businessOwner && !emailRegex.test(app.businessOwner)) {
        invalidFields.push('businessOwner');
      }
      if (app.itOwner && !emailRegex.test(app.itOwner)) {
        invalidFields.push('itOwner');
      }
      if (app.engineeringOwner && !emailRegex.test(app.engineeringOwner)) {
        invalidFields.push('engineeringOwner');
      }
      if (invalidFields.length > 0) {
        invalidEntries.push({
          applicationId: app.applicationId,
          applicationName: app.applicationName,
          invalidFields
        });
      }
    });
  
    return invalidEntries;
  };
  
  const handleUpload = async () => {
    if (!mappedData) {
      alert("Please complete the configuration first");
      return;
    }
    if (uploadType === 'applications') {
      const invalidEntries = validateEmails(mappedData);
      if (invalidEntries.length > 0) {
        const errorMessage = invalidEntries.map(entry => 
          `Application ${entry.applicationId} (${entry.applicationName}) has invalid emails in: ${entry.invalidFields.join(', ')}`
        ).join('\n\n');
        
        alert(`Invalid email formats found:\n\n${errorMessage}`);
        return;
      }
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
      }
      const createdCount = results.filter(r => r.action === 'created').length;
      const updatedCount = results.filter(r => r.action === 'updated').length;
      
      alert(`
        Upload completed successfully!
        ${createdCount} new ${uploadType} ${createdCount === 1 ? '' : 's'} created
        ${updatedCount} existing ${uploadType} ${updatedCount === 1 ? '' : 's'} updated
      `);
  
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error processing ${uploadType}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUploadPage;