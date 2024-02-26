import { NestFactory } from '@nestjs/core';
import { BankAModule } from './bank-a.module';

async function bootstrap() {
  const app = await NestFactory.create(BankAModule);
  await app.listen(3000);
}
bootstrap();
