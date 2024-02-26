import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditBureauService {
  getHello(): string {
    return 'Hello World!';
  }
}
