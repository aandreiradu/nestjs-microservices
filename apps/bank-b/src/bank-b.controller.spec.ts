import { Test, TestingModule } from '@nestjs/testing';
import { BankBController } from './bank-b.controller';
import { BankBService } from './bank-b.service';

describe('BankBController', () => {
  let bankBController: BankBController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BankBController],
      providers: [BankBService],
    }).compile();

    bankBController = app.get<BankBController>(BankBController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bankBController.getHello()).toBe('Hello World!');
    });
  });
});
