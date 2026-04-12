/*
 * App.jsx — Router root + animated page transitions
 *
 * Route tree:
 *   /                    → Home
 *   /projects/:slug      → ProjectDetail
 *   /404                 → NotFound
 *   *                    → redirect /404
 *
 * AnimatePresence wraps Routes so exit animations play before the next
 * page enters. key={location.pathname} triggers re-mount on navigation.
 * Scroll reset happens in onExitComplete (after exit animation) to avoid
 * a visual jump during the outgoing transition.
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'

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
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
