import { createContext, useContext, useState, useEffect } from "react";
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [cmdbresponses, setcmdbResponses] = useState([]);
    const [otherGlobalState, setOtherGlobalState] = useState(null); 
    const [applications, setApplications] = useState([]);
    const [userData, setUserData] = useState({});
    const [userDataByEmail, setUserDataByEmail] = useState([]);
    const [applicationById, setApplicationById] = useState(null);
    const [surveyData, setSurveyData] = useState(null);
    const [stakeHoldersData, setStakeHoldersData] = useState([]);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [surveyResponseByUserId, setSurveyResponseByUserId] = useState([]);
    const [surveyResponseByAppId, setSurveyResponseByAppId] = useState([]);
    const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);
    const [isFinalResponseSubmitted, setIsFinalResponseSubmitted] = useState(false);
    const [surveyStarted, setSurveyStarted] = useState(false);
    return (
        <GlobalContext.Provider value={{ 
            surveyData, setSurveyData,
            stakeHoldersData,setStakeHoldersData,
            selectedGroupIndex, setSelectedGroupIndex,
            loading, setLoading,
            cmdbresponses, setcmdbResponses, 
            applications, setApplications,
            applicationById, setApplicationById,
            userData, setUserData,
            userDataByEmail,setUserDataByEmail,
            surveyResponseByUserId,setSurveyResponseByUserId,
            surveyResponseByAppId,setSurveyResponseByAppId,
            isSurveySubmitted, setIsSurveySubmitted,
            isFinalResponseSubmitted, setIsFinalResponseSubmitted,
            surveyStarted, setSurveyStarted,
            otherGlobalState, setOtherGlobalState 
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
