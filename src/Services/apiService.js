import axios from "axios";
import axiosInstanceDirectus from "../axiosInstanceDirectus";
import { useGlobalContext } from "../Context/GlobalContext";

export const useApiService = () => {
  const {
    applications, setApplications,
    userData, setUserData,
    userDataByEmail,setUserDataByEmail,
    applicationById, setApplicationById,
    surveyData, setSurveyData,
    stakeHoldersData,setStakeHoldersData,
    selectedGroupIndex, setSelectedGroupIndex,
    loading, setLoading,
    setSurveyResponseByUserId,
    setSurveyResponseByAppId
  } = useGlobalContext();


  const fetchApplications = async () => {
    try {
      if (applications.length > 0) return;
      const response = await axiosInstanceDirectus.get("/items/applications");
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
      const response = await axiosInstanceDirectus.get("/users/me", { withCredentials: true });
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
  const fetchUserDataByEmail = async (email) => {
    try {
      const response = await axiosInstanceDirectus.get(
        `/users?filter[email][_eq]=${email}`,
        { withCredentials: true }
      );
      if (response.data && response.data.data) {
        setUserDataByEmail(response.data.data);
        return response.data.data;
      } else {
        console.error("Invalid user data format:", response.data);
        setUserDataByEmail([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching user data", error);
      return [];
    }
  };
  const fetchApplicationById = async (applicationUUID) => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get(`/items/applications?filter[uuid][_eq]=${applicationUUID}`);
      if (response.data?.data?.length > 0) {
        setApplicationById(response.data.data[0]);
      } else {
        console.error("Application not found");
      }
    } catch (error) {
      console.error("something went wrong:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get("/items/surveys?fields=surveyId,surveyTitle,question_groups.groupId,question_groups.groupName,question_groups.questions.question_id,question_groups.questions.question,question_groups.questions.response_type,question_groups.questions.options,question_groups.questions.evaluation_parameter");
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
  const fetchStakeholdersDataByEmail = async (email) => {
    try {
      const response = await axiosInstanceDirectus.get(
        `/items/application_stakeholders?filter[email][_eq]=${email}`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };
  const fetchStakeholdersDataByApp = async (applicationId) => {
    try {
      const response = await axiosInstanceDirectus.get(
        `/items/application_stakeholders?filter[applicationId][_eq]=${applicationId}`
      );
      if (response.data && response.data.data) {
        setStakeHoldersData(response.data.data);
        return response.data.data;
      } else {
        console.error(response.data);
        setStakeHoldersData([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching user data", error);
      return [];
    }
  };
  const fetchSurveyResponseByUserId = async (surveyId, userId) => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get(`/items/survey_responses?filter[surveyId][_eq]=${surveyId}&filter[userId][_eq]=${userId}`);
      if (response.data?.data?.length > 0) {
        setSurveyResponseByUserId(response.data.data);
      } else {
        setSurveyResponseByUserId([]); 
      }
    } catch (error) {
      console.log("Error fetching survey responses:", error);
      setSurveyResponseByUserId([]); 
    } finally {
      setLoading(false);
    }
  };
  const fetchSurveyResponseByAppId = async (surveyId, applicationId) => {
    try {
      setLoading(true);
      const response = await axiosInstanceDirectus.get(
        `/items/survey_responses?filter[surveyId][_eq]=${surveyId}&filter[appId][_eq]=${applicationId}`
      );
  
      if (response.data?.data?.length > 0) {
        setSurveyResponseByAppId(response.data.data); 
      } else {
        setSurveyResponseByAppId([]); 
      }
    } catch (error) {
      console.log("Error fetching survey responses:", error);
      setSurveyResponseByAppId([]); 
    } finally {
      setLoading(false);
    }
  };
  
  
  return { fetchApplications, fetchUserData, fetchApplicationById, fetchSurveyData,fetchStakeholdersDataByEmail,fetchStakeholdersDataByApp,fetchSurveyResponseByUserId,fetchSurveyResponseByAppId,fetchUserDataByEmail };
};
