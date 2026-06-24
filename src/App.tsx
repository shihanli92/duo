import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

const Login = lazy(() => import('./routes/Login'))
const Onboarding = lazy(() => import('./routes/Onboarding'))
const Swipe = lazy(() => import('./routes/Swipe'))
const Matches = lazy(() => import('./routes/Matches'))
const AddNames = lazy(() => import('./routes/AddNames'))
const Ranking = lazy(() => import('./routes/Ranking'))
const Settings = lazy(() => import('./routes/Settings'))

function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-ink/50">Loading...</p>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/swipe" element={<Swipe />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/add-names" element={<AddNames />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/swipe" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
