import { Test, TestingModule } from '@nestjs/testing';
import { BankAController } from './bank-a.controller';
import { BankAService } from './bank-a.service';

describe('BankAController', () => {
  let bankAController: BankAController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BankAController],
      providers: [BankAService],
    }).compile();

    bankAController = app.get<BankAController>(BankAController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bankAController.getHello()).toBe('Hello World!');
    });
  });
});
