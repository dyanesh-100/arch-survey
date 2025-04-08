import { createContext, useContext, useState, useEffect } from "react";
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [cmdbresponses, setcmdbResponses] = useState([]);
    const [otherGlobalState, setOtherGlobalState] = useState(null); 
    const [applications, setApplications] = useState([]);
    const [userData, setUserData] = useState({});
    const [applicationById, setApplicationById] = useState(null);
    const [surveyData, setSurveyData] = useState(null);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [surveyResponseByUserId, setSurveyResponseByUserId] = useState([]);
    const [surveyResponseByAppId, setSurveyResponseByAppId] = useState([]);
    const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);

    return (
        <GlobalContext.Provider value={{ 
            surveyData, setSurveyData,
            selectedGroupIndex, setSelectedGroupIndex,
            loading, setLoading,
            cmdbresponses, setcmdbResponses, 
            applications, setApplications,
            applicationById, setApplicationById,
            userData, setUserData,
            surveyResponseByUserId,setSurveyResponseByUserId,
            surveyResponseByAppId,setSurveyResponseByAppId,
            isSurveySubmitted, setIsSurveySubmitted,
            otherGlobalState, setOtherGlobalState 
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
