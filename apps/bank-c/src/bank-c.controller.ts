import {
  Controller,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BankCService, SimulationDTO } from './bank-c.service';
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
export class BankCController {
  private readonly logger: Logger = new Logger(BankCController.name);

  constructor(
    private readonly bankCService: BankCService,
    private readonly rmqService: RmqService,
    @Inject(BANKS_SIMULATION_RESPONSES) private simResultsClient: ClientProxy,
  ) {}

  @EventPattern('queue.sim.ing')
  async handleLoanSimulationRequest(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      const parsedSimulationRequest = JSON.parse(data) as SimulationDTO;

      const simulationResponse = await this.bankCService.loanSimulation(
        parsedSimulationRequest,
      );

      await lastValueFrom(
        this.simResultsClient.emit(
          'sim.results.queue',
          JSON.stringify({
            correlationId: parsedSimulationRequest.correlationId,
            simulationResults: {
              ...simulationResponse,
              bankName: 'Bank C',
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
