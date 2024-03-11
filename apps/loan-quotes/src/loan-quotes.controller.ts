import {
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { CreditBureauResponse, LoanQuotesService } from './loan-quotes.service';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { RmqService } from '@app/common';
import {
  LOAN_REQUEST_SERVICE,
  LOAN_SIM_REQ_BRD,
  LOAN_SIM_REQ_BT,
  LOAN_SIM_REQ_ING,
} from './constants/services';
import { lastValueFrom } from 'rxjs';
import { ReplyService } from '@app/common/rmq/replyService';

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
    @Inject(LOAN_SIM_REQ_BT) private btClient: ClientProxy,
    @Inject(LOAN_SIM_REQ_ING) private ingClient: ClientProxy,
    private readonly rmqService: RmqService,
    private readonly loanQuotesService: LoanQuotesService,
    private readonly replyService: ReplyService,
  ) {}

  @Post()
  async quoteSimulation(@Body() dto: QuoteDTO) {
    try {
      const correlationId = uuidv4();
      await lastValueFrom(
        this.loanSimulationClient.emit(
          'loan.simulation.request',
          JSON.stringify({ ...dto, correlationId }),
        ),
      );

      const response = await this.replyService.waitForReply(
        correlationId,
        dto.SSN,
      );

      return response;
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
    const parsedSimulationRequest = JSON.parse(data) as unknown as QuoteDTO & {
      correlationId: string;
    };
    this.logger.log(
      `[loan.simulation.request.consumer] generated this correlationId ${parsedSimulationRequest.correlationId}`,
    );

    await this.loanQuotesService.requestCreditBureauInformations({
      SSN: parsedSimulationRequest.SSN,
      amount: parsedSimulationRequest.amount,
      correlationId: parsedSimulationRequest.correlationId,
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

      this.brdClient.emit('queue.sim.brd', JSON.stringify(parsedCBResult));
      this.btClient.emit('queue.sim.bt', JSON.stringify(parsedCBResult));
      this.ingClient.emit('queue.sim.ing', JSON.stringify(parsedCBResult));

      this.replyService.setExpireTime(parsedCBResult.correlationId);
      console.log('successfully set the expire time');

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
    try {
      this.logger.log('sim.results.queue results');
      const parsedResponse = JSON.parse(data);

      this.replyService.setPendingResult(
        parsedResponse.correlationId,
        parsedResponse.simulationResults,
      );

      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(`Failed to consume results from `);
      this.logger.debug(data);
      this.logger.error(error);
      this.rmqService.ack(context);
    }
  }
}
