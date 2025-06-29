/**
 * Connection Status - Displays OpenCode server connection status
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/lib/session-store';

interface ConnectionStatusProps {
  collapsed?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ collapsed = false }) => {
  const { 
    serverStatus, 
    serverVersion, 
    connectionErrors,
    actions 
  } = useSessionStore();

  const getStatusConfig = () => {
    switch (serverStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          label: 'Connected',
          description: `OpenCode ${serverVersion || 'Unknown'}`
        };
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          label: 'Connecting',
          description: 'Establishing connection...'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          label: 'Disconnected',
          description: 'Not connected to OpenCode server'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          label: 'Connection Error',
          description: connectionErrors[connectionErrors.length - 1] || 'Unknown error'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          label: 'Unknown',
          description: 'Unknown connection status'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  const handleRetryConnection = async () => {
    actions.clearConnectionErrors();
    await actions.connect();
  };

  const statusIndicator = (
    <div
      className={cn(
        "flex items-center space-x-2 p-2 rounded-lg border transition-colors",
        statusConfig.bgColor,
        statusConfig.borderColor,
        collapsed && "justify-center"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          statusConfig.color,
          serverStatus === 'connecting' && "animate-spin"
        )}
      />
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-medium", statusConfig.color)}>
            {statusConfig.label}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {statusConfig.description}
          </p>
        </div>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              {statusIndicator}
              {(serverStatus === 'error' || serverStatus === 'disconnected') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full mt-1 h-8"
                  onClick={handleRetryConnection}
                >
                  <Wifi className="h-3 w-3" />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <p className="font-medium">{statusConfig.label}</p>
              <p className="text-xs">{statusConfig.description}</p>
              {connectionErrors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-500">Recent Errors:</p>
                  {connectionErrors.slice(-3).map((error, index) => (
                    <p key={index} className="text-xs text-red-400">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {statusIndicator}
      
      {/* Connection Actions */}
      {(serverStatus === 'error' || serverStatus === 'disconnected') && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleRetryConnection}
          disabled={false}
        >
          <Wifi className="h-3 w-3 mr-2" />
          Retry Connection
        </Button>
      )}

      {/* Error Details */}
      {connectionErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-1"
        >
          <p className="text-xs font-medium text-red-500">Recent Errors:</p>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {connectionErrors.slice(-3).map((error, index) => (
              <p key={index} className="text-xs text-red-400 bg-red-500/10 p-1 rounded">
                {error}
              </p>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-6 text-xs"
            onClick={actions.clearConnectionErrors}
          >
            Clear Errors
          </Button>
        </motion.div>
      )}
    </div>
  );
};