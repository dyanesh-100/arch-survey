import { toast } from "react-toastify";

const UploadCSV = ({file, mappedData, onUpload}) => {  

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file first', {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!mappedData || mappedData.length === 0) {
      toast.warning('Please complete the field mapping before uploading', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }


    try {
      onUpload();
    } catch (error) {
      toast.error( {
        render: `Upload failed: ${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 6000
      });
    }
  };
  return (
   <button
      onClick={handleUpload}
      disabled={!file || !mappedData}
      className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
        !file || !mappedData
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {file && !mappedData 
        ? "Change one field to select field (i.e. default value) in file field and change back to its original field name"
        : "Upload Data"}
    </button>

  );
};

export default UploadCSV;