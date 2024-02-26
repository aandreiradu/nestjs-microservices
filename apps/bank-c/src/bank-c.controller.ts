import { Controller, Get } from '@nestjs/common';
import { BankCService } from './bank-c.service';

@Controller()
export class BankCController {
  constructor(private readonly bankCService: BankCService) {}

  @Get()
  getHello(): string {
    return this.bankCService.getHello();
  }
}
