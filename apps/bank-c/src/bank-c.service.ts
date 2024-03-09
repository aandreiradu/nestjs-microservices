import { Injectable, Logger } from '@nestjs/common';

export interface SimulationDTO {
  amount: number;
  correlationId: string;
  customerFinancialHistory: {
    SSN: string;
    fullName: string;
    creditScore: number;
  } | null;
}

export interface SimulationResponse {
  amount: number;
  period: number;
  message: string;
  interestRate?: number;
}
@Injectable()
export class BankCService {
  private readonly logger: Logger = new Logger(BankCService.name);

  async loanSimulation(dto: SimulationDTO): Promise<SimulationResponse> {
    if (!dto.customerFinancialHistory) {
      this.logger.log(
        `Missing financial history for correlationId ${dto.correlationId}`,
      );
      return {
        amount: dto.amount,
        period: 0,
        message: `Missing financial history.`,
      };
    }

    return new Promise((resolve) => {
      if (dto.amount % 2 === 0) {
        setTimeout(() => {
          return resolve({
            amount: dto.amount,
            period: 8,
            interestRate: 7.12,
            message: `Simulation succeeded`,
          });
        }, 12000);
      } else {
        setTimeout(() => {
          return resolve({
            amount: dto.amount,
            period: 12,
            interestRate: 8.5,
            message: `Simulation succeeded`,
          });
        }, 11000);
      }
    });
  }
}
