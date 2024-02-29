import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CreditBureauService } from './credit-bureau.service';
import { ValidationPipe } from '@app/common/utils/validation.pipe';
import { createCBRecord } from './dto/create-cb-record';
import { CreditBureau } from './schemas/cb.schemas';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { QuoteDTO } from 'apps/loan-quotes/src/loan-quotes.controller';
import { RmqService } from '@app/common';
import { CREDIT_BUREAU_RESPONSE_SERVICE } from 'apps/loan-quotes/src/constants/services';
import { lastValueFrom } from 'rxjs';

@Controller()
export class CreditBureauController {
  constructor(
    @Inject(CREDIT_BUREAU_RESPONSE_SERVICE)
    private creditBureauClient: ClientProxy,
    private readonly creditBureauService: CreditBureauService,
    private readonly rmqService: RmqService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe(createCBRecord))
  createCBRecord(@Body() dto: CreditBureau): Promise<CreditBureau> {
    return this.creditBureauService.createCBRecord(dto);
  }

  // @Get(':SSN')
  async getCreditBureauResult(@Param('SSN') ssn: string) {
    return this.creditBureauService.getCBResult(ssn);
  }

  @EventPattern('credit.bureau.request')
  async handleCreditBureauRequest(
    @Payload() data: QuoteDTO & { correlationId: string },
    @Ctx() context: RmqContext,
  ) {
    console.log('credit.bureau.request consumer received the request');

    const customerFinancialHistory = await this.getCreditBureauResult(data.SSN);
    console.log('customerFinancialHistory', customerFinancialHistory);

    await lastValueFrom(
      this.creditBureauClient.emit(
        'credit.bureau.response',
        JSON.stringify({
          ...data,
          customerFinancialHistory: customerFinancialHistory ?? null,
        }),
      ),
    );

    console.log('published to credit.bureau.response');
    this.rmqService.ack(context);
    console.log('acknoledged credit.bureau.request');
  }
}
