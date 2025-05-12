import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import FileUploader from './FileUploader';
import FieldMapper from './FieldMapper';
import DataPreview from './DataPreview';
import { saveAs } from 'file-saver';

const FieldMappingConfigurationContainer = ({ uploadType, onMappingComplete, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [csvFields, setCsvFields] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [allParsedData, setAllParsedData] = useState([]);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState(null);
  const fileInputRef = useRef(null);

  const sampleDbFields = {
    applications: ["applicationId", "applicationName","applicationDescription","businessUnit","businessOwner","itOwner","engineeringOwner", "applicationDepartment"],
    questions: ["question", "evaluation_parameter","response_type","options","question_group"]
  };

  const getMappedField = (dbField) => {
    const mapping = mappings.find(m => m.dbField === dbField);
    return mapping ? mapping.csvField : null;
  };

  const validateData = (data) => {
    if (uploadType !== 'applications') return { isValid: true };
    
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
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    onFileSelect(selectedFile);
    setValidationErrors(null);
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
    
    const duplicateIds = validationErrors.duplicateIds;
    const duplicateNames = validationErrors.duplicateNames;
    
    const recordsWithIssues = allParsedData.map((record, index) => {
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
    
    // Transform preview data with new mappings
    const transformed = previewData.map(row => {
      const newRow = {};
      newMappings.forEach(({ dbField, csvField }) => {
        if (csvField && dbField) {
          newRow[dbField] = row[csvField];
        }
      });
      return newRow;
    });
    
    // Validate with new mappings
    const validationResult = validateData(allParsedData);
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
    } else {
      setValidationErrors(null);
    }
    
    // Calculate unique count based on mapped ID field
    const idField = uploadType === 'applications' ? 'applicationId' : 'questionId';
    const mappedIdField = newMappings.find(m => m.dbField === idField)?.csvField;
    const uniqueIds = new Set();
    
    if (mappedIdField) {
      allParsedData.forEach(item => {
        const id = item[mappedIdField]?.toString().trim();
        if (id && id !== "") {
          uniqueIds.add(id);
        }
      });
      
    }
    
    onMappingComplete(transformed);
  };

  const affectedCount = validationErrors 
    ? (Object.keys(validationErrors.duplicateIds).length +
       Object.keys(validationErrors.duplicateNames).length +
       validationErrors.invalidEmails.length +
       validationErrors.missingRequiredFields.length)
    : 0;

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
                  {uploadType === 'applications' ? 'Total Application' : 'Questions'} Count: 
                  <span className="ml-2">{uniqueCount}</span>
                </p>
                <p>
                  {uploadType === 'applications' ? 'Total affected Application' : 'Questions'} Count: 
                  <span className="ml-2">{affectedCount}</span>
                </p>
                {Object.keys(validationErrors.duplicateIds).length > 0 && (
                  <p>
                    Duplicate Application IDs: {Object.keys(validationErrors.duplicateIds).join(', ')}
                  </p>
                )}
                {Object.keys(validationErrors.duplicateNames).length > 0 && (
                  <p>
                    Duplicate Application Names: {Object.keys(validationErrors.duplicateNames).join(', ')}
                  </p>
                )}
                {validationErrors.invalidEmails.length > 0 && (
                  <p>
                    Invalid emails found in {validationErrors.invalidEmails.length} records
                  </p>
                )}
                {validationErrors.missingRequiredFields.length > 0 && (
                  <p>
                    Missing required fields in {validationErrors.missingRequiredFields.length} records
                  </p>
                )}
                <div className="flex flex-col items-start gap-2 w-full max-w-xs">
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