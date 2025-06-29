/**
 * Session Timeline - Checkpoint management and timeline navigation
 * Provides visual timeline with checkpoint management and SQLite backend integration
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch,
  Clock,
  MessageSquare,
  Bookmark,
  Save,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  FileText,
  Code,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useSessionStore, useActiveSession, useActiveSessionMessages } from '@/lib/session-store';

interface Checkpoint {
  id: string;
  session_id: string;
  name: string;
  description?: string;
  timestamp: number;
  message_index: number;
  metadata: {
    userPrompt?: string;
    totalTokens: number;
    fileChanges: number;
    model?: string;
  };
  children?: Checkpoint[];
}

interface TimelineNode {
  checkpoint: Checkpoint;
  children: TimelineNode[];
}

interface SessionTimeline {
  rootNode: TimelineNode | null;
  currentCheckpointId: string | null;
  totalCheckpoints: number;
}

interface SessionTimelineProps {
  /**
   * Session ID to show timeline for
   */
  sessionId: string;
  /**
   * Whether the timeline is in sidebar mode
   */
  compact?: boolean;
  /**
   * Callback when a checkpoint is selected
   */
  onCheckpointSelect?: (checkpoint: Checkpoint) => void;
  /**
   * Optional className
   */
  className?: string;
}

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  isActive: boolean;
  isLast: boolean;
  compact?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

