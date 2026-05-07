import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AppMarket from './pages/AppMarket'
import MyApps from './pages/MyApps'
import AppContainer from './pages/AppContainer'
import ChatHistory from './pages/ChatHistory'
import ChatDetail from './pages/ChatDetail'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import UserManage from './pages/admin/UserManage'
import AppManage from './pages/admin/AppManage'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<AppMarket />} />
        <Route path="/my-apps" element={<MyApps />} />
        <Route path="/app/:id" element={<AppContainer />} />
        <Route path="/chat" element={<ChatHistory />} />
        <Route path="/chat/:sessionId" element={<ChatDetail />} />
        <Route
          element={
            <PrivateRoute adminOnly>
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/users" element={<UserManage />} />
          <Route path="/admin/apps" element={<AppManage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
