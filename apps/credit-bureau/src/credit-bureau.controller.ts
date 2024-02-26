import { Controller, Get } from '@nestjs/common';
import { CreditBureauService } from './credit-bureau.service';

@Controller()
export class CreditBureauController {
  constructor(private readonly creditBureauService: CreditBureauService) {}

  @Get()
  getHello(): string {
    return this.creditBureauService.getHello();
  }
}
