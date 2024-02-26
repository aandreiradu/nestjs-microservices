import { Injectable } from '@nestjs/common';

@Injectable()
export class BankCService {
  getHello(): string {
    return 'Hello World!';
  }
}
