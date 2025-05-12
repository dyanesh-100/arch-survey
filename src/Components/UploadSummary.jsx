// UploadSummary.jsx
import React from 'react';

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
    </div>
  );
};

export default UploadSummary;
