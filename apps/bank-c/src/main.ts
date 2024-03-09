import { NestFactory } from '@nestjs/core';
import { BankCModule } from './bank-c.module';
import { RmqService } from '@app/common';
import { LOAN_SIM_REQ_ING } from 'apps/loan-quotes/src/constants/services';

async function bootstrap() {
  const app = await NestFactory.create(BankCModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(LOAN_SIM_REQ_ING));
  await app.startAllMicroservices();
}
bootstrap();
