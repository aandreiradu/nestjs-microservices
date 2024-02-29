import { NestFactory } from '@nestjs/core';
import { CreditBureauModule } from './credit-bureau.module';
import { RmqService } from '@app/common';
import { CREDIT_BUREAU_REQUEST_SERVICE } from 'apps/loan-quotes/src/constants/services';

async function bootstrap() {
  const app = await NestFactory.create(CreditBureauModule);
  const rmqService = app.get<RmqService>(RmqService);

  app.connectMicroservice(rmqService.getOptions(CREDIT_BUREAU_REQUEST_SERVICE));

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('CB Started on port 3001');
}
bootstrap();
