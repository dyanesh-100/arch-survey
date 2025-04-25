import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import FileUploader from './FileUploader';
import FieldMapper from './FieldMapper';
import DataPreview from './DataPreview';

const FieldMappingConfigurationContainer = ({ uploadType, onMappingComplete, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [csvFields, setCsvFields] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [uniqueCount, setUniqueCount] = useState(0);
  const fileInputRef = useRef(null);

  const sampleDbFields = {
    applications: ["applicationId", "applicationName","applicationDescription","businessUnit","businessOwner","itOwner","engineeringOwner", "applicationDepartment"],
    questions: ["questionId", "question", "fieldName","responseType","options"]
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    onFileSelect(selectedFile);
    
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
      
        const uniqueIds = new Set();
        const validData = results.data.filter(item => {
          const idField = uploadType === 'applications' ? 'applicationId' : 'questionId';
          const id = item[idField]?.toString().trim();
          
          if (id && id !== "") {
            if (!uniqueIds.has(id)) {
              uniqueIds.add(id);
              return true;
            }
          }
          return false;
        });
        setUniqueCount(uniqueIds.size);

        if (validData.length === 0) {
          alert(`No valid ${uploadType} records found. Please check your file.`);
          return;
        }

        const headers = results.meta.fields || Object.keys(validData[0] || {});
        setCsvFields(headers);
        setMappings(
          (sampleDbFields[uploadType] || []).map(dbField => ({
            dbField,
            csvField: headers.includes(dbField) ? dbField : ""
          })
        ));
        setPreviewData(validData.slice(0, 5)); 
        onMappingComplete(validData);  
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert(`Error parsing file: ${error.message}`);
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setCsvFields([]);
    setMappings([]);
    setPreviewData([]);
    setUniqueCount(0);
    onMappingComplete([]);
    onFileSelect(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMappingChange = (newMappings) => {
    setMappings(newMappings);
    const transformed = previewData.map(row => {
      const newRow = {};
      newMappings.forEach(({ dbField, csvField }) => {
        if (csvField && dbField) {
          newRow[dbField] = row[csvField];
        }
      });
      return newRow;
    });
    onMappingComplete(transformed);
  };


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