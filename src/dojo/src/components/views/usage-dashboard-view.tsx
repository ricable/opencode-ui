"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Clock,
  Zap,
  Users,
  Database,
  ArrowLeft,
  Filter,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionStore } from "@/lib/session-store";

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

interface UsageDashboardViewProps {
  onViewChange: (view: OpenCodeView) => void;
}

export function UsageDashboardView({ onViewChange }: UsageDashboardViewProps) {
  const { 
    sessions, 
    providers, 
    providerMetrics,
    actions 
  } = useSessionStore();

  const [timeFilter, setTimeFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsageData();
  }, [timeFilter]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        actions.loadSessions(),
        actions.loadProviders(),
        actions.loadProviderMetrics()
      ]);
    } catch (err) {
      console.error("Failed to load usage data:", err);
      setError("Failed to load usage statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregated metrics from real data
  const totalCost = providerMetrics.reduce((sum, m) => sum + m.total_cost, 0);
  const totalSessions = sessions.length;
  const totalTokens = sessions.reduce((sum, session) => {
    if (session.token_usage) {
      return sum + session.token_usage.input_tokens + session.token_usage.output_tokens;
    }
    return sum;
  }, 0);
  const avgCostPerSession = totalSessions > 0 ? totalCost / totalSessions : 0;

  // Utility functions (matching Claudia's style)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTokens = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return formatNumber(num);
  };

  // Calculate token breakdown from actual data
  const inputTokens = sessions.reduce((sum, s) => sum + (s.token_usage?.input_tokens || 0), 0);
  const outputTokens = sessions.reduce((sum, s) => sum + (s.token_usage?.output_tokens || 0), 0);
  const cacheTokens = sessions.reduce((sum, s) => sum + (s.token_usage?.cache_tokens || 0), 0);
  
  const tokenBreakdown = {
    inputTokens: formatTokens(inputTokens),
    outputTokens: formatTokens(outputTokens),
    cacheWrite: formatTokens(cacheTokens / 2), // Estimate
    cacheRead: formatTokens(cacheTokens / 2) // Estimate
  };

  // Analyze most used models from sessions
  const modelUsage = sessions.reduce((acc, session) => {
    const key = session.model || 'unknown';
    if (!acc[key]) {
      acc[key] = { sessions: 0, cost: 0, model: key };
    }
    acc[key].sessions++;
    if (session.token_usage) {
      const sessionCost = (session.token_usage.input_tokens + session.token_usage.output_tokens) * 0.00001; // Rough estimate
      acc[key].cost += sessionCost;
    }
    return acc;
  }, {} as Record<string, { sessions: number; cost: number; model: string }>);

  const mostUsedModels = Object.values(modelUsage)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 3)
    .map(m => ({
      name: m.model,
      sessions: m.sessions,
      cost: m.cost,
      color: m.model.includes('sonnet') ? 'text-blue-500' : 
             m.model.includes('opus') ? 'text-purple-500' : 
             'text-green-500'
    }));

  // Analyze project usage
  const projectUsage = sessions.reduce((acc, session) => {
    const key = session.project_path || 'unknown';
    if (!acc[key]) {
      acc[key] = { sessions: 0, cost: 0, name: key };
    }
    acc[key].sessions++;
    if (session.token_usage) {
      const sessionCost = (session.token_usage.input_tokens + session.token_usage.output_tokens) * 0.00001;
      acc[key].cost += sessionCost;
    }
    return acc;
  }, {} as Record<string, { sessions: number; cost: number; name: string }>);

  const topProjects = Object.values(projectUsage)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header matching Claudia's design */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onViewChange("welcome")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Usage Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track your OpenCode usage and costs</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </Button>
            <div className="flex items-center space-x-1 border rounded-md p-1">
              {["All Time", "Last 30 Days", "Last 7 Days"].map((period) => (
                <Button
                  key={period}
                  variant={timeFilter === period ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTimeFilter(period)}
                  className="text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading and Error States */}
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-96">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-sm text-muted-foreground">Loading usage statistics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-96">
            <div className="text-center max-w-md">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={loadUsageData} size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics - Matches Claudia's layout exactly */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-4 gap-6 mb-8"
            >
              <Card className="shimmer-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
                      <div className="text-3xl font-bold">{formatCurrency(totalCost)}</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shimmer-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total Sessions</div>
                      <div className="text-3xl font-bold">{formatNumber(totalSessions)}</div>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shimmer-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total Tokens</div>
                      <div className="text-3xl font-bold">{formatTokens(totalTokens)}</div>
                    </div>
                    <Database className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shimmer-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Avg Cost/Session</div>
                      <div className="text-3xl font-bold">{formatCurrency(avgCostPerSession)}</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-model">By Model</TabsTrigger>
            <TabsTrigger value="by-project">By Project</TabsTrigger>
            <TabsTrigger value="by-session">By Session</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Token Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Token Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Input Tokens</div>
                    <div className="text-2xl font-bold">{tokenBreakdown.inputTokens}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Output Tokens</div>
                    <div className="text-2xl font-bold">{tokenBreakdown.outputTokens}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cache Write</div>
                    <div className="text-2xl font-bold">{tokenBreakdown.cacheWrite}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cache Read</div>
                    <div className="text-2xl font-bold">{tokenBreakdown.cacheRead}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Most Used Models */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Models</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mostUsedModels.map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${model.color}`}>
                          {model.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {model.sessions} sessions
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(model.cost)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium truncate" title={project.name}>
                          {project.name}
                        </span>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {project.sessions} sessions
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTokens(project.sessions * 1000)} tokens est.
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(project.cost)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(project.cost / project.sessions)}/session
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="by-model">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Model breakdown visualization coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-project">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Project usage analysis coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-session">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Session breakdown coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Usage Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Timeline visualization coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}