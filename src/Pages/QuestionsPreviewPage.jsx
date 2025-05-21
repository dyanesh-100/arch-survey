import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../Context/GlobalContext";
import { useApiService } from "../Services/apiService";
import TabNavigation from "../Components/TabNavigation";
import SurveyQuestionsComponent from "../Components/SurveyQuestionsComponent";
import { ChevronDown, ChevronLeft, ChevronRight,ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuestionsPreviewPage = () => {
    const navigate = useNavigate();
    const { surveyData } = useGlobalContext();
    const { fetchSurveyData } = useApiService();
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [selectedRole, setSelectedRole] = useState("Preview as");
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const surveyRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSurveyData();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowRoleDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const roles = [
        "Preview as",
        "Business Owner",
        "IT Owner",
        "Engineering Owner"
    ];

    const getFilteredGroups = (groups, role) => {
        if (role === "Preview as") return groups;
        
        switch (role) {
            case 'Business Owner':
                return groups.filter(group => 
                    ['Business', 'Risk', 'General', 'Cost'].includes(group.groupName));
            case 'IT Owner':
                return groups.filter(group => 
                    ['Risk', 'General', 'Cost', 'Technical'].includes(group.groupName));
            case 'Engineering Owner':
                return groups.filter(group => 
                    ['General', 'Cost', 'Technical'].includes(group.groupName));
            default:
                return groups;
        }
    };
  
    const groups = surveyData ? surveyData.question_groups : [];
    const filteredGroups = getFilteredGroups(groups, selectedRole);
    const filteredGroupNames = filteredGroups.map(group => group.groupName);
    const selectedGroup = filteredGroups[selectedGroupIndex] || null;
    const isFirstGroup = selectedGroupIndex === 0;
    const isLastGroup = selectedGroupIndex === filteredGroups.length - 1;

    const handleNext = () => {
        if (!isLastGroup) {
            setSelectedGroupIndex(prev => prev + 1);
            scrollToSurvey();
        }
    };

    const handlePrevious = () => {
        if (!isFirstGroup) {
            setSelectedGroupIndex(prev => prev - 1);
            scrollToSurvey();
        }
    };

    const scrollToSurvey = () => {
        setTimeout(() => {
            surveyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1);
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setSelectedGroupIndex(0);
        setShowRoleDropdown(false);
    };

    return (
        <div className="container mx-auto p-4">
            <button 
                onClick={() => navigate('/landingpage')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
                <ArrowLeft className="mr-2" size={18} />
                Back to Dashboard
            </button>
            <div className="flex flex-col gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Survey Questions Preview</h1>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-gray-600 max-w-2xl">
                        Preview all survey questions. Navigate through question groups using tabs or navigation buttons.
                        {selectedRole !== "Preview as" && (
                            <span className="text-blue-600 font-medium ml-2">(Filtered for {selectedRole})</span>
                        )}
                    </p>

                    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                        <button
                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="flex items-center justify-between gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-48 shadow-sm"
                        >
                            <span className="truncate">{selectedRole}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showRoleDropdown && (
                            <div className="absolute right-0 mt-1 w-full sm:w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                            selectedRole === role
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TabNavigation
                ref={surveyRef}
                groups={filteredGroupNames}
                selectedGroup={selectedGroup?.groupName}
                onSelectGroup={(group) => {
                    setSelectedGroupIndex(filteredGroups.findIndex(g => g.groupName === group));
                }}
            />

            {selectedGroup && (
                <SurveyQuestionsComponent
                    group={selectedGroup.groupName}
                    questions={selectedGroup.questions}
                    responses={{}}
                    previewMode={true}
                />
            )}

            <div className="flex justify-between mt-6">
                <button
                    onClick={handlePrevious}
                    disabled={isFirstGroup}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${isFirstGroup ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLastGroup}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${isLastGroup ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default QuestionsPreviewPage;