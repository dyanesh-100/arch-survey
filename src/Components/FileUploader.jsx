import React from 'react';

const FileUploader = ({ uploadType, onFileSelect, file, inputRef }) => {
  return (
    <div className="mb-6">
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => onFileSelect(e.target.files[0])}
        accept=".csv"
        className="hidden"
      />
      <button
        onClick={() => inputRef.current.click()}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
      >
        {file ? file.name : `Select CSV File`}
      </button>
    </div>
  );
};

export default FileUploader;