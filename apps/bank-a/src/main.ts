import { NestFactory } from '@nestjs/core';
import { BankAModule } from './bank-a.module';
import { RmqService } from '@app/common';
import { LOAN_SIM_REQ_BRD } from 'apps/loan-quotes/src/constants/services';

async function bootstrap() {
  const app = await NestFactory.create(BankAModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(LOAN_SIM_REQ_BRD));
  await app.startAllMicroservices();
}
bootstrap();
