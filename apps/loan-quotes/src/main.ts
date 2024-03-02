import { NestFactory } from '@nestjs/core';
import { LoanQuotesModule } from './loan-quotes.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common';
import {
  BANKS_SIMULATION_RESPONSES,
  CREDIT_BUREAU_RESPONSE_SERVICE,
  LOAN_REQUEST_SERVICE,
} from './constants/services';

async function bootstrap() {
  const app = await NestFactory.create(LoanQuotesModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  const PORT = configService.get('PORT');

  app.connectMicroservice(rmqService.getOptions(LOAN_REQUEST_SERVICE));
  app.connectMicroservice(
    rmqService.getOptions(CREDIT_BUREAU_RESPONSE_SERVICE),
  );
  app.connectMicroservice(rmqService.getOptions(BANKS_SIMULATION_RESPONSES));

  await app.startAllMicroservices();
  await app.listen(PORT);
  console.log(`LoanQuotes started on port ${PORT}`);
}
bootstrap();
