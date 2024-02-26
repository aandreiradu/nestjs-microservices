import { Module } from '@nestjs/common';
import { BankCController } from './bank-c.controller';
import { BankCService } from './bank-c.service';

@Module({
  imports: [],
  controllers: [BankCController],
  providers: [BankCService],
})
export class BankCModule {}
