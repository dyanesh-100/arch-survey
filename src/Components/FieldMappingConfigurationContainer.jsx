import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import FileUploader from './FileUploader';
import FieldMapper from './FieldMapper';
import DataPreview from './DataPreview';
import DataValidator from './DataValidator';
import ValidationErrorDisplay from './ValidationErrorDisplay';
import { saveAs } from 'file-saver';
import { buildSampleDbFields, getMappedField } from '../Utils/fieldMappingUtils';
import { toast } from 'react-toastify';

const FieldMappingConfigurationContainer = ({ uploadType, onMappingComplete, onUnmappedData, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [csvFields, setCsvFields] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [allParsedData, setAllParsedData] = useState([]);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    
    const toastId = toast.loading('Processing file...');

    try {
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
            toast.update(toastId, {
              render: 'No valid data found in the uploaded file',
              type: 'warning',
              isLoading: false,
              autoClose: 4000
            });
            return;
          }
          
          const headers = results.meta.fields || Object.keys(results.data[0] || {});
          setCsvFields(headers);
          setMappings(
            (sampleDbFields[uploadType] || []).map(dbField => ({
              dbField,
              csvField: headers.includes(dbField) ? dbField : ""
            }))
          );
          
          setPreviewData(results.data.slice(0, 5));
          setAllParsedData(results.data);
          setUniqueCount(results.data.length);
          onUnmappedData(results.data);
          
          const validationResult = DataValidator.validateData(results.data, mappings, uploadType, getMappedField);
          if (!validationResult.isValid) {
            setValidationErrors(validationResult.errors);
            toast.update(toastId, {
              render: 'File processed with validation errors',
              type: 'info',
              isLoading: false,
              autoClose: 4000
            });
          } else {
            toast.update(toastId, {
              render: 'File processed successfully!',
              type: 'success',
              isLoading: false,
              autoClose: 3000
            });
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast.update(toastId, {
            render: `File parsing failed: ${error.message}`,
            type: 'error',
            isLoading: false,
            autoClose: 6000
          });
        }
      });
    } catch (error) {
      toast.update(toastId, {
        render: `Error processing file: ${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 6000
      });
    }
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
    
    toast.info('File upload reset', {
      position: 'top-right',
      autoClose: 3000
    });
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
    
    const validationResult = DataValidator.validateData(allParsedData, newMappings, uploadType, getMappedField);
    setValidationErrors(validationResult.isValid ? null : validationResult.errors);
    if (!validationResult.isValid) {
      toast.warning('Some fields require attention', {
        position: 'top-right',
        autoClose: 4000
      });
    }
    const validData = validationResult.isValid 
      ? transformed 
      : DataValidator.filterValidData(transformed, validationResult.errors, uploadType, newMappings);
    
    onMappingComplete(validData);
    onUnmappedData(unmappedData);
  };

  const downloadFailedRecords = () => {
    if (!validationErrors || !allParsedData.length) {
      toast.warn('No validation errors to download', {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }
    
    try {
      const failedRecords = DataValidator.getFailedRecords(allParsedData, validationErrors, mappings, uploadType, getMappedField);
      
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
      
      toast.success('Error report downloaded');
    } catch (error) {
      toast.error(`Failed to generate error report: ${error.message}`);
    }
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
      
      {validationErrors && (
        <ValidationErrorDisplay 
          validationErrors={validationErrors}
          uniqueCount={uniqueCount}
          uploadType={uploadType}
          onDownloadFailed={downloadFailedRecords}
          onReset={handleReset}
        />
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