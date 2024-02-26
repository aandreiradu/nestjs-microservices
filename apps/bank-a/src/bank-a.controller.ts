import { Controller, Get } from '@nestjs/common';
import { BankAService } from './bank-a.service';

@Controller()
export class BankAController {
  constructor(private readonly bankAService: BankAService) {}

  @Get()
  getHello(): string {
    return this.bankAService.getHello();
  }
}
