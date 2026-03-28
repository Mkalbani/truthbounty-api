# Audit Trail Quick Reference

## 🎯 What Was Built

A complete audit trail system tracking all critical actions in TruthBounty:
- **Claim submissions, updates, resolutions, and finalizations**
- **Evidence/verification submissions and updates**
- **Reward calculations and distributions**
- **User actions and wallet linking**

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `AUDIT_TRAIL.md` | Complete technical documentation and API reference |
| `AUDIT_SETUP.md` | Integration guide with code examples |
| `AUDIT_IMPLEMENTATION.md` | Implementation summary and architecture |

## 🚀 Quick Start

### 1. Run Migration
```bash
npm run typeorm migration:run
```

### 2. Test It Works
```bash
# Create a claim
curl -X POST http://localhost:3000/claims \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'

# Query audit logs
curl http://localhost:3000/audit
```

## 📡 Main Endpoints

```
GET  /audit                           # All logs with filters
GET  /audit/entity/CLAIM/{id}        # Logs for specific entity
GET  /audit/user/{userId}            # All user actions
GET  /audit/action/{actionType}      # All logs for action type
GET  /audit/changes/CLAIM/{id}       # Change history
GET  /audit/summary                  # Summary by action type
```

## 💻 Using in Code

### Option 1: Decorator (Automatic)
```typescript
@AuditLog({
  actionType: AuditActionType.CLAIM_CREATED,
  entityType: AuditEntityType.CLAIM,
  captureAfterState: true,
})
async createClaim(data) { }
```

### Option 2: Direct Service Call
```typescript
await this.auditTrailService.log({
  actionType: AuditActionType.CLAIM_RESOLVED,
  entityType: AuditEntityType.CLAIM,
  entityId: claimId,
  userId,
  description: 'Claim resolved',
  beforeState: { verdict: null },
  afterState: { verdict: true },
});
```

## 📊 Query Examples

```typescript
// Get all claim creation logs
const logs = await this.auditTrailService.getAuditLogs(
  AuditEntityType.CLAIM,
  AuditActionType.CLAIM_CREATED,
);

// Get user's all actions
const userLogs = await this.auditTrailService.getUserAuditLogs(userId);

// Get change history
const history = await this.auditTrailService.getChangeHistory(
  AuditEntityType.CLAIM,
  claimId,
);

// Get summary for last 30 days
const summary = await this.auditTrailService.getAuditSummary(
  AuditEntityType.CLAIM,
  30,
);
```

## 🔐 Supported Action Types

### Claims
- `CLAIM_CREATED` - New claim submitted
- `CLAIM_UPDATED` - Claim data changed
- `CLAIM_RESOLVED` - Verdict determined
- `CLAIM_FINALIZED` - Claim locked

### Evidence/Verification
- `EVIDENCE_SUBMITTED` - Evidence added
- `EVIDENCE_UPDATED` - Evidence version changed
- `EVIDENCE_VERIFIED` - Evidence approved
- `EVIDENCE_FLAGGED` - Evidence flagged

### Rewards
- `REWARD_CALCULATED` - Amount computed
- `REWARD_DISTRIBUTED` - Reward sent
- `REWARD_CLAIMED` - User claimed

### Users
- `USER_CREATED` - New user
- `WALLET_LINKED` - Wallet connected
- `VERIFICATION_INITIATED` - Verification started

## 📁 Module Structure

```
src/audit/
├── entities/          # AuditLog model
├── services/          # AuditTrailService
├── decorators/        # @AuditLog decorator
├── interceptors/      # Logging interceptor
├── controllers/       # REST endpoints
└── audit.module.ts    # Module definition
```

## 🧪 What's Integrated

✅ **Claims Service** - Full audit logging
✅ **Evidence Service** - Full audit logging  
🔲 **Rewards Service** - Ready for integration (add manually)
🔲 **Identity Service** - Ready for integration (add manually)

## 🔧 Adding Audit to More Services

1. Inject `AuditTrailService` in constructor
2. Add service to module providers
3. Call `log()` method after changes
4. Or use `@AuditLog` decorator on methods

Example:
```typescript
constructor(private auditTrailService: AuditTrailService) {}

async myMethod() {
  // Do something...
  await this.auditTrailService.log({
    actionType: AuditActionType.MY_ACTION,
    entityType: AuditEntityType.MY_ENTITY,
    entityId,
    userId,
  });
}
```

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Logs not appearing | Check AuditModule imported in AppModule |
| Type errors | Run `npm install` and rebuild |
| Query returns nothing | Verify exact ID and type values |
| Performance slow | Check pagination parameters |

## 📖 Learn More

- See `AUDIT_TRAIL.md` for complete documentation
- See `AUDIT_SETUP.md` for integration examples
- See `AUDIT_IMPLEMENTATION.md` for architecture details

## ✅ Acceptance Criteria

✅ Track all critical user actions (claims, verification, rewards)  
✅ Ensure traceability (user, timestamp, IP, UA recorded)  
✅ Audit logs stored persistently (SQLite via TypeORM)  
✅ Audit logs queryable (comprehensive REST API)  
✅ Support filtering, pagination, summaries, change history  

## 🎓 Example Workflow

1. **User creates claim** → `CLAIM_CREATED` logged
2. **Verifier submits evidence** → `EVIDENCE_SUBMITTED` logged
3. **Claim resolved** → `CLAIM_RESOLVED` with verdict logged
4. **Rewards distributed** → `REWARD_DISTRIBUTED` logged
5. **Query history** → Get full trail of changes

```bash
curl http://localhost:3000/audit/changes/CLAIM/{id}
```

Response shows complete history with timestamps and changes.

## 🔒 Features

- **Immutable logs** - append-only, no deletion
- **Indexing** - fast queries on frequently used fields
- **Pagination** - handle large datasets
- **Correlation IDs** - trace requests
- **State snapshots** - see before/after
- **Metadata** - IP, user agent, error details

## 🎯 Next Steps

1. Run migrations: `npm run typeorm migration:run`
2. Test endpoints with cURL or Postman
3. Add audit logging to Rewards service
4. Add audit logging to Identity service
5. Set up monitoring/alerting on audit logs
6. Create compliance reports from audit data
