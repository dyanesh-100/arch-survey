import React from "react";
import {useNavigate } from "react-router-dom";

const FallbackScreen = ({ imageSrc, message, buttonText, onButtonClick }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <img src={imageSrc} alt="Success" className="w-40 h-40 mb-4" />
      <h2 className="text-xl font-semibold mb-2">{message}</h2>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={onButtonClick}
      >
        {buttonText}
      </button >
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => window.location.href = "/landingpage"}>Return to home</button>
    </div>
  );
};

export default FallbackScreen;
