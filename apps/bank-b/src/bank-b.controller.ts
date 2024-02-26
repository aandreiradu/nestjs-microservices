import { Controller, Get } from '@nestjs/common';
import { BankBService } from './bank-b.service';

@Controller()
export class BankBController {
  constructor(private readonly bankBService: BankBService) {}

  @Get()
  getHello(): string {
    return this.bankBService.getHello();
  }
}
