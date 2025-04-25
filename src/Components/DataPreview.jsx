import React from 'react';

const DataPreview = ({ mappings, previewData }) => {
  return (
    <div>
      <h4 className="text-lg font-medium mb-3">Preview</h4>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {mappings
                .filter(m => m.dbField && m.csvField)
                .map((mapping, i) => (
                  <th key={i} className="py-2 px-4 text-left">
                    {mapping.dbField}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                {mappings
                  .filter(m => m.dbField && m.csvField)
                  .map((mapping, j) => (
                    <td key={j} className="py-2 px-4">
                      {row[mapping.csvField]}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Showing first {previewData.length} records
      </p>
    </div>
  );
};

export default DataPreview;