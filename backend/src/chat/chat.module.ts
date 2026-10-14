import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LlmModule } from '../llm/llm.module';
import { Message } from 'src/database/entities/message.entity';
import { Conversation } from 'src/database/entities/conversation.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConversationService } from '../conversation/conversation.service';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationModule,
      Message,
    ]),
    LlmModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatService,
    ConversationService,
  ],
  exports: [
    ChatService,
    ConversationService,
  ],
})
export class ChatModule { }