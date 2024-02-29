import { Module } from '@nestjs/common';
import { CreditBureauController } from './credit-bureau.controller';
import { CreditBureauService } from './credit-bureau.service';
import { CreditBureauRepository } from './credit-bureau.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditBureau, CreditBureauSchema } from './schemas/cb.schemas';
import { DatabaseModule, RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CREDIT_BUREAU_RESPONSE_SERVICE } from 'apps/loan-quotes/src/constants/services';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_CREDIT_BUREAU_REQUEST_QUEUE: Joi.string().required(),
        RABBIT_MQ_CREDIT_BUREAU_RESPONSE_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/credit-bureau/.env',
    }),
    MongooseModule.forFeature([
      { name: CreditBureau.name, schema: CreditBureauSchema },
    ]),
    DatabaseModule,
    RmqModule.register({ name: CREDIT_BUREAU_RESPONSE_SERVICE }),
  ],
  controllers: [CreditBureauController],
  providers: [CreditBureauService, CreditBureauRepository],
})
export class CreditBureauModule {}
