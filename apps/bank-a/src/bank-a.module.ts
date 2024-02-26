import { Module } from '@nestjs/common';
import { BankAController } from './bank-a.controller';
import { BankAService } from './bank-a.service';

@Module({
  imports: [],
  controllers: [BankAController],
  providers: [BankAService],
})
export class BankAModule {}
