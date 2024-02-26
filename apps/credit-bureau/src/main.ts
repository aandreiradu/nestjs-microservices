import { NestFactory } from '@nestjs/core';
import { CreditBureauModule } from './credit-bureau.module';

async function bootstrap() {
  const app = await NestFactory.create(CreditBureauModule);
  await app.listen(3000);
}
bootstrap();
