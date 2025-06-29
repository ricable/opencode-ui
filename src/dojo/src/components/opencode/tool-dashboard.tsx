/**
 * Tool Dashboard - Tool execution monitoring and management interface
 * Shows available tools, pending approvals, and execution history
 */

"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Play,
  Square,
  Settings,
  RefreshCw,
  Filter,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/lib/session-store';

export const ToolDashboard: React.FC = () => {
  const {
    availableTools,
    toolExecutions,
    pendingApprovals,
    isLoadingTools,
    actions
  } = useSessionStore();
  
  const [selectedTab, setSelectedTab] = React.useState('overview');
  const [mcpServers, setMcpServers] = React.useState<any[]>([]);

  useEffect(() => {
    actions.loadTools();
    actions.loadToolExecutions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleApproveExecution = async (executionId: string) => {
    try {
      await actions.approveToolExecution(executionId);
    } catch (error) {
      console.error('Failed to approve tool execution:', error);
    }
  };

  const handleCancelExecution = async (executionId: string) => {
    try {
      await actions.cancelToolExecution(executionId);
    } catch (error) {
      console.error('Failed to cancel tool execution:', error);
    }
  };

  if (isLoadingTools) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tool Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor tool executions and manage approvals
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                actions.loadTools();
                actions.loadToolExecutions();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline"
              onClick={() => {/* Navigate to MCP view */}}
            >
              <Package className="h-4 w-4 mr-2" />
              MCP Servers
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="executions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="executions">
              Executions
              {pendingApprovals.length > 0 && (
                <Badge className="ml-2">{pendingApprovals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tools">Available Tools</TabsTrigger>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          </TabsList>

          {/* Tool Executions */}
          <TabsContent value="executions" className="space-y-4">
            {toolExecutions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tool executions yet</h3>
                <p className="text-muted-foreground">
                  Tool executions will appear here when AI agents use tools
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {toolExecutions.slice(0, 20).map((execution) => {
                  const tool = availableTools.find(t => t.id === execution.tool_id);
                  
                  return (
                    <motion.div
                      key={execution.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(execution.status)}
                              <div>
                                <div className="font-medium">
                                  {tool?.name || execution.tool_id}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(execution.created_at)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-white",
                                  getStatusColor(execution.status)
                                )}
                              >
                                {execution.status}
                              </Badge>
                              
                              {execution.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveExecution(execution.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelExecution(execution.id)}
                                  >
                                    Deny
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {execution.error && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              {execution.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Available Tools */}
          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTools.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>{tool.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{tool.category}</Badge>
                      {tool.requires_approval && (
                        <Badge variant="secondary">Requires Approval</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Approvals */}
          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
                <p className="text-muted-foreground">
                  All tool executions have been processed
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((execution) => {
                  const tool = availableTools.find(t => t.id === execution.tool_id);
                  
                  return (
                    <motion.div
                      key={execution.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-yellow-500" />
                              <div>
                                <div className="font-medium">
                                  {tool?.name || execution.tool_id}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Requested {formatDate(execution.created_at)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleApproveExecution(execution.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleCancelExecution(execution.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Deny
                              </Button>
                            </div>
                          </div>
                          
                          {execution.input && (
                            <div className="mt-3">
                              <div className="text-sm font-medium mb-2">Tool Input:</div>
                              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                                {JSON.stringify(execution.input, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};