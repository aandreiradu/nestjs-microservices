import { Injectable } from '@nestjs/common';

@Injectable()
export class BankAService {
  getHello(): string {
    return 'Hello World!';
  }
}
