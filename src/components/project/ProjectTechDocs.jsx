const WORKFLOW_STEPS = [
  'Generación inicial mediante prompts',
  'Iteración y ajuste',
  'Refinamiento manual',
  'Validación en uso real',
]

export default function ProjectTechDocs({ project }) {
  const { documentation, meta } = project

  if (!documentation) {
    return (
      <div className="animate-fadeIn">
        <p className="text-sm text-[var(--text-faint)]">
          Documentación técnica no disponible para este proyecto.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn flex flex-col gap-8">

      {/* 1. Arquitectura y enfoque */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">Arquitectura y enfoque</h2>
        {documentation.problem && (
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-faint)] mb-1">Problema</h3>
            <p className="text-base leading-relaxed text-[var(--text-muted)]">{documentation.problem}</p>
          </div>
        )}
        {documentation.approach && (
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-faint)] mb-1">Enfoque</h3>
            <p className="text-base leading-relaxed text-[var(--text-muted)]">{documentation.approach}</p>
          </div>
        )}
      </section>

      {/* 2. Decisiones técnicas */}
      {documentation.decisions && documentation.decisions.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[var(--text)] mb-3">Decisiones técnicas</h2>
          <ul className="flex flex-col gap-2">
            {documentation.decisions.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <span className="text-[var(--accent)] mt-0.5">·</span>
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3. Resultado */}
      {documentation.result && (
        <section>
          <h2 className="text-lg font-bold text-[var(--text)] mb-3">Resultado</h2>
          <p className="text-base leading-relaxed text-[var(--text-muted)]">{documentation.result}</p>
        </section>
      )}

      {/* 4. Estado y limitaciones */}
      {meta && (
        <section>
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">Estado y limitaciones</h2>
          {meta.status && (
            <div className="mb-4">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-faint)] mb-1">Estado actual</h3>
              <p className="text-base leading-relaxed text-[var(--text-muted)]">{meta.status}</p>
            </div>
          )}
          {meta.limitations && meta.limitations.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-faint)] mb-2">Limitaciones</h3>
              <ul className="flex flex-col gap-2">
                {meta.limitations.map((l, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <span className="text-[var(--accent)] mt-0.5">·</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 5. Proceso con IA */}
      {meta && meta.aiProcess && (
        <section>
          <h2 className="text-lg font-bold text-[var(--text)] mb-3">Proceso con IA</h2>
          <p className="text-base leading-relaxed text-[var(--text-muted)] mb-4">{meta.aiProcess}</p>
          <h3 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-faint)] mb-2">Flujo de trabajo</h3>
          <ul className="flex flex-col gap-2">
            {WORKFLOW_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <span className="text-[var(--accent)] mt-0.5">·</span>
                {step}
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  )
}
