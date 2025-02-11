import React, { useState } from 'react'

const SurveyQuestionsComponent = ({group,questions}) => {
  
  return (
    <div className="w-3/4 p-6 pb-8 overflow-auto">
      <h2 className="text-xl font-bold mb-4">{group}</h2>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p className="font-medium">{item.question}</p>
            <div className="mt-2 space-y-2">
              {item.options.map((option, i) => (
                <label key={i} className="block">
                  <input 
                    className="mr-2" 
                    type="radio" 
                    name={`q${index}`} 
                   />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="bg-blue-500 text-white p-2 rounded" >
            Submit
        </button>
      </div>
    </div>
  )
}

export default SurveyQuestionsComponent