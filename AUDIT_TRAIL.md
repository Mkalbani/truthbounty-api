# Audit Trail Documentation

## Overview

The Audit Trail system provides comprehensive tracking of all critical actions in the TruthBounty API. It ensures traceability by logging:
- **Claim submission, updates, and finalization**
- **Evidence/verification submissions and updates**
- **Reward calculations and distributions**
- **User actions and wallet linking**

## Architecture

The audit system consists of:

### 1. **AuditLog Entity** (`src/audit/entities/audit-log.entity.ts`)
Stores audit log records with:
- Action type (e.g., `CLAIM_CREATED`, `EVIDENCE_SUBMITTED`)
- Entity type and ID being acted upon
- User ID who performed the action
- Before and after state snapshots
- Metadata (IP address, user agent, correlation ID)
- Timestamp

### 2. **AuditTrailService** (`src/audit/services/audit-trail.service.ts`)
Core service providing:
- `log()` - Record a new audit event
- `getEntityAuditLogs()` - Get all logs for a specific entity
- `getUserAuditLogs()` - Get all actions by a user
- `getActionAuditLogs()` - Get all logs for a specific action type
- `getAuditLogs()` - Advanced filtering query
- `getChangeHistory()` - Get complete change history for an entity
- `getAuditSummary()` - Get summary statistics

### 3. **AuditLog Decorator** (`src/audit/decorators/audit-log.decorator.ts`)
Decorator to automatically log method calls:
```typescript
@AuditLog({
  actionType: AuditActionType.CLAIM_CREATED,
  entityType: AuditEntityType.CLAIM,
  entityIdPath: 'args.0.id',
  captureAfterState: true,
})
async createClaim(data) { }
```

### 4. **AuditLoggingInterceptor** (`src/audit/interceptors/audit-logging.interceptor.ts`)
Automatically processes decorated methods and logs results/errors.

### 5. **AuditLog Controller** (`src/audit/controllers/audit-log.controller.ts`)
REST endpoints for querying audit logs.

## Supported Actions

### Claim Actions
- `CLAIM_CREATED` - New claim submitted
- `CLAIM_UPDATED` - Claim data modified
- `CLAIM_RESOLVED` - Claim verdict determined
- `CLAIM_FINALIZED` - Claim locked/finalized

### Evidence/Verification Actions
- `EVIDENCE_SUBMITTED` - Evidence provided for claim
- `EVIDENCE_UPDATED` - Evidence version updated
- `EVIDENCE_FLAGGED` - Evidence marked as problematic
- `EVIDENCE_VERIFIED` - Evidence verified/approved
- `VERIFICATION_COMPLETED` - Verification process completed

### Reward Actions
- `REWARD_CALCULATED` - Reward amount computed
- `REWARD_DISTRIBUTED` - Reward sent to user
- `REWARD_CLAIMED` - User claimed their reward

### User Actions
- `USER_CREATED` - New user registered
- `USER_UPDATED` - User profile changed
- `WALLET_LINKED` - Wallet connected to account
- `VERIFICATION_INITIATED` - Verification started

## REST API Endpoints

### Get All Audit Logs
```
GET /audit?entityType=CLAIM&actionType=CLAIM_CREATED&userId=xxx&limit=50&offset=0
```

**Query Parameters:**
- `entityType` - Filter by entity type (CLAIM, EVIDENCE, REWARD, USER, WALLET)
- `actionType` - Filter by action type
- `userId` - Filter by user ID
- `limit` - Max results (default: 100, max: 500)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "actionType": "CLAIM_CREATED",
      "entityType": "CLAIM",
      "entityId": "claim-id",
      "userId": "user-id",
      "walletAddress": "0x...",
      "description": "Claim created",
      "beforeState": null,
      "afterState": { "id": "claim-id", "verdict": true },
      "metadata": { "method": "ClaimsService", "handler": "createClaim" },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-03-28T12:00:00Z",
      "correlationId": "corr-id"
    }
  ],
  "total": 150
}
```

### Get Audit Logs for Specific Entity
```
GET /audit/entity/CLAIM/claim-id-123
```

Returns all actions performed on a specific entity in chronological order.

### Get User's Audit Logs
```
GET /audit/user/user-id-123?limit=50&offset=0
```

Returns all actions performed by a specific user.

### Get Logs by Action Type
```
GET /audit/action/CLAIM_CREATED?limit=50
```

Returns all logs for a specific action type.

### Get Change History
```
GET /audit/changes/CLAIM/claim-id-123
```

Returns a formatted change history showing what changed over time:
```json
[
  {
    "timestamp": "2026-03-28T12:00:00Z",
    "action": "CLAIM_CREATED",
    "userId": "user-id",
    "changes": {}
  },
  {
    "timestamp": "2026-03-28T12:05:00Z",
    "action": "CLAIM_RESOLVED",
    "userId": "verifier-id",
    "changes": {
      "resolvedVerdict": { "before": null, "after": true },
      "confidenceScore": { "before": 0, "after": 0.95 }
    }
  }
]
```

### Get Audit Summary
```
GET /audit/summary?entityType=CLAIM&days=7
```

Returns a count of actions by type for the specified period:
```json
{
  "CLAIM_CREATED": 45,
  "CLAIM_RESOLVED": 38,
  "CLAIM_FINALIZED": 35,
  "EVIDENCE_SUBMITTED": 92
}
```

## Integration in Services

### Automatic Logging with Decorator

Use the `@AuditLog()` decorator on service methods:

```typescript
@AuditLog({
  actionType: AuditActionType.CLAIM_CREATED,
  entityType: AuditEntityType.CLAIM,
  descriptionTemplate: 'Claim created by user',
  captureAfterState: true,
})
async createClaim(data: CreateClaimDto): Promise<Claim> {
  // Your implementation
}
```

### Manual Logging

Inject `AuditTrailService` and call `log()` directly:

```typescript
constructor(private auditTrailService: AuditTrailService) {}

