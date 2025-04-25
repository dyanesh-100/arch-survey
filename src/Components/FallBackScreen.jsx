import React from "react";
import { useNavigate } from "react-router-dom";

const FallbackScreen = ({ imageSrc, message, buttonText, onButtonClick }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
        <div className="mb-6">
          <img 
            src={imageSrc} 
            alt="Status" 
            className="w-48 h-48 mx-auto object-contain animate-fade-in" 
          />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{message}</h2>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 
                      transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:ring-opacity-50"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
          
          <button 
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 
                      hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none 
                      focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            onClick={() => navigate('/landingpage')}
          >
            Return to Home
          </button>
        </div>
        
        <p className="text-gray-500 text-sm mt-8">
          If you'd like to edit your response, you're welcome to do so, your previous responses are safely saved.
        </p>
      </div>
    </div>
  );
};

export default FallbackScreen;