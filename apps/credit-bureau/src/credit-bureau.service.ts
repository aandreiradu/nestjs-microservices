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
    try {
      const customerFinancialHistory =
        await this.creditBureauRepository.findOne({ SSN });

      return customerFinancialHistory;
    } catch (error) {
      if (error instanceof Error) {
        const { message } = error;

        if (message === 'Document not found.') {
          return null;
        }

        throw error;
      }
    }
  }
}
