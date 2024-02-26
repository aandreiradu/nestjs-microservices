import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: 'mongodb://mongo_db:27017/loan_quotes',
        auth: {
          username: 'root',
          password: 'password123',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
