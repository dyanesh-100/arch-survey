import axios from "axios";
import axiosInstanceDirectus from "../axiosInstanceDirectus";
import { useGlobalContext } from "../context/GlobalContext";

export const useApiService = () => {
  const {
    applications, setApplications,
    userData, setUserData,
    applicationById, setApplicationById,
    surveyData, setSurveyData,
    selectedGroupIndex, setSelectedGroupIndex,
    loading, setLoading,
    setSurveyResponseByUserId,
    setSurveyResponseByAppId
  } = useGlobalContext();


  const fetchApplications = async () => {
    try {
      if (applications.length > 0) return;
      const response = await axiosInstanceDirectus.get("/applications");
      if (response.data && Array.isArray(response.data.data)) {
        setApplications(response.data.data);
      } else {
        console.error("Invalid applications data format:", response.data);
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };


  const fetchUserData = async () => {
    try {
      if (userData && Object.keys(userData).length > 0) return;
      const response = await axios.get("http://localhost:8055/users/me", { withCredentials: true });
      if (response.data && response.data.data) {
        setUserData(response.data.data);
      } else {
        console.error("Invalid user data format:", response.data);
        setUserData({});
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const fetchApplicationById = async (applicationUUID) => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get(`/applications?filter[uuid][_eq]=${applicationUUID}`);
      if (response.data?.data?.length > 0) {
        setApplicationById(response.data.data[0]);
      } else {
        console.error("Application not found");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get("/surveys?fields=surveyId,surveyTitle,createdAt,updatedAt,question_groups.groupId,question_groups.groupName,question_groups.questions.questionId,question_groups.questions.question,question_groups.questions.responseType,question_groups.questions.fieldName,question_groups.questions.options");
      if (response.data && response.data.data.length > 0) {
        setSurveyData(response.data.data[0]);
        setSelectedGroupIndex(0);
      }
    } catch (error) {
      console.error("Error fetching survey data:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSurveyResponseByUserId = async (surveyId, userId) => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get(`survey_responses?filter[surveyId][_eq]=${surveyId}&filter[userId][_eq]=${userId}`);
      if (response.data?.data?.length > 0) {
        setSurveyResponseByUserId(response.data.data); // Store the full array
      } else {
        console.log("No response yet");
        setSurveyResponseByUserId([]); // Set an empty array instead of null
      }
    } catch (error) {
      console.log("Error fetching survey responses:", error);
      setSurveyResponseByUserId([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };
  const fetchSurveyResponseByAppId = async (surveyId, applicationId) => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get(
        `survey_responses?filter[surveyId][_eq]=${surveyId}&filter[appId][_eq]=${applicationId}`
      );
  
      if (response.data?.data?.length > 0) {
        setSurveyResponseByAppId(response.data.data); // Store the full array
      } else {
        console.log("No response yet");
        setSurveyResponseByAppId([]); // Set an empty array instead of null
      }
    } catch (error) {
      console.log("Error fetching survey responses:", error);
      setSurveyResponseByAppId([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };
  
  
  return { fetchApplications, fetchUserData, fetchApplicationById, fetchSurveyData,fetchSurveyResponseByUserId,fetchSurveyResponseByAppId };
};