async resolveClaim(claimId: string, verdict: boolean) {
  const claim = await this.claimRepo.findOne(claimId);
  const beforeState = { ...claim };

  // Update claim
  claim.resolvedVerdict = verdict;
  const updated = await this.claimRepo.save(claim);

  // Log the action
  await this.auditTrailService.log({
    actionType: AuditActionType.CLAIM_RESOLVED,
    entityType: AuditEntityType.CLAIM,
    entityId: claimId,
    userId: currentUserId,
    description: `Claim resolved with verdict: ${verdict}`,
    beforeState,
    afterState: updated,
  });

  return updated;
}
```

## Field Descriptions

### AuditLog Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique audit log identifier |
| `actionType` | Enum | Type of action performed |
| `entityType` | Enum | Type of entity (CLAIM, EVIDENCE, etc.) |
| `entityId` | String | ID of the entity affected |
| `userId` | String | ID of user who performed action (nullable) |
| `walletAddress` | String | Wallet address if applicable |
| `description` | Text | Human-readable description |
| `beforeState` | JSON | Entity state before action |
| `afterState` | JSON | Entity state after action |
| `metadata` | JSON | Additional context (service, handler name, errors) |
| `ipAddress` | String | Client IP address |
| `userAgent` | String | Client user agent |
| `createdAt` | DateTime | Timestamp of action |
| `correlationId` | String | Request correlation ID for tracing |

## Data Retention

Audit logs are stored indefinitely by default. For retention policies:

```typescript
// Delete logs older than 90 days
await this.auditTrailService.deleteOldLogs(90);
```

## Best Practices

1. **Always include userId** - Track who performed each action
2. **Capture state changes** - Use `beforeState` and `afterState` for change tracking
3. **Use correlation IDs** - For tracing related actions across requests
4. **Include wallet address** - For blockchain-related actions
5. **Add meaningful descriptions** - For quick human review
6. **Set metadata** - Include context like method/handler names

## Example Usage

### Track Claim Resolution

```typescript
async resolveClaim(
  claimId: string,
  verdict: boolean,
  confidenceScore: number,
  userId: string,
): Promise<Claim> {
  const claim = await this.claimRepo.findOne(claimId);
  
  await this.auditTrailService.log({
    actionType: AuditActionType.CLAIM_RESOLVED,
    entityType: AuditEntityType.CLAIM,
    entityId: claimId,
    userId,
    description: `Resolved with verdict: ${verdict}, confidence: ${confidenceScore}`,
    beforeState: {
      resolvedVerdict: claim.resolvedVerdict,
      confidenceScore: claim.confidenceScore,
      finalized: claim.finalized,
    },
    afterState: {
      resolvedVerdict: verdict,
      confidenceScore,
      finalized: claim.finalized,
    },
    metadata: {
      claimType: claim.claimType,
      verificationMethod: 'automated',
    },
  });

  claim.resolvedVerdict = verdict;
  claim.confidenceScore = confidenceScore;
  return this.claimRepo.save(claim);
}
```

### Query User Actions

```typescript
// Get all actions by a user
const { logs, total } = await this.auditTrailService.getUserAuditLogs(userId);

// Get all claim-related actions by the user
const { logs } = await this.auditTrailService.getAuditLogs(
  AuditEntityType.CLAIM,
  undefined,
  userId,
  100,
);

// Get change history for a claim
const history = await this.auditTrailService.getChangeHistory(
  AuditEntityType.CLAIM,
  claimId,
);
```

## Monitoring & Analytics

The audit trail enables:
- **Compliance reporting** - Prove who did what and when
- **Fraud detection** - Identify suspicious patterns
- **Performance analysis** - Track action frequencies
- **User behavior** - Understand user workflows
- **Change tracking** - See all modifications to claims/evidence
- **SLA audits** - Verify timelines and SLAs

## Security Considerations

- Audit logs are immutable (no deletion of historical logs)
- Includes IP address and user agent for security analysis
- Correlation IDs enable request tracing
- All timestamps are critical for compliance
- Never log sensitive data (passwords, keys) in state fields

## Migration

To apply the audit trail to your database:

```bash
npm run typeorm migration:generate -- src/migrations/AddAuditLog
npm run typeorm migration:run
```

Or manually create the `audit_logs` table:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actionType VARCHAR NOT NULL,
  entityType VARCHAR NOT NULL,
  entityId VARCHAR NOT NULL,
  userId VARCHAR,
  walletAddress VARCHAR,
  description TEXT,
  beforeState JSON,
  afterState JSON,
  metadata JSON,
  ipAddress VARCHAR,
  userAgent VARCHAR,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  correlationId VARCHAR,
  INDEX (userId),
  INDEX (entityType),
  INDEX (actionType),
  INDEX (createdAt),
  INDEX (entityId),
  INDEX (userId, createdAt),
  INDEX (actionType, createdAt)
);
```
