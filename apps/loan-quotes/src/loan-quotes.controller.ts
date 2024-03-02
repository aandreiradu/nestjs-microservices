import {
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import {
  CreditBureauDTO,
  CreditBureauResponse,
  LoanQuotesService,
} from './loan-quotes.service';
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
import { LOAN_REQUEST_SERVICE, LOAN_SIM_REQ_BRD } from './constants/services';
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
    @Inject(LOAN_SIM_REQ_BRD) private brdClient: ClientProxy,
    private readonly rmqService: RmqService,
    private readonly loanQuotesService: LoanQuotesService,
  ) {}

  @Post()
  async quoteSimulation(@Body() dto: QuoteDTO) {
    try {
      await lastValueFrom(
        this.loanSimulationClient.emit(
          'loan.simulation.request',
          JSON.stringify({ ...dto }),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to publish to Simulation Requests Queue`);
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }

  @EventPattern('loan.simulation.request')
  async handleLoanSimulationRequest(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const parsedSimulationRequest = JSON.parse(data) as unknown as QuoteDTO;
    const correlationId = uuidv4();
    this.logger.log(
      `[loan.simulation.request.consumer] generated this correlationId ${correlationId}`,
    );

    await this.loanQuotesService.requestCreditBureauInformations({
      SSN: parsedSimulationRequest.SSN,
      amount: parsedSimulationRequest.amount,
      correlationId,
    });

    this.rmqService.ack(context);
  }

  @EventPattern('credit.bureau.response')
  async handleCreditBureauResults(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      const parsedCBResult = JSON.parse(data) as QuoteDTO &
        CreditBureauResponse;

      await lastValueFrom(
        this.brdClient.emit('queue.sim.brd', JSON.stringify(parsedCBResult)),
      );

      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(
        `Failed to publish to Simulation Requests Queue for correlationId ${data.correlationId}`,
      );
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }

  @EventPattern('sim.results.queue')
  async handleBankSimulationResponse(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('sim.results.queue results');
    this.logger.log(data);

    this.rmqService.ack(context);
  }
}
