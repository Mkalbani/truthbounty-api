import { Controller, Get, Param, Query, Post, Body, Put } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { EvidenceService } from './evidence.service';

@Controller('claims')
export class ClaimsController {
    constructor(
        private readonly claimsService: ClaimsService,
        private readonly evidenceService: EvidenceService,
    ) { }

    @Get('latest')
    async getLatest(@Query('limit') limit?: number) {
        return this.claimsService.findLatest(limit ? +limit : 10);
    }

    @Get('user/:wallet')
    async getByUser(@Param('wallet') wallet: string) {
        return this.claimsService.findByUser(wallet);
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.claimsService.findOne(id);
    }

    @Post()
    async createOne(@Body() data: any) {
        return this.claimsService.createClaim(data);
    }
    // Evidence endpoints
    @Post(':claimId/evidence')
    async createEvidence(@Param('claimId') claimId: string, @Body() body: { cid: string }) {
        return this.evidenceService.createEvidence(claimId, body.cid);
    }

    @Put('evidence/:evidenceId')
    async updateEvidence(@Param('evidenceId') evidenceId: string, @Body() body: { cid: string }) {
        return this.evidenceService.addEvidenceVersion(evidenceId, body.cid);
    }

    @Get(':claimId/evidence')
    async getEvidenceForClaim(@Param('claimId') claimId: string) {
        return this.evidenceService.getEvidenceForClaim(claimId);
    }

    @Get(':claimId/evidence/latest')
    async getLatestEvidenceForClaim(@Param('claimId') claimId: string) {
        return this.evidenceService.getLatestEvidenceForClaim(claimId);
    }

    @Get('evidence/:evidenceId')
    async getEvidence(@Param('evidenceId') evidenceId: string) {
        return this.evidenceService.getEvidence(evidenceId);
    }
}
