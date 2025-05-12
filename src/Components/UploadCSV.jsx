import React from "react";

const UploadCSV = ({file, mappedData, onUpload}) => {  
  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    if (!mappedData || mappedData.length === 0) {
      alert("Please complete the field mapping first");
      return;
    }
    onUpload();
  };

  return (
    <button
      onClick={handleUpload}
      disabled={!file || !mappedData}
      className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
        !file || !mappedData
          ? "bg-green-600 hover:bg-green-700"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      Upload Data
    </button>
  );
};

export default UploadCSV;