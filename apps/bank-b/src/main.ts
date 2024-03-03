import { NestFactory } from '@nestjs/core';
import { BankBModule } from './bank-b.module';
import { RmqService } from '@app/common';
import { LOAN_SIM_REQ_BT } from 'apps/loan-quotes/src/constants/services';

async function bootstrap() {
  const app = await NestFactory.create(BankBModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(LOAN_SIM_REQ_BT));
  await app.startAllMicroservices();
}
bootstrap();
