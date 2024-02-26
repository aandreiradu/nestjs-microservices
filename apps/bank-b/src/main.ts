import { NestFactory } from '@nestjs/core';
import { BankBModule } from './bank-b.module';

async function bootstrap() {
  const app = await NestFactory.create(BankBModule);
  await app.listen(3000);
}
bootstrap();
