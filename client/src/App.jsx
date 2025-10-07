import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar'
import { verifyUser } from './features/authentication/authenticationSlice'
import Auth from './pages/Auth'
import CICDAutomation from './pages/CICDAutomation'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import RepositoryMonitoring from './pages/RepositoryMonitoring'
import SecurityScanning from './pages/SecurityScanning'
import Webhooks from './pages/Webhooks'
import PrivateRoute from './PrivateRoute'

function App () {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(verifyUser())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Auth />} />
        <Route path='/signup' element={<Auth />} />

        <Route
          path='/dashboard'
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='/webhooks'
          element={
            <PrivateRoute>
              <Webhooks />
            </PrivateRoute>
          }
        />
        <Route path='/github/repository' element={<RepositoryMonitoring />} />
        <Route path='/github/cicd' element={<CICDAutomation />} />
        <Route path='/github/security' element={<SecurityScanning />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
