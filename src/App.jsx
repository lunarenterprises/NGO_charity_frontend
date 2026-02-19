import { useState } from 'react'
import './App.css'
import Home from './User/Pages/Home'
import ProjectDetails from './User/Pages/ProjectDetails'
import ActiveProjects from './User/Pages/ActiveProjects'
import CompletedProjectsListing from './User/Pages/CompletedProjectsListing'
import AboutUs from './User/Pages/AboutUs'
import { Routes, Route } from 'react-router-dom'
import UserLayout from './User/Layout/UserLayout'
import AdminLayout from './Admin/Layout/AdminLayout'
import AdminDashboard from './Admin/Pages/AdminDashboard'
import AdminActiveProjects from './Admin/Pages/ActiveProjects'
import AdminProjectDetails from './Admin/Pages/AdminProjectDetails'
import RecentTransactions from './Admin/Pages/RecentTransactions'
import Users from './Admin/Pages/Users'
import Enquiries from './Admin/Pages/Enquiries'
import AdminLogin from './Admin/Pages/AdminLogin'

function App() {
  const [isQuickDonationOpen, setIsQuickDonationOpen] = useState(false)

  return (
    <Routes>
      {/* Admin Login - Separate from layout */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* User Routes */}
      <Route element={<UserLayout isQuickDonationOpen={isQuickDonationOpen} setIsQuickDonationOpen={setIsQuickDonationOpen} />}>
        <Route path="/" element={<Home onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />} />
        <Route path="/active-projects" element={<ActiveProjects />} />
        <Route path="/completed-projects" element={<CompletedProjectsListing />} />
        <Route path="/about-us" element={<AboutUs onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="active-projects" element={<AdminActiveProjects />} />
        <Route path="active-projects/:id" element={<AdminProjectDetails />} />
        <Route path="completed-projects" element={<div>Completed Projects Archive (Placeholder)</div>} />
        <Route path="recent-transactions" element={<RecentTransactions />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="users" element={<Users />} />
        <Route path="banner-settings" element={<div>Admin Settings (Placeholder)</div>} />
      </Route>
    </Routes>
  )
}

export default App

