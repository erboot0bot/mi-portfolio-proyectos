import React, { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoonPage from './components/ComingSoonPage'
import { LanguageProvider } from './contexts/LanguageContext'

const LandingPage   = React.lazy(() => import('./pages/LandingPage'))
const ProjectsHome  = React.lazy(() => import('./pages/ProjectsHome'))
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'))
const Login         = React.lazy(() => import('./pages/Login'))
const NotFound      = React.lazy(() => import('./pages/NotFound'))
const Contact       = React.lazy(() => import('./pages/Contact'))
const DemoHub        = React.lazy(() => import('./pages/DemoHub'))
const DemoAppLayout  = React.lazy(() => import('./pages/app/DemoAppLayout'))

const AppsHub       = React.lazy(() => import('./pages/AppsHub'))

const AppLayout     = React.lazy(() => import('./pages/app/AppLayout'))
const Welcome       = React.lazy(() => import('./pages/app/modules/Welcome'))
const Calendar      = React.lazy(() => import('./pages/app/modules/Calendar'))
const ShoppingList  = React.lazy(() => import('./pages/app/modules/ShoppingList'))
const Menu          = React.lazy(() => import('./pages/app/modules/Menu'))
const Recipes       = React.lazy(() => import('./pages/app/modules/Recipes'))
const RecipeDetail  = React.lazy(() => import('./pages/app/modules/RecipeDetail'))
const Inventario    = React.lazy(() => import('./pages/app/modules/Inventario'))
const Limpieza      = React.lazy(() => import('./pages/app/modules/Limpieza'))

const MisMascotas          = React.lazy(() => import('./pages/app/modules/mascotas/MisMascotas'))
const PetDetail            = React.lazy(() => import('./pages/app/modules/mascotas/PetDetail'))
const MascotasAlimentacion = React.lazy(() => import('./pages/app/modules/mascotas/Alimentacion'))
const MascotasSalud        = React.lazy(() => import('./pages/app/modules/mascotas/Salud'))
const MascotasRutinas      = React.lazy(() => import('./pages/app/modules/mascotas/Rutinas'))
// Personal
const PersonalNotas  = React.lazy(() => import('./pages/app/modules/personal/Notas'))
const PersonalTareas = React.lazy(() => import('./pages/app/modules/personal/Tareas'))
const PersonalIdeas  = React.lazy(() => import('./pages/app/modules/personal/Ideas'))

// Vehículo
const MisVehiculos       = React.lazy(() => import('./pages/app/modules/vehiculo/MisVehiculos'))
const VehiculoDetail     = React.lazy(() => import('./pages/app/modules/vehiculo/VehiculoDetail'))
const VehiculoRepostajes = React.lazy(() => import('./pages/app/modules/vehiculo/Repostajes'))
const VehiculoMant       = React.lazy(() => import('./pages/app/modules/vehiculo/Mantenimiento'))
const VehiculoGastos     = React.lazy(() => import('./pages/app/modules/vehiculo/VehiculoGastos'))
const VehiculoStats      = React.lazy(() => import('./pages/app/modules/vehiculo/Estadisticas'))

// Finanzas
const FinanzasResumen       = React.lazy(() => import('./pages/app/modules/finanzas/Resumen'))
const FinanzasTransacciones = React.lazy(() => import('./pages/app/modules/finanzas/Transacciones'))
const FinanzasCategorias    = React.lazy(() => import('./pages/app/modules/finanzas/Categorias'))
const FinanzasPresupuestos  = React.lazy(() => import('./pages/app/modules/finanzas/Presupuestos'))

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
  initial: { opacity: 1, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

function getAnimKey(pathname) {
  const match = pathname.match(/^\/(app|demo)\/(\w+)/)
  if (match) return `/${match[1]}/${match[2]}`
  return pathname
}

export default function App() {
  const location = useLocation()

  return (
    <LanguageProvider>
    <ErrorBoundary>
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div
          key={getAnimKey(location.pathname)}
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
            <Route path="/courses"        element={<ComingSoonPage title="Cursos" icon="📚" waitlistKey="cursos" />} />
            <Route path="/store"          element={<ComingSoonPage title="Tienda" icon="🛒" waitlistKey="tienda" />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/contact"        element={<Contact />} />
            <Route path="/demo"           element={<DemoHub />} />

            {/* Hub de apps */}
            <Route path="/apps" element={
              <ProtectedRoute><AppsHub /></ProtectedRoute>
            } />

            {/* Hogar */}
            <Route path="/app/projects/hogar" element={<Navigate to="/app/hogar" replace />} />
            <Route path="/app/hogar" element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index                    element={<Welcome />} />
              <Route path="calendar"          element={<Calendar />} />
              <Route path="shopping"          element={<ShoppingList />} />
              <Route path="menu"              element={<Menu />} />
              <Route path="recipes"           element={<Recipes />} />
              <Route path="recipes/:recipeId" element={<RecipeDetail />} />
              <Route path="inventario"        element={<Inventario />} />
              <Route path="limpieza"          element={<Limpieza />} />
            </Route>

            {/* Mascotas */}
            <Route path="/app/mascotas" element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="mis-mascotas" replace />} />
              <Route path="mis-mascotas" element={<MisMascotas />} />
              <Route path="mis-mascotas/:petId" element={<PetDetail />}>
                <Route index element={<Navigate to="alimentacion" replace />} />
                <Route path="alimentacion" element={<MascotasAlimentacion />} />
                <Route path="salud" element={<MascotasSalud />} />
                <Route path="rutinas" element={<MascotasRutinas />} />
              </Route>
            </Route>

            {/* Personal */}
            <Route path="/app/personal" element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="calendar" replace />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="notas"    element={<PersonalNotas />} />
              <Route path="tareas"   element={<PersonalTareas />} />
              <Route path="ideas"    element={<PersonalIdeas />} />
            </Route>

            {/* Vehículo */}
            <Route path="/app/vehiculo" element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="mis-vehiculos" replace />} />
              <Route path="mis-vehiculos" element={<MisVehiculos />} />
              <Route path="mis-vehiculos/:vehicleId" element={<VehiculoDetail />}>
                <Route index element={<Navigate to="repostajes" replace />} />
                <Route path="repostajes"    element={<VehiculoRepostajes />} />
                <Route path="mantenimiento" element={<VehiculoMant />} />
                <Route path="gastos"        element={<VehiculoGastos />} />
                <Route path="estadisticas"  element={<VehiculoStats />} />
              </Route>
            </Route>

            {/* Finanzas */}
            <Route path="/app/finanzas" element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="resumen" replace />} />
              <Route path="resumen"       element={<FinanzasResumen />} />
              <Route path="transacciones" element={<FinanzasTransacciones />} />
              <Route path="categorias"    element={<FinanzasCategorias />} />
              <Route path="presupuestos"  element={<FinanzasPresupuestos />} />
            </Route>

            {/* Demo (público) */}
            <Route path="/demo/:appType" element={<DemoAppLayout />}>
              <Route path="calendar"            element={<Calendar />} />
              <Route path="shopping"            element={<ShoppingList />} />
              <Route path="menu"                element={<Menu />} />
              <Route path="recipes"             element={<Recipes />} />
              <Route path="recipes/:recipeId"   element={<RecipeDetail />} />
              <Route path="inventario"          element={<Inventario />} />
              <Route path="limpieza"            element={<Limpieza />} />
              <Route path="resumen"             element={<FinanzasResumen />} />
              <Route path="transacciones"       element={<FinanzasTransacciones />} />
              <Route path="categorias"          element={<FinanzasCategorias />} />
              <Route path="presupuestos"        element={<FinanzasPresupuestos />} />
              <Route path="notas"               element={<PersonalNotas />} />
              <Route path="tareas"              element={<PersonalTareas />} />
              <Route path="ideas"               element={<PersonalIdeas />} />
              <Route path="mis-mascotas"        element={<MisMascotas />} />
              <Route path="mis-mascotas/:petId" element={<PetDetail />}>
                <Route index element={<Navigate to="alimentacion" replace />} />
                <Route path="alimentacion" element={<MascotasAlimentacion />} />
                <Route path="salud"        element={<MascotasSalud />} />
                <Route path="rutinas"      element={<MascotasRutinas />} />
              </Route>
              <Route path="mis-vehiculos"             element={<MisVehiculos />} />
              <Route path="mis-vehiculos/:vehicleId"  element={<VehiculoDetail />}>
                <Route index element={<Navigate to="repostajes" replace />} />
                <Route path="repostajes"    element={<VehiculoRepostajes />} />
                <Route path="mantenimiento" element={<VehiculoMant />} />
                <Route path="gastos"        element={<VehiculoGastos />} />
                <Route path="estadisticas"  element={<VehiculoStats />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />

          </Routes>
        </motion.div>
      </AnimatePresence>
      </Suspense>
    </Layout>
    </ErrorBoundary>
    <Analytics />
    </LanguageProvider>
  )
}
