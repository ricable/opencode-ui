"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plug, 
  Plus, 
  RefreshCw, 
  Download, 
  Upload,
  ChevronRight,
  Settings,
  Trash2,
  PlayCircle,
  StopCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
export type OpenCodeView = 
  | "welcome" 
  | "projects" 
  | "providers" 
  | "agents" 
  | "settings" 
  | "session" 
  | "usage-dashboard" 
  | "mcp"
  | "tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useSessionStore } from "@/lib/session-store";
import { cn } from "@/lib/utils";

interface MCPViewProps {
  onViewChange: (view: OpenCodeView) => void;
}

interface MCPServer {
  id: string;
  name: string;
  type: "stdio" | "sse";
  status: "connected" | "disconnected" | "error" | "connecting";
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  tools: string[];
  lastConnected?: number;
  errorMessage?: string;
}

// Mock MCP servers based on the screenshot
const mockMCPServers: MCPServer[] = [
  {
    id: "puppeteer",
    name: "puppeteer",
    type: "stdio",
    status: "connected",
    command: "npx puppeteer-mcp-server",
    args: [],
    env: {},
    tools: ["puppeteer_navigate", "puppeteer_screenshot", "puppeteer_click", "puppeteer_fill"],
    lastConnected: Date.now() - 3600000
  },
  {
    id: "consult7",
    name: "consult7",
    type: "stdio",
    status: "connected",
    command: "uvx consult7-google AizaSyDCpyDc95PTImwGg-Myr58Uz3GN7f-o8",
    args: [],
    env: {},
    tools: ["consultation", "code_analysis", "documentation_search"],
    lastConnected: Date.now() - 1800000
  }
];

export function MCPView({ onViewChange }: MCPViewProps) {
  const [servers, setServers] = useState<MCPServer[]>(mockMCPServers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [showEnvVars, setShowEnvVars] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  
  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'connecting':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleStartServer = async (serverId: string) => {
    setServers(prev => prev.map(s => 
      s.id === serverId ? { ...s, status: 'connecting' } : s
    ));
    
    // Simulate connection
    setTimeout(() => {
      setServers(prev => prev.map(s => 
        s.id === serverId ? { ...s, status: 'connected', lastConnected: Date.now() } : s
      ));
    }, 2000);
  };

  const handleStopServer = async (serverId: string) => {
    setServers(prev => prev.map(s => 
      s.id === serverId ? { ...s, status: 'disconnected' } : s
    ));
  };

  const handleDeleteServer = async (serverId: string) => {
    setServers(prev => prev.filter(s => s.id !== serverId));
  };

  const toggleEnvVisibility = (serverId: string) => {
    setShowEnvVars(prev => ({
      ...prev,
      [serverId]: !prev[serverId]
    }));
  };

  const formatCommand = (server: MCPServer) => {
    if (server.type === 'sse') {
      return server.url || '';
    }
    return [server.command, ...(server.args || [])].join(' ');
  };

  const connectedCount = servers.filter(s => s.status === 'connected').length;
  const totalCount = servers.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange('welcome')}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <div className="flex items-center space-x-2">
              <Plug className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold">MCP Servers</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add MCP Server</DialogTitle>
                </DialogHeader>
                <AddServerForm onClose={() => setShowAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Manage Model Context Protocol servers
        </p>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Plug className="h-4 w-4" />
              <span className="text-sm font-medium">Servers</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Configured Servers
            </span>
            <div className="text-right">
              <div className="text-lg font-bold">{connectedCount} servers configured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Local Servers Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">Local (Project-specific)</h2>
              <Badge variant="outline">({servers.filter(s => s.type === 'stdio').length})</Badge>
            </div>
            
            <div className="space-y-3">
              {servers.filter(s => s.type === 'stdio').map((server) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border rounded-lg"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ChevronRight className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="font-medium">{server.name}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {formatCommand(server)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedServer(selectedServer?.id === server.id ? null : server)}
                        >
                          {selectedServer?.id === server.id ? 'Hide full' : 'Show full'}
                        </Button>
                        
                        {server.status === 'connected' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStopServer(server.id)}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartServer(server.id)}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteServer(server.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedServer?.id === server.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(server.status)}
                              <Badge 
                                variant="outline"
                                className={cn("text-white", getStatusColor(server.status))}
                              >
                                {server.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                            <div className="mt-1">
                              <Badge variant="secondary">{server.type}</Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Command</Label>
                          <div className="mt-1 p-2 bg-muted rounded text-sm font-mono">
                            {formatCommand(server)}
                          </div>
                        </div>

                        {server.tools && server.tools.length > 0 && (
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Available Tools</Label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {server.tools.map((tool) => (
                                <Badge key={tool} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {server.lastConnected && (
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Last Connected</Label>
                            <div className="mt-1 text-sm">
                              {new Date(server.lastConnected).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Remote Servers Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold">Remote (SSE)</h2>
              <Badge variant="outline">({servers.filter(s => s.type === 'sse').length})</Badge>
            </div>
            
            {servers.filter(s => s.type === 'sse').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                <p>No remote servers configured</p>
                <p className="text-sm">Add a remote MCP server to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.filter(s => s.type === 'sse').map((server) => (
                  <Card key={server.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{server.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {server.url}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(server.status)}
                          <Badge 
                            variant="outline"
                            className={cn("text-white", getStatusColor(server.status))}
                          >
                            {server.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Server Form Component
function AddServerForm({ onClose }: { onClose: () => void }) {
  const [serverType, setServerType] = useState<'stdio' | 'sse'>('stdio');
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    args: '',
    url: '',
    env: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Adding server:', { ...formData, type: serverType });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Server Type</Label>
        <Select 
          value={serverType} 
          onValueChange={(value: 'stdio' | 'sse') => setServerType(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stdio">Local (stdio)</SelectItem>
            <SelectItem value="sse">Remote (SSE)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Server Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., puppeteer, filesystem"
        />
      </div>

      {serverType === 'stdio' ? (
        <>
          <div>
            <Label>Command</Label>
            <Input
              value={formData.command}
              onChange={(e) => setFormData(prev => ({ ...prev, command: e.target.value }))}
              placeholder="e.g., npx puppeteer-mcp-server"
            />
          </div>
          <div>
            <Label>Arguments (space-separated)</Label>
            <Input
              value={formData.args}
              onChange={(e) => setFormData(prev => ({ ...prev, args: e.target.value }))}
              placeholder="--port 3000 --verbose"
            />
          </div>
        </>
      ) : (
        <div>
          <Label>Server URL</Label>
          <Input
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com/mcp"
          />
        </div>
      )}

      <div>
        <Label>Environment Variables (JSON)</Label>
        <Textarea
          value={formData.env}
          onChange={(e) => setFormData(prev => ({ ...prev, env: e.target.value }))}
          placeholder='{"API_KEY": "your-key", "DEBUG": "true"}'
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add Server
        </Button>
      </div>
    </form>
  );
}