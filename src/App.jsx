import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Splitwise from './pages/Splitwise'
import GroupDetails from './pages/GroupDetails'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  return (
    <>
    <ToastContainer />
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/splitwise' element={<ProtectedRoute><Splitwise /></ProtectedRoute>} />
        <Route path='/splitwise/:groupId' element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
      </Routes>
    </Router>
    </>
  )
}

export default App