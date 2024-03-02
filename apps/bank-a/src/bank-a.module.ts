import { Module } from '@nestjs/common';
import { BankAController } from './bank-a.controller';
import { BankAService } from './bank-a.service';
import { RmqModule } from '@app/common';
import {
  BANKS_SIMULATION_RESPONSES,
  LOAN_SIM_REQ_BRD,
} from 'apps/loan-quotes/src/constants/services';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_BRD_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/bank-a/.env',
    }),
    RmqModule.register({ name: LOAN_SIM_REQ_BRD }),
    RmqModule.register({ name: BANKS_SIMULATION_RESPONSES }),
  ],
  controllers: [BankAController],
  providers: [BankAService],
})
export class BankAModule {}
