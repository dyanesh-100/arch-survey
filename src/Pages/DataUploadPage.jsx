import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-feather";
import UploadCSV from "../Components/UploadCSV";
import UploadSummary from "../Components/UploadSummary"
import FieldMappingConfigurationContainer from '../Components/FieldMappingConfigurationContainer';
import questions from "../assets/Images/questions-sample.jpg";
import applications from "../assets/Images/applications-sample.jpg";
import axiosInstanceDirectus from "../axiosInstanceDirectus";
import { useApiService } from "../Services/apiService";

const DataUploadPage = () => {
  const { fetchApplications } = useApiService();
  const { uploadType } = useParams();
  const navigate = useNavigate();
  const [mappedData, setMappedData] = useState(null); 
  const [unMappedData, setUnMappedData] = useState(null); 
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const apiEndpoints = {
    applications: "/items/applications",
    questions: "/items/questions",
  };
  const instructions = {
    applications: [
      "Ensure the file is in CSV (.csv) format",
      "File size should not exceed 5MB",
      "The first row should contain column headers",
      "Required fields: application_name, application_id, application_description, application_department, business_unit, All the three stakeholder's email",
      "If all the fields mapped already, To test field validation, Change one field to select field (i.e. default value) in file field and change back to its original field name"
    ],
    questions: [
      "Ensure the file is in CSV (.csv) format",
      "File size should not exceed 5MB",
      "The first row should be column headers",
      "Required fields: question,evaluation_parameter, response_type, options,question_group",
      "If all the fields mapped already, To test field validation, Change one field to select field (i.e. default value) in file field and change back to its original field name"

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

  const mapQuestionGroupToId = (questionGroup) => {
    const groupMappings = {
      'general': 'grp-100',
      'business': 'grp-101',
      'technical': 'grp-102',
      'risk': 'grp-103',
      'cost': 'grp-104'
    };
    if (groupMappings[questionGroup]) {
      return groupMappings[questionGroup];
    }

    const existingGroups = Object.keys(groupMappings);
    const nextIdNumber = 105 + (existingGroups.length - 5);
    return `grp-${nextIdNumber}`;
  };
  useEffect(() => {
    const uploadInfoRaw = localStorage.getItem("uploadInfo");

    if (uploadInfoRaw) {
      const uploadInfo = JSON.parse(uploadInfoRaw);

      if (uploadInfo.markUploaded) {
        setIsUploaded(true);
        setCreatedCount?.(uploadInfo.createdCount);
        setUpdatedCount?.(uploadInfo.updatedCount);
      }

      localStorage.removeItem("uploadInfo"); 
    }
  }, []);
  const transformQuestionsData = (data) => {
    return data.map(item => {
      const transformedItem = { ...item };
      if (item.question_group) {
        transformedItem.question_group = mapQuestionGroupToId(item.question_group);
      }
      
      return transformedItem;
    });
  };
  const handleUpload = async () => {
    if (!mappedData) {
      toast.warning('Please complete the configuration before proceeding');
      return;
    }
    
    try {
      setIsUploading(true);
      if (uploadType === 'questions' || uploadType === 'applications') {
        await handleGroupsUpload();
      }
      const dataToUpload = uploadType === 'questions' 
        ? transformQuestionsData(mappedData) 
        : mappedData;
      const fieldKey = uploadType === 'applications' ? 'applicationId' : 'evaluation_parameter';
      const existingItemsResponse = await axiosInstanceDirectus.get(`/items/${uploadType}`, {
        params: {
          fields: uploadType === 'applications' ? ['applicationId'] : ['id', 'evaluation_parameter'],
          filter: {
            [fieldKey]: {
              _in: dataToUpload.map(item => item[fieldKey])
            }
          }
        }
      });
      
      const existingItemsMap = uploadType === 'applications'
        ? (existingItemsResponse.data.data || []).map(item => item.applicationId)
        : (existingItemsResponse.data.data || []).reduce((acc, item) => {
            acc[item.evaluation_parameter] = item.id;
            return acc;
          }, {});

      const results = await Promise.all(
        dataToUpload.map(async (item) => {
          const endpoint = `/items/${uploadType}`;
          const isUpdate = uploadType === 'applications'
            ? existingItemsMap.includes(item.applicationId)
            : !!existingItemsMap[item.evaluation_parameter];
          
          const updateId = uploadType === 'applications'
            ? item.applicationId
            : existingItemsMap[item.evaluation_parameter];

          if (isUpdate) {
            const updateResponse = await axiosInstanceDirectus.patch(
              `${endpoint}/${updateId}`,
              item,
              {
                headers: {
                  "Content-Type": "application/json",
                }
              }
            );
            return {
              action: 'updated',
              id: updateId,
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
              id: uploadType === 'applications' ? item.applicationId : item.evaluation_parameter,
              name: uploadType === 'applications' ? item.applicationName : item.question,
              response: createResponse,
              data: item 
            };
          }
        })
      );

      if (uploadType === 'applications') {
        await handleApplicationStakeholders(results);
        if (unMappedData) {
          await handleUnMappedFields(unMappedData);
        }
      }
      if (uploadType === 'questions' || uploadType === 'applications') {
        await handleDefaultAppQuestions();
      }

      const createdCount = results.filter(r => r.action === 'created').length;
      const updatedCount = results.filter(r => r.action === 'updated').length;
      const uploadInfo = {
        markUploaded: true,
        createdCount,
        updatedCount
      };

      localStorage.setItem("uploadInfo", JSON.stringify(uploadInfo));
      window.location.reload();

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      toast.error(`Upload failed: ${errorMessage}`);
    }
    finally {
      setIsUploading(false);
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
      },
      {
        question_id: "q-2006",
        question: "Who is the Engineering owner of the application?",
        response_type: "text",
        evaluation_parameter: "engineering_owner",
        options: [],
        question_group: "grp-100",
      }
    ];
    try {
      const { data } = await axiosInstanceDirectus.get('/items/questions', {
        params: {
          fields: 'question_id',
          limit: -1
        }
      });
      const existingQuestionIds = new Set(data.data.map(q => q.question_id));
      const allExist = defaultQuestions.every(q => existingQuestionIds.has(q.question_id));
      if (allExist) {
        return;
      }
      const noneExist = defaultQuestions.every(q => !existingQuestionIds.has(q.question_id));
      if (noneExist) {
        const responses = await Promise.all(
          defaultQuestions.map((question) =>
            axiosInstanceDirectus.post('/items/questions', question)
          )
        );
      } else {
        console.log("Some default questions already exist. Skipping post.");
      }
    } catch (error) {
      console.error("Error processing default questions:", error);
    }
  };
  const handleGroupsUpload = async () => {
    const groups = [
      {
        groupId: "grp-100",
        groupName: "General",
        survey: "survey-101",
      },
      {
        groupId: "grp-101",
        groupName: "Business",
        survey: "survey-101",
      },
      {
        groupId: "grp-102",
        groupName: "Technical",
        survey: "survey-101",
      },
      {
        groupId: "grp-103",
        groupName: "Risk",
        survey: "survey-101",
      },
      {
        groupId: "grp-104",
        groupName: "Cost",
        survey: "survey-101",
      },
    ];

    try {
      const { data } = await axiosInstanceDirectus.get('/items/question_groups', {
        params: {
          fields: 'groupId',
          limit: -1
        }
      });
      
      const existingGroupIds = new Set(data.data.map(g => g.groupId));
      const allExist = groups.every(g => existingGroupIds.has(g.groupId));
      
      if (allExist) {
        return;
      }
      
      const noneExist = groups.every(g => !existingGroupIds.has(g.groupId));
      
      if (noneExist) {
        const responses = await Promise.all(
          groups.map((group) =>
            axiosInstanceDirectus.post('/items/question_groups', group)
          )
        );
      } else {
        const groupsToCreate = groups.filter(g => !existingGroupIds.has(g.groupId));
        const responses = await Promise.all(
          groupsToCreate.map((group) =>
            axiosInstanceDirectus.post('/items/question_groups', group)
          )
        );
      }
    } catch (error) {
      console.error("Error processing question groups:", error);
    }
  };
  const handleApplicationStakeholders = async (applicationResults) => {
    try {
      const existingStakeholdersResponse = await axiosInstanceDirectus.get('/items/application_stakeholders', {
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
              axiosInstanceDirectus.patch(`/items/application_stakeholders/${existingStakeholder.id}`, {
                applicationId: applicationId,
                email: email,
                role: role 
              })
            );
          } else {
            stakeholderUpdates.push(
              axiosInstanceDirectus.post('/items/application_stakeholders', {
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
      toast.warning('Application data was saved, but stakeholders could not be updated', {
        autoClose: 7000  
      });
    }
  };
  const handleUnMappedFields = async (unMappedData) => {
    try {
      for (const item of unMappedData) {
        const { appId, ...fields } = item;

        try {
          const response = await axiosInstanceDirectus.get(`/items/applications/${appId}`);
          const currentApp = response.data.data;
          const updatedFields = {
            unMappedCMDBFields: {
              ...(currentApp.unMappedCMDBFields || {}), 
              ...fields,                               
            },
          };

          await axiosInstanceDirectus.patch(`/items/applications/${appId}`, updatedFields);
        } catch (error) {
          console.error(`Skipped appId ${appId}:`, error.message);
        }
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/landingpage')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 cursor-pointer"
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
            {isUploading ? (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-700">Processing upload, please wait...</p>
              </div>
            ) : isUploaded ? (
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
                  onUnmappedData={setUnMappedData}
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