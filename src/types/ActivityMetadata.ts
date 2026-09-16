export interface ActivityMetadata {
  targetUserId?: string;
  commentId?: string; 
  oldInfo?: Record<string, unknown>;
  reason?: string;
  changedFields?: string[];
}
