import { Injectable } from '@nestjs/common';

import { LlmService } from '../llm/llm.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly llmService: LlmService,
    private readonly conversationService: ConversationService,
  ) { }

  async chat(
    dto: ChatRequestDto,
  ): Promise<string> {
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const conversation =
        await this.conversationService.create(
          dto.message.substring(0, 50),
        );

      conversationId = conversation.id;
    }

    await this.conversationService.addMessage(
      conversationId,
      'user',
      dto.message,
    );

    const history =
      await this.conversationService.getMessages(
        conversationId,
      );

    const messages = history.map(
      (message) => ({
        role: message.role,
        content: message.content,
      }),
    );

    return this.llmService.generateFromMessages(
      messages,
    );
  }

  async stream(
    dto: ChatRequestDto,
    onChunk: (chunk: string) => void,
  ): Promise<number> {
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const conversation =
        await this.conversationService.create(
          dto.message.substring(0, 50),
        );

      conversationId = conversation.id;
    }

    await this.conversationService.addMessage(
      conversationId,
      'user',
      dto.message,
    );

    const history =
      await this.conversationService.getMessages(
        conversationId,
      );

    console.log(
      '===== HISTÓRICO DA CONVERSA =====',
    );

    console.dir(history, {
      depth: null,
    });

    const messages = history.map(
      (message) => ({
        role: message.role,
        content: message.content,
      }),
    );

    console.log(
      '===== MENSAGENS ENVIADAS PARA O LLM =====',
    );

    console.dir(messages, {
      depth: null,
    });

    let assistantResponse = '';

    await this.llmService.generateStreamFromMessages(
      messages,
      (chunk) => {
        assistantResponse += chunk;
        onChunk(chunk);
      },
    );

    await this.conversationService.addMessage(
      conversationId,
      'assistant',
      assistantResponse,
    );

    return conversationId;
  }
}