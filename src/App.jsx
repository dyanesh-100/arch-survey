import React from 'react'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SurveyPage from './Pages/SurveyPage'
import SurveyResponsePage from './Pages/SurveyResponsePage'

const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SurveyPage />} />
          <Route path="/responses" element={<SurveyResponsePage/>} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  )
}

export default App