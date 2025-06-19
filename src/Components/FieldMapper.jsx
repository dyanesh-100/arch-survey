import React from 'react';
import { Trash2 } from 'lucide-react';

const FieldMapper = ({ 
  mappings, 
  csvFields, 
  onMappingChange,  
  onDeleteMapping 
}) => {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-medium mb-3">Field Mappings</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">System Field</th>
              <th className="py-2 px-4 text-left">File Field</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  <input
                    type="text"
                    disabled
                    value={mapping.dbField}
                    onChange={(e) => {
                      const newMappings = [...mappings];
                      newMappings[index].dbField = e.target.value;
                      onMappingChange(newMappings);
                    }}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="py-2 px-4">
                  <select
                    value={mapping.csvField}
                    onChange={(e) => {
                      const newMappings = [...mappings];
                      newMappings[index].csvField = e.target.value;
                      onMappingChange(newMappings);
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select field</option>
                    {csvFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default FieldMapper;