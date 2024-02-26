import { NestFactory } from '@nestjs/core';
import { BankCModule } from './bank-c.module';

async function bootstrap() {
  const app = await NestFactory.create(BankCModule);
  await app.listen(3000);
}
bootstrap();
