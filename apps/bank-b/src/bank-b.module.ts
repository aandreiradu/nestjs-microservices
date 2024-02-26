import { Module } from '@nestjs/common';
import { BankBController } from './bank-b.controller';
import { BankBService } from './bank-b.service';

@Module({
  imports: [],
  controllers: [BankBController],
  providers: [BankBService],
})
export class BankBModule {}
