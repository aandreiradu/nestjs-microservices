import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CREDIT_BUREAU_REQUEST_SERVICE } from 'apps/loan-quotes/src/constants/services';
import { lastValueFrom } from 'rxjs';
import { QuoteDTO } from './loan-quotes.controller';

@Injectable()
export class LoanQuotesService {
  constructor(
    @Inject(CREDIT_BUREAU_REQUEST_SERVICE)
    private creditBureauClient: ClientProxy,
  ) {}

  async requestCreditBureauInformations(
    { SSN, amount }: QuoteDTO,
    correlationId: string,
  ) {
    await lastValueFrom(
      this.creditBureauClient.emit(
        'credit.bureau.request',
        JSON.stringify({
          SSN,
          amount,
          correlationId,
        }),
      ),
    );

    console.log('Published to credit.bureau.request queue');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
