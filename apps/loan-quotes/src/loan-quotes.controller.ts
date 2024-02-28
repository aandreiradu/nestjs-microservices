import { Controller, Get } from '@nestjs/common';
import { LoanQuotesService } from './loan-quotes.service';

@Controller()
export class LoanQuotesController {
  constructor(private readonly loanQuotesService: LoanQuotesService) {}

  @Get()
  getHello(): string {
    return this.loanQuotesService.getHello();
  }
}
