import { Test, TestingModule } from '@nestjs/testing';
import { LoanQuotesController } from './loan-quotes.controller';
import { LoanQuotesService } from './loan-quotes.service';

describe('LoanQuotesController', () => {
  let loanQuotesController: LoanQuotesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoanQuotesController],
      providers: [LoanQuotesService],
    }).compile();

    loanQuotesController = app.get<LoanQuotesController>(LoanQuotesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(loanQuotesController.getHello()).toBe('Hello World!');
    });
  });
});
