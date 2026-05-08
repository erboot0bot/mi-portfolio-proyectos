import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SetupBanner } from './SetupBanner'

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn()
  const supabase = {
    auth: { getSession: vi.fn() },
    from: mockFrom,
  }
  return { supabase }
})

import { supabase } from '../lib/supabase'

function makeChain(result) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  return chain
}

function setupMocks({ telegram = null, groq = null, claude = null, profile = null, dismissals = [], botUsername = null } = {}) {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
  supabase.from.mockImplementation((table) => {
    if (table === 'user_telegram_links') return makeChain({ data: telegram ? { id: '1' } : null })
    if (table === 'user_api_keys')       return makeChain({ data: { groq_key_enc: groq, anthropic_key_enc: claude } })
    if (table === 'user_onboarding_state') return makeChain({ data: profile ? { completed_at: '2026-01-01' } : null })
    if (table === 'telegram_bot_config') return makeChain({ data: botUsername ? { bot_username: botUsername } : null })
    if (table === 'user_onboarding_dismissals') {
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: dismissals.map(s => ({ step: s })) }), upsert: vi.fn().mockResolvedValue({ error: null }) }
    }
    return makeChain({ data: null })
  })
}

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('SetupBanner', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders nothing while loading (no session)', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    const { container } = wrap(<SetupBanner />)
    await waitFor(() => {})
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when all steps are complete', async () => {
    setupMocks({ telegram: true, groq: 'key', claude: 'key', profile: true })
    const { container } = wrap(<SetupBanner />)
    await waitFor(() => {})
    expect(container.firstChild).toBeNull()
  })

  it('shows Telegram step when not linked', async () => {
    setupMocks({ telegram: false })
    wrap(<SetupBanner />)
    await waitFor(() => {
      expect(screen.getByText('Conectar Telegram')).toBeInTheDocument()
    })
  })

  it('shows Groq and Claude steps when Telegram is linked but keys missing', async () => {
    setupMocks({ telegram: true, groq: null, claude: null })
    wrap(<SetupBanner />)
    await waitFor(() => {
      expect(screen.getByText('Añadir Groq key')).toBeInTheDocument()
      expect(screen.getByText('Añadir Claude key')).toBeInTheDocument()
    })
  })

  it('shows profile step only after Telegram is linked', async () => {
    setupMocks({ telegram: false })
    wrap(<SetupBanner />)
    await waitFor(() => {})
    expect(screen.queryByText(/Completar perfil/)).toBeNull()
  })

  it('shows profile step when Telegram is linked and profile not complete', async () => {
    setupMocks({ telegram: true, groq: 'k', claude: 'k', profile: false, botUsername: 'mybot' })
    wrap(<SetupBanner />)
    await waitFor(() => {
      expect(screen.getByText(/Completar perfil/)).toBeInTheDocument()
      expect(screen.getByText(/@mybot/)).toBeInTheDocument()
    })
  })

  it('hides a step after dismiss', async () => {
    setupMocks({ telegram: true, groq: null })
    wrap(<SetupBanner />)
    await waitFor(() => expect(screen.getByText('Añadir Groq key')).toBeInTheDocument())
    const dismissBtn = screen.getAllByTitle('Omitir')[0]
    fireEvent.click(dismissBtn)
    await waitFor(() => {
      expect(screen.queryByText('Añadir Groq key')).toBeNull()
    })
  })
})
