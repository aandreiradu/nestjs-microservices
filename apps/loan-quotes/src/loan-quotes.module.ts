import { Module } from '@nestjs/common';
import { LoanQuotesController } from './loan-quotes.controller';
import { LoanQuotesService } from './loan-quotes.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { CreditBureau } from 'apps/credit-bureau/src/schemas/cb.schemas';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/credit-bureau/.env',
    }),
    DatabaseModule,
    CreditBureau,
  ],
  controllers: [LoanQuotesController],
  providers: [LoanQuotesService],
})
export class LoanQuotesModule {}
