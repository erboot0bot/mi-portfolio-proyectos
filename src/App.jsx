import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import AppProjects from './pages/app/Projects'
import AppProjectDetail from './pages/app/ProjectDetail'
import Calendar from './pages/app/modules/Calendar'
import Shopping from './pages/app/modules/Shopping'
import Recipes from './pages/app/modules/Recipes'
import RecipeDetail from './pages/app/modules/RecipeDetail'
import Welcome from './pages/app/modules/Welcome'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function App() {
  const location = useLocation()

  return (
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
            {/* Public portfolio routes — unchanged */}
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/login" element={<Login />} />

            {/* Protected app routes */}
            <Route
              path="/app/projects"
              element={<ProtectedRoute><AppProjects /></ProtectedRoute>}
            />
            <Route
              path="/app/projects/:slug"
              element={<ProtectedRoute><AppProjectDetail /></ProtectedRoute>}
            >
              <Route index element={<Welcome />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="shopping" element={<Shopping />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="recipes/:recipeId" element={<RecipeDetail />} />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
