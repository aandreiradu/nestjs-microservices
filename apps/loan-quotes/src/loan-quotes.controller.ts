import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { LoanQuotesService } from './loan-quotes.service';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { RmqService } from '@app/common';
import { CreditBureau } from 'apps/credit-bureau/src/schemas/cb.schemas';
import { LOAN_REQUEST_SERVICE } from './constants/services';
import { lastValueFrom } from 'rxjs';

export interface QuoteDTO {
  SSN: string;
  amount: number;
}
@Controller()
export class LoanQuotesController {
  private readonly logger: Logger = new Logger(LoanQuotesController.name);

  constructor(
    @Inject(LOAN_REQUEST_SERVICE) private loanSimulationClient: ClientProxy,
    private readonly rmqService: RmqService,
    private readonly loanQuotesService: LoanQuotesService,
  ) {}

  @Post()
  async quoteSimulation(@Body() dto: QuoteDTO) {
    const response = await lastValueFrom(
      this.loanSimulationClient.emit(
        'loan.simulation.request',
        JSON.stringify({ ...dto }),
      ),
    );
    console.log('published to loan.simulation.request');

    console.log('response', response);
  }

  @EventPattern('loan.simulation.request')
  async handleLoanSimulationRequest(
    @Payload() data: QuoteDTO,
    @Ctx() context: RmqContext,
  ) {
    const simulationCorrelationId = uuidv4();
    console.log('generated this correlationId', simulationCorrelationId);

    await this.loanQuotesService.requestCreditBureauInformations(
      data,
      simulationCorrelationId,
    );

    console.log('invoked the requestCreditBureauInformations');

    this.rmqService.ack(context);
    console.log('acknoledged the message');
  }

  @EventPattern('credit.bureau.response')
  async handleCreditBureauResults(
    @Payload() data: QuoteDTO & CreditBureau,
    @Ctx() context: RmqContext,
  ) {
    console.log('credit.bureau.response consumer received data', data);

    this.rmqService.ack(context);
  }
}
