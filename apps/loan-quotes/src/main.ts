import { NestFactory } from '@nestjs/core';
import { LoanQuotesModule } from './loan-quotes.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(LoanQuotesModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');

  await app.listen(PORT);
  console.log(`LoanQuotes started on port ${PORT}`);
}
bootstrap();
