import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SimulationResult = {
  bankName: string;
  amount: number;
  period: number;
  message: string;
  interestRate?: number;
};

interface PendingSimulation {
  expireTime: number;
  exceptedResults: number;
  receivedResults: number;
  isExpired: boolean;
  SSN: string;
  resolve: any;
  reject: any;
  simulationResults: SimulationResult[];
}

@Injectable()
export class ReplyService {
  private pendingRequests: Map<string, PendingSimulation> = new Map();
  private readonly logger = new Logger(ReplyService.name);

  constructor(private readonly configService: ConfigService) {}

  async waitForReply(correlationId: string, SSN: string): Promise<any> {
    const expireAt = this.getExpireTime();

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(correlationId, {
        resolve,
        reject,
        SSN,
        isExpired: false,
        expireTime: expireAt,
        exceptedResults: 3,
        receivedResults: 0,
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
    return new Date(expireAt).getTime();
  }

  pickBestResult(simulationResults: SimulationResult[]) {
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

  isExpired(expireAt) {
    return Date.now() > expireAt;
  }

  monitorExpirationTime(correlationId) {
    const intervalId = setInterval(() => {
      const pendingRequest = this.pendingRequests.get(correlationId);

      if (pendingRequest) {
        const { expireTime } = pendingRequest;
        if (
          this.isExpired(expireTime)
          // || pendingRequest.exceptedResults !== pendingRequest.receivedResults
        ) {
          this.logger.warn(
            `Waiting time for correlationId ${correlationId} has expired...picking the best result`,
          );
          pendingRequest.isExpired = true;
          const results = this.getBestResult(correlationId);
          clearInterval(intervalId);
          pendingRequest.resolve(results);
        }
      }
    }, 10000);

    return intervalId;
  }

  handleResponse(
    correlationId: string,
    data: any,
    resolver: PendingSimulation,
  ) {
    try {
      if (resolver) {
        this.addSimulationResult(correlationId, data);

        if (
          resolver.exceptedResults === resolver.receivedResults &&
          !resolver.isExpired
        ) {
          const bestResults = this.getBestResult(correlationId);

          resolver.resolve(bestResults);
          this.pendingRequests.delete(correlationId);
          return;
        }
      } else {
        this.logger.error(
          `No pending request found for correlation ID: ${correlationId}`,
        );
      }
    } catch (error) {
      this.logger.error('error occured heere', error);
      resolver.reject('Exception occured');
    }
  }

  handleResponseError(correlationId: string, error: any): void {
    const resolver = this.pendingRequests.get(correlationId);
    if (resolver) {
      resolver.reject(error);

      this.pendingRequests.delete(correlationId);
    } else {
      this.logger.error(
        `No pending request found for correlation ID: ${correlationId}`,
      );
    }
  }

  addSimulationResult(correlationId: string, result: SimulationResult) {
    const pendingRequest = this.pendingRequests.get(correlationId);

    if (pendingRequest.isExpired) {
      this.logger.warn(
        `CorrelationId ${correlationId} is expired... cannot add results`,
      );
      return;
    }

    if (pendingRequest.receivedResults < pendingRequest.exceptedResults) {
      pendingRequest.receivedResults = pendingRequest.receivedResults + 1;
      this.logger.log(`Increased excepted results with 1 unit`);
    } else {
      this.logger.error(
        `CorrelationId ${correlationId} received more responses than expected: pendingRequest.exceptedResults + 1`,
      );
    }

    const intervalId = this.monitorExpirationTime(correlationId);
    pendingRequest.simulationResults.push(result);

    if (pendingRequest.exceptedResults === pendingRequest.receivedResults) {
      this.logger.log(
        `CID ${correlationId} received all the responses...reply to the client`,
      );
      clearInterval(intervalId);

      const bestResults = this.getBestResult(correlationId);

      pendingRequest.resolve(bestResults);
      this.pendingRequests.delete(correlationId);
      return;
    }
  }

  setPendingResult(correlationId: string, result: any) {
    const resolver = this.pendingRequests.get(correlationId);
    if (resolver) {
      this.handleResponse(correlationId, result, resolver);
    } else {
      this.logger.error(
        `No pending request found for correlation ID: ${correlationId}`,
      );
    }
  }
}
