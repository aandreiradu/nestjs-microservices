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
}
@Injectable()
export class BankAService {
  private readonly logger: Logger = new Logger(BankAService.name);

  getHello(): string {
    return 'Hello World!';
  }

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
            period: 6,
            message: `Simulation succeeded`,
          });
        }, 5000);
      } else {
        setTimeout(() => {
          return resolve({
            amount: dto.amount,
            period: 12,
            message: `Simulation succeeded`,
          });
        }, 10000);
      }
    });
  }
}
