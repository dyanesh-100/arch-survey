import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationList from "../Components/ApplicationList";
import LogoutButton from "../Components/LogoutButton";
import { useGlobalContext } from "../context/GlobalContext"; 
import { useApiService } from "../Services/apiService";

const ApplicationSearchPage = () => {
  
  const { applications,userData} = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { fetchApplications,fetchUserData } = useApiService();
  useEffect(() => {
    if (!userData || Object.keys(userData).length === 0) {
      fetchUserData();
    }
  }, [userData, fetchUserData]);
  useEffect(() => {
    fetchApplications(); 
  }, []);
  const filteredApplications = applications?.filter((application) => 
    application?.applicationName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <nav className="flex mb-2 justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Search Applications</h2>
        <LogoutButton/>
      </nav>
      <input
        type="text"
        placeholder="Search applications..."
        className="p-2 w-full border rounded mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ApplicationList 
        applications={filteredApplications} 
        onSelect={(app) => navigate(`/survey/${app.uuid}`)} 
      />
      <div className="flex gap-5">
        <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={() => navigate("/responses")}>
          View responses
        </button>
        {/* <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={() => navigate("/fieldmapping")}>
          Config
        </button> */}
      </div>
    </div>
  );
};

export default ApplicationSearchPage;
