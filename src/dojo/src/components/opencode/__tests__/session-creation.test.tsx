import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { SessionCreation } from '../session-creation'
import { useSessionStore } from '@/lib/session-store'
import { mockProviders, mockSessionTemplates } from '@/test/mocks/data'

vi.mock('@/lib/session-store')

const mockUseSessionStore = useSessionStore as vi.MockedFunction<typeof useSessionStore>

describe('SessionCreation', () => {
  const mockStore = {
    providers: mockProviders,
    isLoadingProviders: false,
    activeProvider: 'anthropic',
    sessionTemplates: mockSessionTemplates,
    actions: {
      createSession: vi.fn(),
      loadProviders: vi.fn(),
      setActiveProvider: vi.fn(),
    }
  }

  const mockOnSessionCreated = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    mockUseSessionStore.mockReturnValue(mockStore as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders session creation form', () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText('Create New Session')).toBeInTheDocument()
    expect(screen.getByLabelText(/session name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/provider/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create session/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('displays available providers in dropdown', async () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    const providerSelect = screen.getByLabelText(/provider/i)
    await userEvent.click(providerSelect)
    
    await waitFor(() => {
      expect(screen.getByText('Anthropic')).toBeInTheDocument()
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
      expect(screen.getByText('Groq')).toBeInTheDocument()
    })
  })

  it('updates available models when provider changes', async () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    const providerSelect = screen.getByLabelText(/provider/i)
    await userEvent.click(providerSelect)
    await userEvent.click(screen.getByText('OpenAI'))
    
    // Check that OpenAI models are now available
    const modelSelect = screen.getByLabelText(/model/i)
    await userEvent.click(modelSelect)
    
    await waitFor(() => {
      expect(screen.getByText('gpt-4o')).toBeInTheDocument()
      expect(screen.getByText('gpt-4o-mini')).toBeInTheDocument()
    })
  })

  it('creates session with correct configuration', async () => {
    const mockCreateSession = vi.fn().mockResolvedValue({
      id: 'new-session-id',
      name: 'Test Session',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022'
    })

    mockUseSessionStore.mockReturnValue({
      ...mockStore,
      actions: {
        ...mockStore.actions,
        createSession: mockCreateSession
      }
    } as any)

    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/session name/i), 'Test Session')
    
    const providerSelect = screen.getByLabelText(/provider/i)
    await userEvent.click(providerSelect)
    await userEvent.click(screen.getByText('Anthropic'))
    
    const modelSelect = screen.getByLabelText(/model/i)
    await userEvent.click(modelSelect)
    await userEvent.click(screen.getByText('claude-3-5-sonnet-20241022'))
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create session/i }))
    
    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledWith({
        name: 'Test Session',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        temperature: 0.7
      })
      expect(mockOnSessionCreated).toHaveBeenCalled()
    })
  })

  it('handles session creation failure', async () => {
    const mockCreateSession = vi.fn().mockRejectedValue(new Error('Creation failed'))

    mockUseSessionStore.mockReturnValue({
      ...mockStore,
      actions: {
        ...mockStore.actions,
        createSession: mockCreateSession
      }
    } as any)

    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/session name/i), 'Test Session')
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create session/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/failed to create session/i)).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Try to submit without filling required fields
    await userEvent.click(screen.getByRole('button', { name: /create session/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/session name is required/i)).toBeInTheDocument()
    })
  })

  it('uses session template when selected', async () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Select a template
    const templateSelect = screen.getByLabelText(/template/i)
    await userEvent.click(templateSelect)
    await userEvent.click(screen.getByText('React Development'))
    
    await waitFor(() => {
      // Check that template values are populated
      expect((screen.getByLabelText(/session name/i) as HTMLInputElement).value).toBe('React Development')
      expect(screen.getByDisplayValue('anthropic')).toBeInTheDocument()
      expect(screen.getByDisplayValue('claude-3-5-sonnet-20241022')).toBeInTheDocument()
    })
  })

  it('handles cancel action', async () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows loading state during session creation', async () => {
    const mockCreateSession = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    mockUseSessionStore.mockReturnValue({
      ...mockStore,
      actions: {
        ...mockStore.actions,
        createSession: mockCreateSession
      }
    } as any)

    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/session name/i), 'Test Session')
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /create session/i }))
    
    // Check for loading state
    expect(screen.getByText(/creating session/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create session/i })).toBeDisabled()
  })

  it('has accessible form elements', async () => {
    const { container } = render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Check for proper form structure
    expect(screen.getByRole('form')).toBeInTheDocument()
    
    // Check that all form elements have proper labels
    expect(screen.getByLabelText(/session name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/provider/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument()
    
    // Run accessibility check
    const { checkAccessibility } = await import('@/test/utils')
    const results = await checkAccessibility(container)
    expect(results).toHaveNoViolations()
  })

  it('configures advanced options', async () => {
    render(
      <SessionCreation
        onSessionCreated={mockOnSessionCreated}
        onCancel={mockOnCancel}
      />
    )
    
    // Expand advanced options
    const advancedToggle = screen.getByText(/advanced options/i)
    await userEvent.click(advancedToggle)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/max tokens/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument()
    })
    
    // Adjust settings
    const temperatureInput = screen.getByLabelText(/temperature/i)
    await userEvent.clear(temperatureInput)
    await userEvent.type(temperatureInput, '0.5')
    
    const maxTokensInput = screen.getByLabelText(/max tokens/i)
    await userEvent.clear(maxTokensInput)
    await userEvent.type(maxTokensInput, '4000')
    
    expect((temperatureInput as HTMLInputElement).value).toBe('0.5')
    expect((maxTokensInput as HTMLInputElement).value).toBe('4000')
  })
})