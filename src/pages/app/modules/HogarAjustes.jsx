import { useOutletContext } from 'react-router-dom'
import { TelegramLinkCard } from '../../../components/TelegramLinkCard'
import { ApiKeysCard } from '../../../components/ApiKeysCard'

export default function HogarAjustes() {
  const { app } = useOutletContext()

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)] mb-1">Ajustes</h2>
        <p className="text-sm text-[var(--text-muted)]">{app.name}</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Integraciones
        </h3>
        <TelegramLinkCard />
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            API Keys
          </h3>
          <p className="text-xs text-[var(--text-faint)] mt-1">
            Necesarias para voz en Telegram, recetas y escaneo de tickets.
            Se cifran antes de guardarse — ni tú mismo puedes leerlas después.
          </p>
        </div>
        <ApiKeysCard />
      </section>
    </div>
  )
}
