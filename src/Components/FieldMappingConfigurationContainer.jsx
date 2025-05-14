import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import FileUploader from './FileUploader';
import FieldMapper from './FieldMapper';
import DataPreview from './DataPreview';
import { saveAs } from 'file-saver';
import axios from 'axios';

const FieldMappingConfigurationContainer = ({ uploadType, onMappingComplete,onUnmappedData, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [csvFields, setCsvFields] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [allParsedData, setAllParsedData] = useState([]);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState(null);
  const fileInputRef = useRef(null);

  async function getFieldsOnly(collectionName) {
    try {
      const response = await axios.get(`http://localhost:8055/fields/${collectionName}`);
      const allFields = response.data.data.map(item => item.field);
      const excludedFields = {
        applications: [
          "surveyStatus",
          "uuid",
          "application_stakeholders",
          "survey_responses",
          "unMappedCMDBFields"
        ],
        questions: [
          "id",
          "question_id",
          "user_created",
          "date_created",
          "user_updated",
          "date_updated"
        ]
      };
      return allFields.filter(field => !(excludedFields[collectionName] || []).includes(field));
    } catch (error) {
      console.error(`Error fetching fields for ${collectionName}:`, error.message);
      return [];
    }
  }
  async function buildSampleDbFields() {
    const collections = ['applications', 'questions'];
    const sampleDbFields = {};
  
    await Promise.all(
      collections.map(async (collection) => {
        sampleDbFields[collection] = await getFieldsOnly(collection);
      })
    );
  
    return sampleDbFields;
  }
  
  const getMappedField = (dbField) => {
    const mapping = mappings.find(m => m.dbField === dbField);
    return mapping ? mapping.csvField : null;
  };

  const validateData = (data) => {
    if (uploadType === 'applications') {
      const errors = {
        duplicateIds: {},
        duplicateNames: {},
        invalidEmails: [],
        missingRequiredFields: []
      };

      const idField = getMappedField('applicationId');
      const nameField = getMappedField('applicationName');
      const businessOwnerField = getMappedField('businessOwner');
      const itOwnerField = getMappedField('itOwner');
      const engineeringOwnerField = getMappedField('engineeringOwner');
      const descriptionField = getMappedField('applicationDescription');
      const businessUnitField = getMappedField('businessUnit');
      const departmentField = getMappedField('applicationDepartment');

      const idCounts = {};
      const nameCounts = {};

      data.forEach((item, index) => {
        if (idField) {
          const applicationId = item[idField];
          if (applicationId) {
            idCounts[applicationId] = (idCounts[applicationId] || 0) + 1;
          } else {
            errors.missingRequiredFields.push({
              record: index + 1,
              field: 'applicationId',
              mappedField: idField
            });
          }
        }
        
        if (nameField) {
          const applicationName = item[nameField];
          if (applicationName) {
            nameCounts[applicationName] = (nameCounts[applicationName] || 0) + 1;
          } else {
            errors.missingRequiredFields.push({
              record: index + 1,
              field: 'applicationName',
              mappedField: nameField
            });
          }
        }
        const requiredFields = [
          { field: 'businessOwner', mappedField: businessOwnerField },
          { field: 'itOwner', mappedField: itOwnerField },
          { field: 'engineeringOwner', mappedField: engineeringOwnerField },
          { field: 'applicationDescription', mappedField: descriptionField },
          { field: 'businessUnit', mappedField: businessUnitField },
          { field: 'applicationDepartment', mappedField: departmentField }
        ];

        requiredFields.forEach(({ field, mappedField }) => {
          if (mappedField && !item[mappedField]) {
            errors.missingRequiredFields.push({
              record: index + 1,
              field: field,
              mappedField: mappedField
            });
          }
        });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidFields = [];
        
        if (businessOwnerField && item[businessOwnerField] && !emailRegex.test(item[businessOwnerField])) {
          invalidFields.push('businessOwner');
        }
        if (itOwnerField && item[itOwnerField] && !emailRegex.test(item[itOwnerField])) {
          invalidFields.push('itOwner');
        }
        if (engineeringOwnerField && item[engineeringOwnerField] && !emailRegex.test(item[engineeringOwnerField])) {
          invalidFields.push('engineeringOwner');
        }
        
        if (invalidFields.length > 0) {
          errors.invalidEmails.push({
            record: index + 1,
            applicationId: idField ? item[idField] : undefined,
            applicationName: nameField ? item[nameField] : undefined,
            invalidFields
          });
        }
      });

      // Existing duplicate checks
      errors.duplicateIds = Object.fromEntries(
        Object.entries(idCounts).filter(([_, count]) => count > 1)
      );
      errors.duplicateNames = Object.fromEntries(
        Object.entries(nameCounts).filter(([_, count]) => count > 1)
      );

      const hasErrors = 
        Object.keys(errors.duplicateIds).length > 0 ||
        Object.keys(errors.duplicateNames).length > 0 ||
        errors.invalidEmails.length > 0 ||
        errors.missingRequiredFields.length > 0;
      
      return {
        isValid: !hasErrors,
        errors: hasErrors ? errors : null
      };
    }
    else if (uploadType === 'questions') {
      const errors = {
        duplicateEvaluationParams: {},
        duplicateQuestions: {},
        missingRequiredFields: []
      };

      const evaluationParamField = getMappedField('evaluation_parameter');
      const questionField = getMappedField('question');
      const questionTypeField = getMappedField('question_type');
      const responseTypeField = getMappedField('response_type');
      const optionsField = getMappedField('options');
      const questionGroupField = getMappedField('question_group');
      const weightageField = getMappedField('weightage');
      const requiredFields = [
        { dbField: 'evaluation_parameter', mappedField: evaluationParamField },
        { dbField: 'question', mappedField: questionField },
        { dbField: 'response_type', mappedField: responseTypeField },
        { dbField: 'options', mappedField: optionsField },
        { dbField: 'question_group', mappedField: questionGroupField }
      ];

      const evalParamCounts = {};
      const questionCounts = {};

      data.forEach((item, index) => {
        requiredFields.forEach(({ dbField, mappedField }) => {
          if (mappedField && !item[mappedField]) {
            errors.missingRequiredFields.push({
              record: index + 1,
              field: dbField,
              mappedField: mappedField
            });
          }
        });
        if (questionField) {
          const question = item[questionField];
          if (question) {
            questionCounts[question] = (questionCounts[question] || 0) + 1;
          } else {
            errors.missingRequiredFields.push({
              record: index + 1,
              field: 'question',
              mappedField: questionField
            });
          }
        }
        if (questionTypeField && !item[questionTypeField]) {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: 'question_type',
            mappedField: questionTypeField
          });
        }

        if (weightageField && !item[weightageField]) {
          errors.missingRequiredFields.push({
            record: index + 1,
            field: 'weightage',
            mappedField: weightageField
          });
        }
      });

      errors.duplicateEvaluationParams = Object.fromEntries(
        Object.entries(evalParamCounts).filter(([_, count]) => count > 1)
      );
      errors.duplicateQuestions = Object.fromEntries(
        Object.entries(questionCounts).filter(([_, count]) => count > 1)
      );

      const hasErrors = 
        Object.keys(errors.duplicateEvaluationParams).length > 0 ||
        Object.keys(errors.duplicateQuestions).length > 0 ||
        errors.missingRequiredFields.length > 0;

      return {
        isValid: !hasErrors,
        errors: hasErrors ? errors : null
      };
    }

    return { isValid: true };
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    onFileSelect(selectedFile);
    setValidationErrors(null);
    const sampleDbFields = await buildSampleDbFields();
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,  
      worker: true,         
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          alert("No valid data found in the file");
          return;
        }
        
        const headers = results.meta.fields || Object.keys(results.data[0] || {});
        setCsvFields(headers);
        setMappings(
          (sampleDbFields[uploadType] || []).map(dbField => ({
            dbField,
            csvField: headers.includes(dbField) ? dbField : ""
          })
        ));
        setPreviewData(results.data.slice(0, 5));
        setAllParsedData(results.data);
        setUniqueCount(results.data.length);
        onUnmappedData(results.data);
        
        const validationResult = validateData(results.data);
        if (!validationResult.isValid) {
          setValidationErrors(validationResult.errors);
        }
        
        const idField = uploadType === 'applications' ? 'applicationId' : 'questionId';
        const uniqueIds = new Set();
        results.data.forEach(item => {
          const id = item[idField]?.toString().trim();
          if (id && id !== "") {
            uniqueIds.add(id);
          }
        });
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert(`Error parsing file: ${error.message}`);
      }
    });
  };

  const downloadFailedRecords = () => {
  if (!validationErrors || !allParsedData.length) return;
  
  let recordsWithIssues = [];
  
  if (uploadType === 'applications') {
    const duplicateIds = validationErrors.duplicateIds;
    const duplicateNames = validationErrors.duplicateNames;
    
    recordsWithIssues = allParsedData.map((record, index) => {
      const issues = [];
      
      const idField = getMappedField('applicationId');
      if (idField && duplicateIds[record[idField]]) {
        issues.push(`Duplicate Application ID (${record[idField]} appears ${duplicateIds[record[idField]]} times)`);
      }
      const nameField = getMappedField('applicationName');
      if (nameField && duplicateNames[record[nameField]]) {
        issues.push(`Duplicate Application Name ("${record[nameField]}" appears ${duplicateNames[record[nameField]]} times)`);
      }
      const emailError = validationErrors.invalidEmails.find(
        err => err.record === index + 1
      );
      if (emailError) {
        emailError.invalidFields.forEach(field => {
          const fieldName = getMappedField(field);
          issues.push(`Invalid email in ${field} (${record[fieldName]})`);
        });
      }
      validationErrors.missingRequiredFields.forEach(error => {
        if (error.record === index + 1) {
          issues.push(`Missing required field: ${error.field} (mapped from ${error.mappedField})`);
        }
      });
      
      return {
        ...record,
        Reason: issues.length > 0 ? issues.join('; ') : 'Valid'
      };
    });
  } else if (uploadType === 'questions') {
    const duplicateEvalParams = validationErrors.duplicateEvaluationParams;
    const duplicateQuestions = validationErrors.duplicateQuestions;
    
    recordsWithIssues = allParsedData.map((record, index) => {
      const issues = [];
      
      const evalParamField = getMappedField('evaluation_parameter');
      if (evalParamField && duplicateEvalParams[record[evalParamField]]) {
        issues.push(`Duplicate Evaluation Parameter ("${record[evalParamField]}" appears ${duplicateEvalParams[record[evalParamField]]} times)`);
      }
      
      const questionField = getMappedField('question');
      if (questionField && duplicateQuestions[record[questionField]]) {
        issues.push(`Duplicate Question ("${record[questionField]}" appears ${duplicateQuestions[record[questionField]]} times)`);
      }
      
      validationErrors.missingRequiredFields.forEach(error => {
        if (error.record === index + 1) {
          issues.push(`Missing required field: ${error.field} (mapped from ${error.mappedField})`);
        }
      });
      
      return {
        ...record,
        Reason: issues.length > 0 ? issues.join('; ') : 'Valid'
      };
    });
  }
  
  const failedRecords = recordsWithIssues.filter(record => record.Reason !== 'Valid');
  const fields = [
    ...Object.keys(allParsedData[0] || {}),
    'Reason'
  ];
  const csv = Papa.unparse({
    fields,
    data: failedRecords
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'data_validation_errors.csv');
};

  const handleReset = () => {
    setFile(null);
    setCsvFields([]);
    setMappings([]);
    setPreviewData([]);
    setUniqueCount(0);
    setValidationErrors(null);
    onMappingComplete([]);
    onFileSelect(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleMappingChange = (newMappings) => {
    setMappings(newMappings);
    const transformed = allParsedData.map(row => {
      const newRow = {};
      newMappings.forEach(({ dbField, csvField }) => {
        if (csvField && dbField) {
          newRow[dbField] = row[csvField];
        }
      });
      return newRow;
    });
    const mappedCsvFields = newMappings
      .filter(mapping => mapping.csvField)
      .map(mapping => mapping.csvField);
    const unmappedData = allParsedData.map(row => {
      const unmappedRow = {};
      Object.keys(row).forEach(key => {
        if (!mappedCsvFields.includes(key) || 
          (uploadType === 'applications' && 
            key === newMappings.find(m => m.dbField === 'applicationId')?.csvField)) {
          unmappedRow[key] = row[key];
        }
      });
      return unmappedRow;
    });
    const validationResult = validateData(allParsedData);
    setValidationErrors(validationResult.isValid ? null : validationResult.errors);
    const validData = validationResult.isValid 
      ? transformed 
      : transformed.filter((row, index) => {
          if (!validationResult.errors) return true;
          
          if (uploadType === 'applications') {
            const rowId = row['applicationId'];
            const hasErrors = 
              (validationResult.errors.duplicateIds && validationResult.errors.duplicateIds[rowId] > 1) ||
              (validationResult.errors.duplicateNames && validationResult.errors.duplicateNames[row.applicationName] > 1) ||
              (validationResult.errors.invalidEmails && validationResult.errors.invalidEmails.some(e => e.record === index + 1)) ||
              (validationResult.errors.missingRequiredFields && validationResult.errors.missingRequiredFields.some(e => e.record === index + 1));
            
            return !hasErrors;
          } else if (uploadType === 'questions') {
            const evalParamField = getMappedField('evaluation_parameter');
            const questionField = getMappedField('question');
            
            const hasErrors = 
              (evalParamField && validationResult.errors.duplicateEvaluationParams && 
              validationResult.errors.duplicateEvaluationParams[row[evalParamField]] > 1) ||
              (questionField && validationResult.errors.duplicateQuestions && 
              validationResult.errors.duplicateQuestions[row[questionField]] > 1) ||
              (validationResult.errors.missingRequiredFields && 
              validationResult.errors.missingRequiredFields.some(e => e.record === index + 1));
            
            return !hasErrors;
          }
          
          return true;
        });
    const uniqueIds = new Set();
    validData.forEach(item => {
      const id = item[uploadType === 'applications' ? 'applicationId' : 'questionId']?.toString().trim();
      if (id) uniqueIds.add(id);
    });
    onMappingComplete(validData);
    onUnmappedData(unmappedData);
  };
  let affectedCount = 0;

  if (validationErrors) {
    if (uploadType === 'applications') {
      affectedCount = 
        Object.keys(validationErrors.duplicateIds || {}).length +
        Object.keys(validationErrors.duplicateNames || {}).length +
        (validationErrors.invalidEmails || []).length +
        (validationErrors.missingRequiredFields || []).length;
    } else {
      affectedCount = 
        Object.keys(validationErrors.duplicateEvaluationParams || {}).length +
        Object.keys(validationErrors.duplicateQuestions || {}).length +
        (validationErrors.missingRequiredFields || []).length;
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Upload the file
      </h3>
      
      <FileUploader 
        uploadType={uploadType} 
        onFileSelect={handleFileSelect} 
        file={file}
        inputRef={fileInputRef}
      />
      {validationErrors && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Validation Issues Found
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="text-blue-800 font-medium">
                  {uploadType === 'applications' ? 'Total Applications' : 'Total Questions'} Count: 
                  <span className="ml-2">{uniqueCount}</span>
                </p>
                <p>
                  Affected {uploadType === 'applications' ? 'Applications' : 'Questions'} Count: 
                  <span className="ml-2">{affectedCount}</span>
                </p>
                {uploadType === 'applications' && (
                  <>
                    {validationErrors.duplicateIds && Object.keys(validationErrors.duplicateIds).length > 0 && (
                      <p>
                        Duplicate Application IDs: {Object.keys(validationErrors.duplicateIds).join(', ')}
                      </p>
                    )}
                    {validationErrors.duplicateNames && Object.keys(validationErrors.duplicateNames).length > 0 && (
                      <p>
                        Duplicate Application Names: {Object.keys(validationErrors.duplicateNames).join(', ')}
                      </p>
                    )}
                    {validationErrors.invalidEmails && validationErrors.invalidEmails.length > 0 && (
                      <p>
                        Invalid emails found in {validationErrors.invalidEmails.length} records
                      </p>
                    )}
                  </>
                )}
                {uploadType === 'questions' && (
                  <>
                    {validationErrors.duplicateEvaluationParams && Object.keys(validationErrors.duplicateEvaluationParams).length > 0 && (
                      <p>
                        Duplicate Evaluation Parameters: {Object.keys(validationErrors.duplicateEvaluationParams).join(', ')}
                      </p>
                    )}
                    {validationErrors.duplicateQuestions && Object.keys(validationErrors.duplicateQuestions).length > 0 && (
                      <p>
                        Duplicate Questions: {Object.keys(validationErrors.duplicateQuestions).join(', ')}
                      </p>
                    )}
                  </>
                )}
                {validationErrors.missingRequiredFields && validationErrors.missingRequiredFields.length > 0 && (
                  <div>
                    <p>Missing required fields in {validationErrors.missingRequiredFields.length} records:</p>
                    <ul className="list-disc pl-5">
                      {validationErrors.missingRequiredFields
                        .filter((value, index, self) => 
                          index === self.findIndex((t) => (
                            t.field === value.field
                          ))
                        )
                        .map((error, i) => (
                          <li key={i}>
                            Field "{error.field}" missing in {validationErrors.missingRequiredFields.filter(e => e.field === error.field).length} records
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )}
                <div className="flex flex-col items-start gap-2 w-full max-w-xs mt-3">
                  <button
                    onClick={downloadFailedRecords}
                    className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Download Failed Records
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                  >
                    Reset and Choose Different File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {csvFields.length > 0 && (
        <>
          <FieldMapper
            mappings={mappings}
            csvFields={csvFields}
            onMappingChange={handleMappingChange}
          />

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-800 font-medium">
               {uploadType === 'applications' ? 'Applications' : 'Questions'} Count: 
              <span className="ml-2 text-blue-600">{uniqueCount}</span>
            </p>
          </div>
          {previewData.length > 0 && (
            <DataPreview mappings={mappings} previewData={previewData} />
          )}
          <button
            onClick={handleReset}
            className="w-full py-2 px-5 mb-5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
          >
            Reset and Choose Different File
          </button>
        </>
      )}
    </div>
  );
};

export default FieldMappingConfigurationContainer;