import {
  Body,
  Controller,
  Inject,
  Logger,
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
import { RmqService } from '@app/common';
import { CREDIT_BUREAU_RESPONSE_SERVICE } from 'apps/loan-quotes/src/constants/services';
import { lastValueFrom } from 'rxjs';

type CreditBureauRequestType = {
  SSN: string;
  correlationId: string;
};
@Controller()
export class CreditBureauController {
  private readonly logger: Logger = new Logger(CreditBureauController.name);

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

  async getCreditBureauResult(@Param('SSN') ssn: string) {
    return this.creditBureauService.getCBResult(ssn);
  }

  @EventPattern('credit.bureau.request')
  async handleCreditBureauRequest(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      const parsedData = JSON.parse(data) as unknown as CreditBureauRequestType;
      const { SSN, correlationId } = parsedData ?? {};

      if (!SSN) {
        this.logger.error(`Missing SSN for correlationId ${correlationId}`);
        this.rmqService.ack(context);
        return;
      }

      const customerFinancialHistory = await this.getCreditBureauResult(SSN);

      await lastValueFrom(
        this.creditBureauClient.emit(
          'credit.bureau.response',
          JSON.stringify({
            ...parsedData,
            customerFinancialHistory: customerFinancialHistory ?? null,
          }),
        ),
      );

      this.logger.log(`Successfully processed correlationId ${correlationId}`);
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(
        `Failed to process correlationId ${JSON.stringify(data)}`,
      );
      this.logger.error(error);

      return null;
    }
  }
}
