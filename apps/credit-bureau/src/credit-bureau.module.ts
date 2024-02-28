import { Module } from '@nestjs/common';
import { CreditBureauController } from './credit-bureau.controller';
import { CreditBureauService } from './credit-bureau.service';
import { CreditBureauRepository } from './credit-bureau.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditBureau, CreditBureauSchema } from './schemas/cb.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreditBureau.name, schema: CreditBureauSchema },
    ]),
  ],
  controllers: [CreditBureauController],
  providers: [CreditBureauService, CreditBureauRepository],
})
export class CreditBureauModule {}
