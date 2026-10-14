import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from 'src/database/entities/conversation.entity';
import { Message } from 'src/database/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
    ]),
  ],

  controllers: [
    ConversationController,
  ],

  providers: [
    ConversationService,
  ],

  exports: [
    ConversationService,
  ],
})
export class ConversationModule {}