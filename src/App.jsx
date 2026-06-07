import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import Health from './pages/legal/Health'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientForm from './pages/ClientForm'
import ClientDetail from './pages/ClientDetail'
import Programs from './pages/Programs'
import ProgramForm from './pages/ProgramForm'
import ProgramDetail from './pages/ProgramDetail'
import AssignProgram from './pages/AssignProgram'
import ClientProgramView from './pages/ClientProgramView'
import Calendar from './pages/Calendar'
import Social from './pages/Social'
import Invoices from './pages/Invoices'
import Settings from './pages/Settings'
// Trainee portal
import TraineePortal from './pages/trainee/TraineePortal'
import TraineeProgramView from './pages/trainee/TraineeProgramView'
import TraineeBookSession from './pages/trainee/TraineeBookSession'
import TraineeChat from './pages/trainee/TraineeChat'
import TraineeFoodLog from './pages/trainee/TraineeFoodLog'
import TraineeProgress from './pages/trainee/TraineeProgress'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'trainee') return <Navigate to="/trainee" replace />
  return <Layout>{children}</Layout>
}

function TraineeRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'trainee') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (!user) return children
  return <Navigate to={user.role === 'trainee' ? '/trainee' : '/dashboard'} replace />
}

export default function App() {
  return (
    <>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

            {/* Legal — always public */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms"   element={<Terms />} />
            <Route path="/health"  element={<Health />} />

            {/* Auth */}
            <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Trainer */}
            <Route path="/dashboard"                    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/clients"                      element={<PrivateRoute><Clients /></PrivateRoute>} />
            <Route path="/clients/new"                  element={<PrivateRoute><ClientForm /></PrivateRoute>} />
            <Route path="/clients/:id"                  element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
            <Route path="/clients/:id/edit"             element={<PrivateRoute><ClientForm /></PrivateRoute>} />
            <Route path="/clients/:id/assign-program"   element={<PrivateRoute><AssignProgram /></PrivateRoute>} />
            <Route path="/programs"                     element={<PrivateRoute><Programs /></PrivateRoute>} />
            <Route path="/programs/new"                 element={<PrivateRoute><ProgramForm /></PrivateRoute>} />
            <Route path="/programs/:id"                 element={<PrivateRoute><ProgramDetail /></PrivateRoute>} />
            <Route path="/programs/:id/edit"            element={<PrivateRoute><ProgramForm /></PrivateRoute>} />
            <Route path="/programs/:id/assign"          element={<PrivateRoute><AssignProgram /></PrivateRoute>} />
            <Route path="/client-programs/:id"          element={<PrivateRoute><ClientProgramView /></PrivateRoute>} />
            <Route path="/calendar"                     element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="/social"                       element={<PrivateRoute><Social /></PrivateRoute>} />
            <Route path="/invoices"                     element={<PrivateRoute><Invoices /></PrivateRoute>} />
            <Route path="/settings"                     element={<PrivateRoute><Settings /></PrivateRoute>} />

            {/* Trainee portal */}
            <Route path="/trainee"               element={<TraineeRoute><TraineePortal /></TraineeRoute>} />
            <Route path="/trainee/programs/:id"  element={<TraineeRoute><TraineeProgramView /></TraineeRoute>} />
            <Route path="/trainee/book"          element={<TraineeRoute><TraineeBookSession /></TraineeRoute>} />
            <Route path="/trainee/chat"          element={<TraineeRoute><TraineeChat /></TraineeRoute>} />
            <Route path="/trainee/food-log"      element={<TraineeRoute><TraineeFoodLog /></TraineeRoute>} />
            <Route path="/trainee/progress"      element={<TraineeRoute><TraineeProgress /></TraineeRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    <Analytics />
    </>
  )
}
