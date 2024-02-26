import { Injectable } from '@nestjs/common';
import { CreditBureauRepository } from './credit-bureau.repository';
import { CreditBureau } from './schemas/cb.schemas';

@Injectable()
export class CreditBureauService {
  constructor(
    private readonly creditBureauRepository: CreditBureauRepository,
  ) {}

  async createCBRecord(dto: CreditBureau) {
    return this.creditBureauRepository.create(dto);
  }

  async getCBResult(SSN: string) {
    return this.creditBureauRepository.findOne({ SSN });
  }
}
