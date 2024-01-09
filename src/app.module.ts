import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './env.validation';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ validate, isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
