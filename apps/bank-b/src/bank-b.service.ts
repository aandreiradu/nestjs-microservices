import { Injectable } from '@nestjs/common';

@Injectable()
export class BankBService {
  getHello(): string {
    return 'Hello World!';
  }
}
