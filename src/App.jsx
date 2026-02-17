import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './User/Pages/Home'
import ProjectDetails from './User/Pages/ProjectDetails'
import ActiveProjects from './User/Pages/ActiveProjects'
import CompletedProjectsListing from './User/Pages/CompletedProjectsListing'
import AboutUs from './User/Pages/AboutUs'
import Navbar from './User/Components/Navbar'
import { Routes, Route } from 'react-router-dom'
import QuickDonationModal from './User/Components/QuickDonationModal'

function App() {
  const [count, setCount] = useState(0)
  const [isQuickDonationOpen, setIsQuickDonationOpen] = useState(false)

  return (
    <>
      <Navbar onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />
      <Routes>
        <Route path="/" element={<Home onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />} />
        <Route path="/active-projects" element={<ActiveProjects />} />
        <Route path="/completed-projects" element={<CompletedProjectsListing />} />
        <Route path="/about-us" element={<AboutUs onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
      </Routes>
      {isQuickDonationOpen && <QuickDonationModal onClose={() => setIsQuickDonationOpen(false)} />}
    </>
  )
}

export default App
