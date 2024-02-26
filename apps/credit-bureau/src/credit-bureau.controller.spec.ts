import { Test, TestingModule } from '@nestjs/testing';
import { CreditBureauController } from './credit-bureau.controller';
import { CreditBureauService } from './credit-bureau.service';

describe('CreditBureauController', () => {
  let creditBureauController: CreditBureauController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CreditBureauController],
      providers: [CreditBureauService],
    }).compile();

    creditBureauController = app.get<CreditBureauController>(CreditBureauController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(creditBureauController.getHello()).toBe('Hello World!');
    });
  });
});
