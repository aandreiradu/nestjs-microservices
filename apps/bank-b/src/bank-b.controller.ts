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
    private readonly bankBService: BankBService,
    private readonly rmqService: RmqService,
    @Inject(BANKS_SIMULATION_RESPONSES) private simResultsClient: ClientProxy,
  ) {}

  @EventPattern('queue.sim.bt')
  async handleLoanSimulationRequest(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      const parsedSimulationRequest = JSON.parse(data) as SimulationDTO;

      const simulationResponse = await this.bankBService.loanSimulation(
        parsedSimulationRequest,
      );

      await lastValueFrom(
        this.simResultsClient.emit(
          'sim.results.queue',
          JSON.stringify({
            correlationId: parsedSimulationRequest.correlationId,
            simulationResults: {
              ...simulationResponse,
              bankName: 'Bank B',
            },
          }),
        ),
      );

      this.logger.log(
        `BT Successfully simulated for correlationId ${parsedSimulationRequest.correlationId}`,
      );
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(`Failed to publish to Simulation Requests Queue`);
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }
}
