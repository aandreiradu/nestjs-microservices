import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { CreditBureauService } from './credit-bureau.service';
import { ValidationPipe } from '@app/common/utils/validation.pipe';
import { createCBRecord } from './dto/create-cb-record';
import { CreditBureau } from './schemas/cb.schemas';

@Controller()
export class CreditBureauController {
  constructor(private readonly creditBureauService: CreditBureauService) {}

  @Post()
  @UsePipes(new ValidationPipe(createCBRecord))
  createCBRecord(@Body() dto: CreditBureau): Promise<CreditBureau> {
    return this.creditBureauService.createCBRecord(dto);
  }

  @Get(':SSN')
  async getCreditBureauResult(@Param('SSN') ssn: string) {
    return this.creditBureauService.getCBResult(ssn);
  }
}
