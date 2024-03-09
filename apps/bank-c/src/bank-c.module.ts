import { Module } from '@nestjs/common';
import { BankCController } from './bank-c.controller';
import { BankCService } from './bank-c.service';
import { RmqModule } from '@app/common';
import {
  BANKS_SIMULATION_RESPONSES,
  LOAN_SIM_REQ_ING,
} from 'apps/loan-quotes/src/constants/services';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_ING_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/bank-c/.env',
    }),
    RmqModule.register({ name: LOAN_SIM_REQ_ING }),
    RmqModule.register({ name: BANKS_SIMULATION_RESPONSES }),
  ],
  controllers: [BankCController],
  providers: [BankCService],
})
export class BankCModule {}
