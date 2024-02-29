import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CREDIT_BUREAU_REQUEST_SERVICE } from 'apps/loan-quotes/src/constants/services';
import { lastValueFrom } from 'rxjs';
import { QuoteDTO } from './loan-quotes.controller';

interface CreditBureauDTO extends QuoteDTO {
  correlationId: string;
}

@Injectable()
export class LoanQuotesService {
  private readonly logger: Logger = new Logger(LoanQuotesService.name);

  constructor(
    @Inject(CREDIT_BUREAU_REQUEST_SERVICE)
    private creditBureauClient: ClientProxy,
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

  getHello(): string {
    return 'Hello World!';
  }
}
