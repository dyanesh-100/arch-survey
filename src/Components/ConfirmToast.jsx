import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ConfirmToast = (message, onConfirm) => {
  toast.dismiss(); 
  toast.info(
    <div>
      <div className="mb-2">{message}</div>
      <div className="flex justify-center gap-4 mt-3">
        <button
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            onConfirm();
            toast.dismiss();
          }}
        >
          Delete
        </button>
        <button
          className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          onClick={() => toast.dismiss()}
        >
          Cancel
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      closeButton: false,
      closeOnClick: false,
      draggable: false,
    }
  );
};

export default ConfirmToast