const CheckpointItem: React.FC<CheckpointItemProps> = ({
  checkpoint,
  isActive,
  isLast,
  compact,
  onSelect,
  onEdit,
  onDelete,
  onRestore
}) => {
  const getCheckpointIcon = () => {
    switch (checkpoint.type) {
      case 'manual':
        return <Bookmark className="h-4 w-4" />;
      case 'auto':
        return <Clock className="h-4 w-4" />;
      case 'milestone':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  const getCheckpointColor = () => {
    switch (checkpoint.type) {
      case 'manual':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
      case 'auto':
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900';
      case 'milestone':
        return 'text-green-500 bg-green-100 dark:bg-green-900';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="relative flex items-start space-x-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
      )}
      
      {/* Checkpoint marker */}
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2",
        getCheckpointColor(),
        isActive ? "border-primary" : "border-border"
      )}>
        {getCheckpointIcon()}
      </div>
      
      {/* Checkpoint content */}
      <div className="flex-1 min-w-0">
        <Card className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isActive && "ring-2 ring-primary bg-primary/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0" onClick={onSelect}>
                <h4 className="font-medium text-sm truncate">
                  {checkpoint.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatTime(checkpoint.created_at)}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onSelect}>
                    <Play className="h-4 w-4 mr-2" />
                    Jump to Checkpoint
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRestore}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore Session
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Checkpoint
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {checkpoint.description && !compact && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {checkpoint.description}
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{checkpoint.metadata?.message_count || 0}</span>
              </div>
              
              {checkpoint.metadata?.cost && (
                <div className="flex items-center space-x-1">
                  <span className="font-mono">
                    ${checkpoint.metadata.cost.toFixed(4)}
                  </span>
                </div>
              )}
              
              {checkpoint.metadata?.tools_used && checkpoint.metadata.tools_used.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>{checkpoint.metadata.tools_used.length}</span>
                </div>
              )}
              
              {checkpoint.metadata?.files_modified && checkpoint.metadata.files_modified.length > 0 && (
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{checkpoint.metadata.files_modified.length}</span>
                </div>
              )}
            </div>
            
            {/* Type badge */}
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  checkpoint.type === 'manual' && "border-blue-500 text-blue-700",
                  checkpoint.type === 'auto' && "border-gray-500 text-gray-700",
                  checkpoint.type === 'milestone' && "border-green-500 text-green-700"
                )}
              >
                {checkpoint.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  sessionId,
  compact = false,
  onCheckpointSelect,
  className
}) => {
  const session = useActiveSession();
  const messages = useActiveSessionMessages();
  const { actions } = useSessionStore();
  
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null);
  const [checkpointName, setCheckpointName] = useState('');
  const [checkpointDescription, setCheckpointDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock checkpoints data - in real implementation this would come from SQLite
  useEffect(() => {
    // Load checkpoints from backend
    const mockCheckpoints: Checkpoint[] = [
      {
        id: 'checkpoint-1',
        session_id: sessionId,
        name: 'Initial Setup',
        description: 'Started working on authentication refactor',
        message_index: 0,
        created_at: Date.now() - 3600000,
        type: 'auto',
        metadata: {
          message_count: 1,
          token_usage: 150,
          cost: 0.001
        }
      },
      {
        id: 'checkpoint-2',
        session_id: sessionId,
        name: 'Database Schema Updated',
        description: 'Modified user table to support new auth flow',
        message_index: 5,
        created_at: Date.now() - 2400000,
        type: 'manual',
        metadata: {
          message_count: 6,
          token_usage: 450,
          cost: 0.012,
          tools_used: ['file_write', 'sql_executor'],
          files_modified: ['schema.sql', 'migrations/001_update_users.sql']
        }
      },
      {
        id: 'checkpoint-3',
        session_id: sessionId,
        name: 'API Endpoints Implemented',
        description: 'Created login, register, and refresh token endpoints',
        message_index: 12,
        created_at: Date.now() - 1200000,
        type: 'milestone',
        metadata: {
          message_count: 13,
          token_usage: 890,
          cost: 0.025,
          tools_used: ['file_write', 'bash', 'web_search'],
          files_modified: ['routes/auth.js', 'controllers/auth.js', 'middleware/jwt.js']
        }
      },
      {
        id: 'checkpoint-4',
        session_id: sessionId,
        name: 'Current State',
        description: 'Working on frontend integration',
        message_index: messages.length - 1,
        created_at: Date.now() - 300000,
        type: 'auto',
        metadata: {
          message_count: messages.length,
          token_usage: 1250,
          cost: 0.045,
          tools_used: ['file_read', 'file_write'],
          files_modified: ['src/auth.js', 'src/api.js']
        }
      }
    ];
    
    setCheckpoints(mockCheckpoints);
    setActiveCheckpointId(mockCheckpoints[mockCheckpoints.length - 1]?.id || null);
  }, [sessionId, messages.length]);

  const handleCreateCheckpoint = async () => {
    if (!checkpointName.trim()) return;

    setIsCreating(true);
    try {
      const newCheckpoint: Checkpoint = {
        id: `checkpoint-${Date.now()}`,
        session_id: sessionId,
        name: checkpointName.trim(),
        description: checkpointDescription.trim() || undefined,
        message_index: messages.length - 1,
        created_at: Date.now(),
        type: 'manual',
        metadata: {
          message_count: messages.length,
          // In real implementation, get actual values from session
          token_usage: 0,
          cost: 0
        }
      };

      // In real implementation, save to SQLite backend
      setCheckpoints([...checkpoints, newCheckpoint]);
      setActiveCheckpointId(newCheckpoint.id);
      setShowCreateDialog(false);
      setCheckpointName('');
      setCheckpointDescription('');
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCheckpoint = async () => {
    if (!editingCheckpoint || !checkpointName.trim()) return;

    setIsCreating(true);
    try {
      const updatedCheckpoint = {
        ...editingCheckpoint,
        name: checkpointName.trim(),
        description: checkpointDescription.trim() || undefined
      };

      // In real implementation, update in SQLite backend
      setCheckpoints(checkpoints.map(cp => 
        cp.id === editingCheckpoint.id ? updatedCheckpoint : cp
      ));
      setShowEditDialog(false);
      setEditingCheckpoint(null);
      setCheckpointName('');
      setCheckpointDescription('');
    } catch (error) {
      console.error('Failed to edit checkpoint:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCheckpoint = async (checkpointId: string) => {
    if (confirm('Are you sure you want to delete this checkpoint?')) {
      try {
        // In real implementation, delete from SQLite backend
        setCheckpoints(checkpoints.filter(cp => cp.id !== checkpointId));
        if (activeCheckpointId === checkpointId) {
          setActiveCheckpointId(null);
        }
      } catch (error) {
        console.error('Failed to delete checkpoint:', error);
      }
    }
  };

  const handleRestoreCheckpoint = async (checkpoint: Checkpoint) => {
    if (confirm(`Restore session to "${checkpoint.name}"? This will create a new branch from this point.`)) {
      try {
        // In real implementation, restore session state from checkpoint
        console.log('Restoring to checkpoint:', checkpoint);
        setActiveCheckpointId(checkpoint.id);
      } catch (error) {
        console.error('Failed to restore checkpoint:', error);
      }
    }
  };

  const handleSelectCheckpoint = (checkpoint: Checkpoint) => {
    setActiveCheckpointId(checkpoint.id);
    onCheckpointSelect?.(checkpoint);
  };

  const openEditDialog = (checkpoint: Checkpoint) => {
    setEditingCheckpoint(checkpoint);
    setCheckpointName(checkpoint.name);
    setCheckpointDescription(checkpoint.description || '');
    setShowEditDialog(true);
  };

  const openCreateDialog = () => {
    setCheckpointName('');
    setCheckpointDescription('');
    setShowCreateDialog(true);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-sm text-muted-foreground">No session selected</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <h3 className="font-medium">
              {compact ? 'Timeline' : 'Session Timeline'}
            </h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openCreateDialog}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create Checkpoint</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {!compact && (
          <p className="text-xs text-muted-foreground">
            {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''} • 
            Track important moments in your session
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-6">
            {checkpoints.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No checkpoints yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCreateDialog}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Checkpoint
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {checkpoints.map((checkpoint, index) => (
                    <motion.div
                      key={checkpoint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <CheckpointItem
                        checkpoint={checkpoint}
                        isActive={activeCheckpointId === checkpoint.id}
                        isLast={index === checkpoints.length - 1}
                        compact={compact}
                        onSelect={() => handleSelectCheckpoint(checkpoint)}
                        onEdit={() => openEditDialog(checkpoint)}
                        onDelete={() => handleDeleteCheckpoint(checkpoint.id)}
                        onRestore={() => handleRestoreCheckpoint(checkpoint)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Auto-checkpoint settings */}
      {!compact && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Auto-checkpoints every 10 messages</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      )}

      {/* Create Checkpoint Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Checkpoint</DialogTitle>
            <DialogDescription>
              Save the current state of your session for easy navigation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="checkpoint-name">Checkpoint Name *</Label>
              <Input
                id="checkpoint-name"
                placeholder="e.g., Implemented user authentication"
                value={checkpointName}
                onChange={(e) => setCheckpointName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="checkpoint-description">Description (Optional)</Label>
              <Textarea
                id="checkpoint-description"
                placeholder="Describe what was accomplished at this point..."
                value={checkpointDescription}
                onChange={(e) => setCheckpointDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCheckpoint}
              disabled={!checkpointName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Checkpoint
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Checkpoint Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Checkpoint</DialogTitle>
            <DialogDescription>
              Update checkpoint details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-checkpoint-name">Checkpoint Name *</Label>
              <Input
                id="edit-checkpoint-name"
                value={checkpointName}
                onChange={(e) => setCheckpointName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-checkpoint-description">Description (Optional)</Label>
              <Textarea
                id="edit-checkpoint-description"
                value={checkpointDescription}
                onChange={(e) => setCheckpointDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCheckpoint}
              disabled={!checkpointName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Checkpoint
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};