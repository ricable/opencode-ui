"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Globe,
  Activity,
  DollarSign,
  Settings,
  BarChart3,
  Shield,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProviderDashboard } from "@/components/opencode/provider-dashboard";
import { ProviderHealth } from "@/components/opencode/provider-health";
import { ProviderCosts } from "@/components/opencode/provider-costs";
import { ProviderSelector } from "@/components/opencode/provider-selector";

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

interface ProvidersViewProps {
  onViewChange: (view: OpenCodeView) => void;
}

export function ProvidersView({ onViewChange }: ProvidersViewProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Header */}
      <div className="border-b border-border bg-gradient-to-r from-background to-muted/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onViewChange("welcome")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <span>Multi-Provider Command Center</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Comprehensive management for 75+ AI providers with intelligent routing and real-time monitoring
                </p>
              </div>
            </div>
            
            {/* Quick Provider Selector */}
            <div className="flex items-center space-x-4">
              <div className="max-w-sm">
                <ProviderSelector />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Provider Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Health Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Cost Management</span>
              </TabsTrigger>
              <TabsTrigger value="routing" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Smart Routing</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="dashboard" className="h-full m-0">
              <ProviderDashboard />
            </TabsContent>
            
            <TabsContent value="health" className="h-full m-0 p-6">
              <ProviderHealth />
            </TabsContent>
            
            <TabsContent value="costs" className="h-full m-0 p-6">
              <ProviderCosts />
            </TabsContent>
            
            <TabsContent value="routing" className="h-full m-0 p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Intelligent Provider Routing</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Configure advanced routing rules, failover strategies, and task-specific provider selection 
                    to optimize performance, cost, and reliability across your entire AI workflow.
                  </p>
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <div className="p-4 rounded-lg border bg-card">
                        <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-medium">Performance-Based</h4>
                        <p className="text-sm text-muted-foreground">Route based on response times and uptime</p>
                      </div>
                      <div className="p-4 rounded-lg border bg-card">
                        <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-medium">Cost-Optimized</h4>
                        <p className="text-sm text-muted-foreground">Minimize costs while maintaining quality</p>
                      </div>
                      <div className="p-4 rounded-lg border bg-card">
                        <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-medium">Failover Ready</h4>
                        <p className="text-sm text-muted-foreground">Automatic fallback when providers are down</p>
                      </div>
                    </div>
                    <Button className="mt-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Routing Rules
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}