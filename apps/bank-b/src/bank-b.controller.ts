import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BankBService, SimulationDTO } from './bank-b.service';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { BANKS_SIMULATION_RESPONSES } from 'apps/loan-quotes/src/constants/services';
import { lastValueFrom } from 'rxjs';

@Controller()
export class BankBController {
  private readonly logger: Logger = new Logger(BankBController.name);

  constructor(
    private readonly bankAService: BankBService,
    private readonly rmqService: RmqService,
    @Inject(BANKS_SIMULATION_RESPONSES) private simResultsClient: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.bankAService.getHello();
  }

  @EventPattern('queue.sim.bt')
  async handleLoanSimulationRequest(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('BRD RECEIVED MESSAGE');
    try {
      const parsedSimulationRequest = JSON.parse(data) as SimulationDTO;

      const simulationResponse = await this.bankAService.loanSimulation(
        parsedSimulationRequest,
      );

      await lastValueFrom(
        this.simResultsClient.emit(
          'sim.results.queue',
          JSON.stringify({
            data,
            simulationResponse,
          }),
        ),
      );

      this.logger.log(
        `Successfully simulated for correlationId ${parsedSimulationRequest.correlationId}`,
      );
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(`Failed to publish to Simulation Requests Queue`);
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }
}
