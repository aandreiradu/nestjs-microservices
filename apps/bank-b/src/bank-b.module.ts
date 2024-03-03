import { Module } from '@nestjs/common';
import { BankBController } from './bank-b.controller';
import { BankBService } from './bank-b.service';
import { RmqModule } from '@app/common';
import {
  BANKS_SIMULATION_RESPONSES,
  LOAN_SIM_REQ_BT,
} from 'apps/loan-quotes/src/constants/services';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_BT_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/bank-b/.env',
    }),
    RmqModule.register({ name: LOAN_SIM_REQ_BT }),
    RmqModule.register({ name: BANKS_SIMULATION_RESPONSES }),
  ],
  controllers: [BankBController],
  providers: [BankBService],
})
export class BankBModule {}
