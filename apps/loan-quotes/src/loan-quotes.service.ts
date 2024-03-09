import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BANKS_SIMULATION_RESPONSES,
  CREDIT_BUREAU_REQUEST_SERVICE,
} from 'apps/loan-quotes/src/constants/services';
import { lastValueFrom } from 'rxjs';
import { QuoteDTO } from './loan-quotes.controller';
import { ConfigService } from '@nestjs/config';

export interface CreditBureauDTO extends QuoteDTO {
  correlationId: string;
}

export interface CreditBureauResponse {
  correlationId: string;
  customerFinancialHistory: {
    _id: string;
    SSN: string;
    fullName: string;
    creditScore: number;
  } | null;
}

@Injectable()
export class LoanQuotesService {
  private readonly logger: Logger = new Logger(LoanQuotesService.name);
  private pendingRequests: Map<string, any>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CREDIT_BUREAU_REQUEST_SERVICE)
    private creditBureauClient: ClientProxy,
    @Inject(BANKS_SIMULATION_RESPONSES)
    private readonly banksResponsesClient: ClientProxy,
  ) {}

  async requestCreditBureauInformations(cbDTO: CreditBureauDTO) {
    try {
      await lastValueFrom(
        this.creditBureauClient.emit(
          'credit.bureau.request',
          JSON.stringify(cbDTO),
        ),
      );

      this.logger.log(
        `Successfully requested Credit Bureau informations for correlationId ${cbDTO.correlationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to request Credit Bureau informations for correlationId ${cbDTO.correlationId}`,
      );
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }
}
