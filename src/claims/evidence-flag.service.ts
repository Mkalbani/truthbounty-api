import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvidenceFlag } from './entities/evidence-flag.entity';
import { Evidence } from './entities/evidence.entity';

@Injectable()
export class EvidenceFlagService {
  constructor(
    @InjectRepository(EvidenceFlag)
    private readonly flagRepo: Repository<EvidenceFlag>,
    @InjectRepository(Evidence)
    private readonly evidenceRepo: Repository<Evidence>,
  ) {}

  async createFlag(evidenceId: string, reason: string, flaggedBy?: string): Promise<EvidenceFlag> {
    const evidence = await this.evidenceRepo.findOneBy({ id: evidenceId });
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${evidenceId} not found`);
    }

    const flag = this.flagRepo.create({ evidenceId, reason, flaggedBy });
    return this.flagRepo.save(flag);
  }

  async getFlagsForEvidence(evidenceId: string): Promise<EvidenceFlag[]> {
    return this.flagRepo.find({ where: { evidenceId }, order: { createdAt: 'ASC' } });
  }
}
