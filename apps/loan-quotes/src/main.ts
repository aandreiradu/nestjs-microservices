import { NestFactory } from '@nestjs/core';
import { LoanQuotesModule } from './loan-quotes.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common/rmq/rmq.service';
import { CREDIT_BUREAU_RESPONSE_SERVICE } from './constants/services';

async function bootstrap() {
  const app = await NestFactory.create(LoanQuotesModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  const PORT = configService.get('PORT');

  // app.connectMicroservice(
  //   rmqService.getOptions(CREDIT_BUREAU_RESPONSE_SERVICE),
  // );
  await app.startAllMicroservices();
  await app.listen(PORT);
  console.log(`LoanQuotes started on port ${PORT}`);
}
bootstrap();
