import { NestFactory } from '@nestjs/core';
import { CreditBureauModule } from './credit-bureau.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(CreditBureauModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');

  await app.listen(PORT);
  console.log(`CB started on port ${PORT}`);
}
bootstrap();
