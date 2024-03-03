import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SimulationResults = {
  bankName: string;
  amount: number;
  period: number;
  message: string;
  interestRate?: number;
};

interface PendingSimulation {
  expireTime?: number;
  exceptedResponses: number;
  SSN?: string;
  resolve?: any;
  reject?: any;
  simulationResults: SimulationResults[];
}

@Injectable()
export class ReplyService {
  private pendingRequests: Map<string, PendingSimulation> = new Map();
  private readonly logger = new Logger(ReplyService.name);

  constructor(private readonly configService: ConfigService) {}

  async waitForReply(correlationId: string, SSN: string): Promise<any> {
    const expireAt = this.getExpireTime();
    console.log(`CID expires at ${expireAt}`);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(correlationId, {
        resolve,
        reject,
        SSN,
        expireTime: expireAt,
        exceptedResponses: 2,
        simulationResults: [],
      });
    });
  }

  getExpireTime() {
    const expireTimeMinutes = this.configService.get<number>(
      'EXPIRE_TIME_RESULTS_MINUTES',
    );
    const now = new Date();
    const expireAt = now.setMinutes(now.getMinutes() + +expireTimeMinutes);
    console.log('expireAt', expireAt);
    return new Date(expireAt).getTime();
  }

  pickBestResult(simulationResults: SimulationResults[]) {
    return simulationResults.reduce((acc, current) => {
      if (!acc || current.interestRate < acc.interestRate) {
        return current;
      }

      return acc;
    }, null);
  }

  getBestResult(correlationId: string) {
    const simulationResults = this.pendingRequests.get(correlationId);

    if (simulationResults) {
      const { simulationResults: bankSimulationResults, resolve } =
        simulationResults;

      if (!bankSimulationResults || !bankSimulationResults.length) {
        resolve([]);
        this.logger.log(
          `No results received for correlationId ${correlationId}`,
        );
        this.pendingRequests.delete(correlationId);
      }

      const bestResult = this.pickBestResult(bankSimulationResults);
      this.logger.log(`Best result for correlationId ${correlationId} is `);
      this.logger.log(bestResult);

      return bestResult;
    }
  }

  monitorExpirationTime(correlationId) {
    setInterval(() => {
      const pendingRequest = this.pendingRequests.get(correlationId);

      if (pendingRequest) {
        const { expireTime } = pendingRequest;
        const now = Date.now();
        if (now > expireTime) {
          this.logger.warn(
            `Waiting time for correlationId ${correlationId} has expired...picking the best result`,
          );
        }
      }
    }, 1000);
  }

  async handleResponse(correlationId: string, data: any, resolver: any) {
    console.log('handle response called');
    if (resolver) {
      console.log('i got the response for correlationId', correlationId);
      console.log(data);

      resolver.resolve(data);

      this.pendingRequests.delete(correlationId);
    } else {
      this.logger.error(
        `No pending request found for correlation ID: ${correlationId}`,
      );
    }
  }

  // Method to handle errors
  handleResponseError(correlationId: string, error: any): void {
    const resolver = this.pendingRequests.get(correlationId);
    if (resolver) {
      // Reject the corresponding promise with the error
      resolver.reject(error);

      // Remove the resolver from the map
      this.pendingRequests.delete(correlationId);
    } else {
      this.logger.error(
        `No pending request found for correlation ID: ${correlationId}`,
      );
    }
  }

  // Implement setPendingResult to store the result in the pendingResults map
  async setPendingResult(correlationId: string, result: any) {
    console.log('corid received', correlationId);
    const resolver = this.pendingRequests.get(correlationId);
    if (resolver) {
      await this.handleResponse(correlationId, result, resolver);
    } else {
      this.logger.error(
        `No pending request found for correlation ID: ${correlationId}`,
      );
    }
  }
}
