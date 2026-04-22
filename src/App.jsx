import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoonPage from './components/ComingSoonPage'

import LandingPage   from './pages/LandingPage'
import ProjectsHome  from './pages/ProjectsHome'
import ProjectDetail from './pages/ProjectDetail'
import Login         from './pages/Login'
import NotFound      from './pages/NotFound'

import AppsHub       from './pages/AppsHub'

import HogarLayout   from './pages/app/HogarLayout'
import Welcome       from './pages/app/modules/Welcome'
import Calendar      from './pages/app/modules/Calendar'
import ShoppingList  from './pages/app/modules/ShoppingList'
import Menu          from './pages/app/modules/Menu'
import Recipes       from './pages/app/modules/Recipes'
import RecipeDetail  from './pages/app/modules/RecipeDetail'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Algo fue mal</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem',
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Volver al inicio
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
}

export default function App() {
  const location = useLocation()

  return (
    <ErrorBoundary>
    <Layout>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Routes location={location}>

            {/* Públicas */}
            <Route path="/"               element={<LandingPage />} />
            <Route path="/projects"       element={<ProjectsHome />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/courses"        element={<ComingSoonPage title="Cursos" icon="📚" />} />
            <Route path="/store"          element={<ComingSoonPage title="Tienda" icon="🛒" />} />
            <Route path="/login"          element={<Login />} />

            {/* Hub de apps */}
            <Route path="/apps" element={
              <ProtectedRoute><AppsHub /></ProtectedRoute>
            } />

            {/* Hogar */}
            <Route path="/app/projects/hogar" element={
              <ProtectedRoute><HogarLayout /></ProtectedRoute>
            }>
              <Route index                    element={<Welcome />} />
              <Route path="calendar"          element={<Calendar />} />
              <Route path="shopping"          element={<ShoppingList />} />
              <Route path="menu"              element={<Menu />} />
              <Route path="recipes"           element={<Recipes />} />
              <Route path="recipes/:recipeId" element={<RecipeDetail />} />
            </Route>

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />

          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
    </ErrorBoundary>
  )
}
