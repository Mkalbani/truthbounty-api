import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from './entities/claim.entity';
import { ClaimsCache } from '../cache/claims.cache';
import { Stake } from '../staking/entities/stake.entity';
import { AuditTrailService } from '../audit/services/audit-trail.service';
import { AuditActionType, AuditEntityType } from '../audit/entities/audit-log.entity';
import { AuditLog } from '../audit/decorators/audit-log.decorator';

@Injectable()
export class ClaimsService {
    private readonly logger = new Logger(ClaimsService.name);

    constructor(
        @InjectRepository(Claim)
        private readonly claimRepo: Repository<Claim>,
        @InjectRepository(Stake)
        private readonly stakeRepo: Repository<Stake>,
        private readonly claimsCache: ClaimsCache,
        private readonly auditTrailService: AuditTrailService,
    ) { }

    /**
     * Find a single claim by ID with caching
     */
    async findOne(id: string): Promise<Claim | null> {
        const cached = await this.claimsCache.getClaim(id);
        if (cached) return cached;

        const claim = await this.claimRepo.findOneBy({ id });
        if (claim) {
            await this.claimsCache.setClaim(id, claim);
        }
        return claim;
    }

    /**
     * Find latest claims with caching
     */
    async findLatest(limit = 10): Promise<Claim[]> {
        const cached = await this.claimsCache.getLatestClaims();
        if (cached) return cached;

        const claims = await this.claimRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });

        await this.claimsCache.setLatestClaims(claims);
        return claims;
    }

    /**
     * Find claims associated with a user wallet with caching
     */
    async findByUser(wallet: string): Promise<Claim[]> {
        const cached = await this.claimsCache.getUserClaims(wallet);
        if (cached) return cached;

        // Get claim IDs from user stakes
        const stakes = await this.stakeRepo.find({
            where: { walletAddress: wallet },
        });

        const claimIds = [...new Set(stakes.map(s => s.claimId))];
        if (claimIds.length === 0) return [];

        const claims = await this.claimRepo.createQueryBuilder('claim')
            .where('claim.id IN (:...ids)', { ids: claimIds })
            .orderBy('claim.createdAt', 'DESC')
            .getMany();

        await this.claimsCache.setUserClaims(wallet, claims);
        return claims;
    }

    /**
     * Create a new claim (Added for Load Testing purposes)
     */
    @AuditLog({
        actionType: AuditActionType.CLAIM_CREATED,
        entityType: AuditEntityType.CLAIM,
        descriptionTemplate: 'New claim created',
        captureAfterState: true,
    })
    async createClaim(data: any): Promise<Claim> {
        const claim = this.claimRepo.create({
            resolvedVerdict: Math.random() > 0.5,
            confidenceScore: Math.random() * 0.9 + 0.1, // Generate mock score
            finalized: false,
        });
        const savedClaim = await this.claimRepo.save(claim);

        // Using setClaim caching to simulate real world workload
        await this.claimsCache.setClaim(savedClaim.id, savedClaim);

        return savedClaim;
    }

    /**
     * Resolve a claim (update verdict and confidence)
     */
    async resolveClaim(
        claimId: string,
        verdict: boolean,
        confidenceScore: number,
        userId?: string,
    ): Promise<Claim> {
        const claim = await this.findOne(claimId);
        if (!claim) throw new Error(`Claim ${claimId} not found`);

        const beforeState = { ...claim };

        claim.resolvedVerdict = verdict;
        claim.confidenceScore = confidenceScore;

        const updatedClaim = await this.claimRepo.save(claim);
        await this.claimsCache.setClaim(claimId, updatedClaim);

        // Log the resolution
        await this.auditTrailService.log({
            actionType: AuditActionType.CLAIM_RESOLVED,
            entityType: AuditEntityType.CLAIM,
            entityId: claimId,
            userId,
            description: `Claim resolved with verdict: ${verdict}, confidence: ${confidenceScore}`,
            beforeState,
            afterState: updatedClaim,
        });

        return updatedClaim;
    }

    /**
     * Finalize a claim
     */
    async finalizeClaim(claimId: string, userId?: string): Promise<Claim> {
        const claim = await this.findOne(claimId);
        if (!claim) throw new Error(`Claim ${claimId} not found`);

        const beforeState = { ...claim };

        claim.finalized = true;
        const updatedClaim = await this.claimRepo.save(claim);
        await this.claimsCache.setClaim(claimId, updatedClaim);

        // Log the finalization
        await this.auditTrailService.log({
            actionType: AuditActionType.CLAIM_FINALIZED,
            entityType: AuditEntityType.CLAIM,
            entityId: claimId,
            userId,
            description: 'Claim finalized',
            beforeState,
            afterState: updatedClaim,
        });

        return updatedClaim;
    }
}
