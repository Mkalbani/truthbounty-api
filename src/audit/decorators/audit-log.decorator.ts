import { SetMetadata } from '@nestjs/common';
import { AuditActionType, AuditEntityType } from '../entities/audit-log.entity';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditMetadata {
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityIdPath?: string; // Path to entity ID in arguments (e.g., 'args.0.id' or 'args.0')
  descriptionTemplate?: string; // Template for description
  captureBeforeState?: boolean; // Whether to capture state before the operation
  captureAfterState?: boolean; // Whether to capture state after the operation
}

/**
 * Decorator to automatically audit trace method calls
 * @example
 * @AuditLog({
 *   actionType: AuditActionType.CLAIM_CREATED,
 *   entityType: AuditEntityType.CLAIM,
 *   entityIdPath: 'args.0.id',
 *   captureAfterState: true,
 * })
 * async createClaim(createClaimDto: CreateClaimDto) { }
 */
export function AuditLog(metadata: AuditMetadata) {
  return SetMetadata(AUDIT_LOG_KEY, metadata);
}
