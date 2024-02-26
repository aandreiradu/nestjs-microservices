import { Test, TestingModule } from '@nestjs/testing';
import { BankCController } from './bank-c.controller';
import { BankCService } from './bank-c.service';

describe('BankCController', () => {
  let bankCController: BankCController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BankCController],
      providers: [BankCService],
    }).compile();

    bankCController = app.get<BankCController>(BankCController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bankCController.getHello()).toBe('Hello World!');
    });
  });
});
