import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {

  constructor(
    private readonly conversationService: ConversationService,
  ) {}

  @Get()
  async findAll() {
    return this.conversationService.findAll();
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
  ) {
    return this.conversationService.getMessages(
      Number(id),
    );
  }
}