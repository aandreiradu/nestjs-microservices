import { Module } from '@nestjs/common';
import { LoanQuotesController } from './loan-quotes.controller';
import { LoanQuotesService } from './loan-quotes.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import {
  BANKS_SIMULATION_RESPONSES,
  CREDIT_BUREAU_REQUEST_SERVICE,
  LOAN_REQUEST_SERVICE,
  LOAN_SIM_REQ_BRD,
  LOAN_SIM_REQ_BT,
  LOAN_SIM_REQ_ING,
} from './constants/services';
import { ReplyService } from '@app/common/rmq/replyService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/loan-quotes/.env',
    }),
    DatabaseModule,
    RmqModule.register({ name: LOAN_REQUEST_SERVICE }),
    RmqModule.register({ name: CREDIT_BUREAU_REQUEST_SERVICE }),
    RmqModule.register({ name: LOAN_SIM_REQ_BRD }),
    RmqModule.register({ name: LOAN_SIM_REQ_BT }),
    RmqModule.register({ name: LOAN_SIM_REQ_ING }),
    RmqModule.register({ name: BANKS_SIMULATION_RESPONSES }),
  ],
  controllers: [LoanQuotesController],
  providers: [LoanQuotesService, ReplyService],
})
export class LoanQuotesModule {}
