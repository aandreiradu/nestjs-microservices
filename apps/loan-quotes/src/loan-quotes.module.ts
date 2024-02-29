import { Module } from '@nestjs/common';
import { LoanQuotesController } from './loan-quotes.controller';
import { LoanQuotesService } from './loan-quotes.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import {
  CREDIT_BUREAU_REQUEST_SERVICE,
  CREDIT_BUREAU_RESPONSE_SERVICE,
  LOAN_REQUEST_SERVICE,
} from './constants/services';

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
    RmqModule.register({ name: CREDIT_BUREAU_RESPONSE_SERVICE }),
  ],
  controllers: [LoanQuotesController],
  providers: [LoanQuotesService],
})
export class LoanQuotesModule {}
