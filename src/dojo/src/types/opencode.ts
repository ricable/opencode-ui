/**
 * Comprehensive TypeScript types for OpenCode API client
 * This extends the base types with additional interfaces needed for the enhanced client
 */

// Extended Session Types
export interface SessionUpdate {
  type: "message" | "status" | "error" | "tool_execution" | "stream_start" | "stream_end";
  data: any;
  timestamp: number;
}

export interface SessionSubscription {
  sessionId: string;
  unsubscribe: () => void;
  isActive: boolean;
}

export interface ShareLink {
  url: string;
  expires_at: number;
  password_protected: boolean;
  view_count: number;
}

// Extended Provider Types
export interface AuthResult {
  success: boolean;
  message?: string;
  provider_id: string;
  expires_at?: number;
}

export interface ProviderSubscription {
  unsubscribe: () => void;
  isActive: boolean;
}

// Tool System Extensions
export interface ToolResult {
  success: boolean;
  result: any;
  error?: string;
  cost?: number;
  execution_time: number;
  tool_id: string;
}

export interface ToolExecutionRequest {
  tool_id: string;
  params: Record<string, any>;
  session_id?: string;
  require_approval?: boolean;
  timeout?: number;
}

export interface ToolSubscription {
  unsubscribe: () => void;
  isActive: boolean;
}

// LSP Integration Types
export interface LSPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  status: "running" | "stopped" | "error";
  languages: string[];
  features: string[];
}

export interface LSPDiagnostic {
  file_path: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  source: string;
  code?: string;
}

// Custom Commands
export interface CustomCommand {
  id: string;
  name: string;
  description: string;
  command: string;
  args: Record<string, string>;
  enabled: boolean;
  shortcuts?: string[];
}

// WebSocket Management
export interface WebSocketManager {
  connect: (url: string, protocols?: string[]) => WebSocket;
  disconnect: (ws: WebSocket) => void;
  reconnect: (ws: WebSocket) => WebSocket;
  getStatus: (ws: WebSocket) => "connecting" | "open" | "closing" | "closed";
}

// Event System
export interface EventEmitter {
  on: (event: string, callback: Function) => () => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, data: any) => void;
  once: (event: string, callback: Function) => () => void;
}

// HTTP Client Configuration
export interface HTTPClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface HTTPClient {
  get: <T>(url: string, config?: RequestInit) => Promise<T>;
  post: <T>(url: string, data?: any, config?: RequestInit) => Promise<T>;
  put: <T>(url: string, data?: any, config?: RequestInit) => Promise<T>;
  delete: <T>(url: string, config?: RequestInit) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: RequestInit) => Promise<T>;
}

// Session Templates and Management
export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  system_prompt?: string;
  tools: string[];
  configuration: Record<string, any>;
  created_by: string;
  is_public: boolean;
}

// Extended Configuration Types
export interface ModelConfig {
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string[];
}

export interface ProviderEndpoint {
  id: string;
  url: string;
  auth_type: "api_key" | "oauth" | "basic" | "bearer";
  headers?: Record<string, string>;
  timeout?: number;
}

// Enhanced Error Types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retry_after?: number;
  request_id?: string;
}

// Streaming Types
export interface StreamChunk {
  type: "delta" | "complete" | "error";
  content?: string;
  metadata?: Record<string, any>;
  finish_reason?: string;
}

export interface StreamOptions {
  session_id: string;
  message: string;
  model_config?: ModelConfig;
  tools_enabled?: boolean;
}

// Usage and Analytics
export interface UsageStats {
  total_sessions: number;
  total_messages: number;
  total_cost: number;
  avg_response_time: number;
  most_used_provider: string;
  most_used_model: string;
  today: {
    sessions: number;
    messages: number;
    cost: number;
  };
  this_week: {
    sessions: number;
    messages: number;
    cost: number;
  };
  this_month: {
    sessions: number;
    messages: number;
    cost: number;
  };
}

export interface CostBreakdown {
  provider_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
  requests: number;
  avg_cost_per_request: number;
}

// Connection and Health
export interface ConnectionStatus {
  status: "connected" | "connecting" | "disconnected" | "error";
  last_connected: number;
  reconnect_attempts: number;
  latency: number;
  server_version: string;
}

export interface ServerInfo {
  version: string;
  uptime: number;
  providers_count: number;
  active_sessions: number;
  features: string[];
  limits: {
    max_sessions: number;
    max_message_length: number;
    max_file_size: number;
  };
}

// Project Management Extensions
export interface ProjectStats {
  total_sessions: number;
  total_messages: number;
  total_cost: number;
  last_activity: number;
  file_count: number;
  languages: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  structure: {
    files: string[];
    folders: string[];
  };
  default_config: Record<string, any>;
  session_templates: string[];
}

// File System Integration
export interface FileOperationResult {
  success: boolean;
  path: string;
  operation: "read" | "write" | "delete" | "create" | "move" | "copy";
  size?: number;
  modified_at?: number;
  error?: string;
}

export interface DirectoryListing {
  path: string;
  files: Array<{
    name: string;
    type: "file" | "directory";
    size: number;
    modified_at: number;
    permissions: string;
  }>;
}