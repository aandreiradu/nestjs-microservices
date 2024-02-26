import { Module } from '@nestjs/common';
import { CreditBureauController } from './credit-bureau.controller';
import { CreditBureauService } from './credit-bureau.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { CreditBureauRepository } from './credit-bureau.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditBureau, CreditBureauSchema } from './schemas/cb.schemas';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
      envFilePath: './apps/credit-bureau/.env',
    }),
    MongooseModule.forFeature([
      { name: CreditBureau.name, schema: CreditBureauSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [CreditBureauController],
  providers: [CreditBureauService, CreditBureauRepository],
})
export class CreditBureauModule {}
