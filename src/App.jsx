import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import HogarLayout from './pages/hogar/HogarLayout'
import HogarHome from './pages/hogar/HogarHome'
import Calendario from './pages/hogar/Calendario'
import ListaCompra from './pages/hogar/ListaCompra'
import Recetas from './pages/hogar/Recetas'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence
        mode="wait"
        onExitComplete={() => window.scrollTo(0, 0)}
      >
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/hogar"
              element={
                <ProtectedRoute>
                  <HogarLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HogarHome />} />
              <Route path="calendario" element={<Calendario />} />
              <Route path="lista" element={<ListaCompra />} />
              <Route path="recetas" element={<Recetas />} />
            </Route>
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
