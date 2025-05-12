import React from "react";
const StatusBadge = ({ status, variant = "default" }) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    warning: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${variantClasses[variant]}`}
    >
      {status}
    </span>
  );
};

const SurveyStatus = ({ application }) => {
  const { surveyStatus, survey_responses } = application;
  if (surveyStatus === "Survey completed") {
    return <StatusBadge status="Survey closed" variant="success" />;
  }

  if (surveyStatus === "Survey not yet started") {
    return <StatusBadge status="Survey not yet started" variant="default" />;
  }

  if (surveyStatus === "Survey started") {
    return (
      <div className="flex gap-2">
        <StatusBadge status="Survey started" variant="info" />
        {survey_responses.length === 0 ? (
          <StatusBadge status="No responses yet" variant="warning" />
        ) : (
          <StatusBadge status="In progress" variant="info" />
        )}
      </div>
    );
  }

  return null;
};

export default SurveyStatus;