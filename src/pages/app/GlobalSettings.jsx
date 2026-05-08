import { NavLink } from 'react-router-dom'
import { TelegramLinkCard } from '../../components/TelegramLinkCard'
import { ApiKeysCard } from '../../components/ApiKeysCard'

export default function GlobalSettings() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
      <NavLink
        to="/apps"
        className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        ← Mis Apps
      </NavLink>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">Ajustes</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Configuración global de tu cuenta</p>
      </div>

      <div className="max-w-lg space-y-10">

        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Integraciones
          </h2>
          <TelegramLinkCard />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              API Keys
            </h2>
            <p className="text-xs text-[var(--text-faint)] mt-1">
              Tus keys se cifran antes de guardarse y nunca se pueden leer de vuelta.
              Son necesarias para usar funciones de IA (voz, recetas, tickets).
            </p>
          </div>
          <ApiKeysCard />
        </section>

      </div>
    </div>
  )
}
