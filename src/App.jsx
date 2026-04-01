import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/layouts/app-layout'
import CreateTradePage from '@/pages/create-trade-page'
import DashboardPage from '@/pages/dashboard-page'
import JoinTradePage from '@/pages/join-trade-page'
import MyTradesPage from '@/pages/my-trades-page'
import Login from '@/pages/auth/Login'
import ProfilePage from '@/pages/profile-page'
import QrScanPage from '@/pages/qr-scan-page'
import Register from '@/pages/auth/Register'
import TradeRoomPage from '@/pages/trade-room-page'

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/auth-page" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/create-trade" element={<CreateTradePage />} />
        <Route path="/join-trade" element={<JoinTradePage />} />
        <Route path="/trade-room" element={<TradeRoomPage />} />
        <Route path="/my-trades" element={<MyTradesPage />} />
        <Route path="/qr-scan" element={<QrScanPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
