import React from 'react';
import UploadButton from "../Components/UploadButton";
const UploadSummary = ({ createdCount, updatedCount, uploadType }) => {
  return (
    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-xl font-semibold text-green-700 mb-4">
        Upload Completed Successfully!
      </h3>
      <ul className="text-green-800 space-y-2">
        <li>
          ✅ {createdCount} new {uploadType} {createdCount === 1 ? '' : 's'} created
        </li>
        <li>
          ♻️ {updatedCount} existing {uploadType} {updatedCount === 1 ? '' : 's'} updated
        </li>
      </ul>
      <div className="flex items-center justify-between bg-blue-50 text-blue-800 rounded-lg mt-4">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-base font-medium">To re-upload the same applications with changes or upload a different set of applications.</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800 text-base font-semibold flex items-center"
        >
          Do click here
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
      <div className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors shadow-md flex justify-center mt-5">
          <UploadButton 
            label="Back to dashboard" 
            navigateTo="/landingpage"
          />
        </div>
    </div>
  );
};

export default UploadSummary;
