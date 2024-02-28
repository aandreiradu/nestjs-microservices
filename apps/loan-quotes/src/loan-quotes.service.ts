import { Injectable } from '@nestjs/common';

@Injectable()
export class LoanQuotesService {
  getHello(): string {
    return 'Hello World!';
  }
}
