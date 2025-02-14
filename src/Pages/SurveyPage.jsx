import React, { useState } from 'react'
import SideBarComponent from '../Components/SideBarComponent';
import SurveyQuestionsComponent from '../Components/SurveyQuestionsComponent';
import surveyData from '../Config/SurveyConfig';
const SurveyPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(Object.keys(surveyData)[0])   
  return (
    <div className="flex h-screen bg-gray-100">
        <SideBarComponent
            groups={Object.keys(surveyData)}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
        />

        <SurveyQuestionsComponent
            group={selectedGroup}
            questions={surveyData[selectedGroup]}
        />
    </div>
  )
}

export default SurveyPage