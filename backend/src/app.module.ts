import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { LlmModule } from './llm/llm.module';
import { DatabaseModule } from './database/database.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ChatModule,
    LlmModule,
    DatabaseModule,
    ConversationModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
