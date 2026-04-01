import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const AppLayout = lazy(() => import('@/layouts/app-layout'))
const CreateTradePage = lazy(() => import('@/pages/create-trade-page'))
const DashboardPage = lazy(() => import('@/pages/dashboard-page'))
const JoinTradePage = lazy(() => import('@/pages/join-trade-page'))
const MyTradesPage = lazy(() => import('@/pages/my-trades-page'))
const Login = lazy(() => import('@/pages/auth/Login'))
const ProfilePage = lazy(() => import('@/pages/profile-page'))
const QrScanPage = lazy(() => import('@/pages/qr-scan-page'))
const Register = lazy(() => import('@/pages/auth/Register'))
const TradeRoomPage = lazy(() => import('@/pages/trade-room-page'))

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <p className="text-sm text-muted-foreground">Loading workspace...</p>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  )
}

export default App
