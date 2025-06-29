"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface AgentsViewProps {
  onViewChange: (view: OpenCodeView) => void;
}

export function AgentsView({ onViewChange }: AgentsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
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
              <h1 className="text-2xl font-bold">AI Agents</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage custom AI agents
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No agents configured</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI agent to get started with specialized coding assistance
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </motion.div>
      </div>
    </div>
  );
}