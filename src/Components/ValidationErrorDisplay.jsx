import React from 'react';

const ValidationErrorDisplay = ({ validationErrors, uniqueCount, uploadType, onDownloadFailed, onReset }) => {
  const affectedCount = calculateAffectedCount(validationErrors, uploadType);

  return (
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
                onClick={onDownloadFailed}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Download Failed Records
              </button>
              <button
                onClick={onReset}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
              >
                Reset and Choose Different File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculateAffectedCount(validationErrors, uploadType) {
  if (!validationErrors) return 0;
  
  if (uploadType === 'applications') {
    return (
      Object.keys(validationErrors.duplicateIds || {}).length +
      Object.keys(validationErrors.duplicateNames || {}).length +
      (validationErrors.invalidEmails || []).length +
      (validationErrors.missingRequiredFields || []).length
    );
  } else {
    return (
      Object.keys(validationErrors.duplicateEvaluationParams || {}).length +
      Object.keys(validationErrors.duplicateQuestions || {}).length +
      (validationErrors.missingRequiredFields || []).length
    );
  }
}

export default ValidationErrorDisplay;