# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Dojo (OpenCode Desktop UI - Claudia UI ported to TypeScript)
```bash
cd src/dojo
pnpm install
pnpm run dev             # Next.js development server
pnpm run build           # Production build
pnpm run lint            # ESLint
pnpm run test            # Run test suite (Vitest)
pnpm run test:e2e        # End-to-end tests (Playwright)
pnpm run test:coverage   # Test coverage report
```

### Documentation
```bash
cd docs
mintlify dev --port=4000  # Development server
```

## Architecture Overview

This repository contains multiple interconnected projects focused on AI coding agents and desktop interfaces:

### 1. Claudia (Desktop GUI for Claude Code)
- **Tech Stack**: Tauri 2 + React 18 + TypeScript + Rust backend
- **Purpose**: Powerful desktop GUI for Claude Code with advanced features
- **Key Features**: 
  - Project & session management with visual timeline
  - Custom AI agents with sandboxed execution
  - Usage analytics dashboard with cost tracking
  - MCP server management
  - Advanced security with OS-level sandboxing

### 2. OpenCode (Multi-Provider AI Agent)
- **Tech Stack**: TypeScript + Go TUI + Client/Server architecture
- **Purpose**: Open-source terminal AI agent supporting 75+ providers
- **Key Components**:
  - `packages/opencode/`: Core TypeScript implementation
  - `packages/tui/`: Go-based terminal user interface
  - `packages/web/`: Astro-based documentation site
  - `packages/function/`: API functions

### 3. Dojo (OpenCode Desktop UI)
- **Tech Stack**: Next.js 15 + TypeScript + OpenCode API integration
- **Purpose**: Desktop GUI for OpenCode multi-provider AI agent system  
- **Features**: 
  - Multi-provider session management (75+ AI providers)
  - Real-time chat interface with tool execution approval
  - Usage analytics dashboard with cost tracking
  - Configuration management with JSON schema validation
  - MCP server integration and management
  - Enhanced security with tool sandboxing
  - Responsive design with dark/light theme support

## Key Configuration Files

### OpenCode Configuration
- `code/opencode/opencode.json`: Main configuration with experimental hooks
- `code/opencode/packages/opencode/config.schema.json`: Complete configuration schema
- Supports provider configurations, MCP servers, keybinds, themes

### Claudia Configuration
- `code/claudia-to-be-ported-to-opencode/src-tauri/tauri.conf.json`: Tauri app configuration
- `code/claudia-to-be-ported-to-opencode/package.json`: Frontend dependencies and scripts

## Project Structure Patterns

### Monorepo Organization
- `code/`: Contains main applications (claudia, opencode)
- `src/`: Additional projects (dojo)
- `docs/`: Mintlify documentation
- Each project maintains its own package.json and build system

### Common Patterns
- **React Components**: Located in `src/components/` with `index.ts` barrel exports
- **UI Components**: Shared shadcn/ui components in `components/ui/`
- **Rust Backend**: Modular structure with separate modules for different functionality
- **TypeScript**: Strict typing with comprehensive type definitions

## Development Workflow

### OpenCode Desktop Migration
This repository is working toward porting Claudia's proven UI to work with OpenCode's multi-provider architecture. The migration involves:
1. Adapting Claudia's Tauri/React frontend
2. Replacing Claude Code CLI integration with OpenCode API client
3. Adding multi-provider support throughout the UI
4. Implementing server-side session persistence

### Sandboxing & Security
Claudia implements advanced security features:
- OS-level sandboxing (seccomp on Linux, Seatbelt on macOS)
- Granular permission profiles
- Filesystem access control with whitelisting
- Network restrictions and audit logging

### Testing
- **Rust**: `cargo test` in src-tauri directories
- **TypeScript**: `bun test` for OpenCode packages  
- **Frontend**: Vitest + React Testing Library + MSW for component testing
- **E2E**: Playwright for end-to-end workflow testing
- **Coverage**: 85%+ target for UI components, 90%+ for API integration
- **Dojo Specific**: `pnpm test` in src/dojo for comprehensive test suite

## MCP Server Integration

Both Claudia and OpenCode support Model Context Protocol (MCP) servers:
- Configuration through JSON schema-validated config files
- Support for local command-based and remote URL-based servers
- UI for server management and connection testing
- Environment variable configuration per server

## Provider System (OpenCode)

OpenCode's multi-provider architecture supports:
- 75+ AI providers with unified interface
- **Local Provider Support**: Ollama, llama.cpp, LM Studio, LocalAI, Text Generation WebUI
- **Custom Provider Configuration**: NPM package specification and custom base URLs
- Provider-specific model configurations with custom model management
- Cost tracking per provider/model (zero-cost tracking for local models)
- Fallback chains and intelligent routing with local provider optimization
- Custom provider definitions via comprehensive configuration UI
- **Enhanced Local Features**:
  - Connection testing with local endpoint validation
  - Model discovery and management for local providers
  - Privacy-focused workflows with offline capabilities
  - OpenAI-compatible API integration for seamless local inference

## Build Considerations

### Claudia (Tauri)
- Requires Rust toolchain and platform-specific dependencies
- Frontend built with Vite, backend with Cargo
- Cross-platform builds for macOS, Windows, Linux
- Bundle includes native executables and installers

### OpenCode
- Monorepo managed with Bun workspaces
- Go compilation for TUI components
- TypeScript compilation for core functionality
- Stainless SDK for type-safe API clients

## Notes for Development

- The plan.md file contains detailed requirements for porting Claudia to OpenCode
- Claudia serves as the reference implementation for desktop UI patterns
- OpenCode provides the multi-provider backend architecture
- Both projects emphasize security, performance, and developer experience

## Implementation Status
- ✅ **Core OpenCode Integration**: Comprehensive API client with 75+ provider support
- ✅ **UI Components**: Enhanced session management, provider selection, tool dashboard
- ✅ **Claudia UI Porting**: Key components ported with Claudia design fidelity
- ✅ **Testing Infrastructure**: Vitest, MSW, Playwright setup with 78% test pass rate
- ✅ **Local Provider Support**: Full integration for Ollama, llama.cpp, LM Studio, LocalAI
- ✅ **Enhanced Provider Configuration**: Custom providers, npm packages, model management
- ✅ **Session Templates**: Local development and privacy-focused workflows
- 🔍 **Remaining Work**: Complete MSW handler coverage for 100% API test coverage

## Porting Memories
- ✅ **Port completed**: Claudia UI successfully ported from Rust/Tauri to TypeScript/Next.js
- ✅ **UI Fidelity**: Matches @code/claudia-ui-screenshots/ design and functionality
- ✅ **Multi-Provider**: Adapted Claude-specific features for 75+ OpenCode providers
- ✅ **Architecture**: Follows @plan.md specifications for OpenCode desktop integration

## Repository Architecture Constraints
- All available functionality from @docs/opencode/ must be in @src/dojo/

## Development Guidelines
- Use @src/dojo/ as a base and only use typescript tsx code in @src/dojo/