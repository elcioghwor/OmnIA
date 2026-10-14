import { Injectable } from '@nestjs/common';

import {
  ChatMessage,
  OllamaProvider,
} from './providers/ollama.provider';

import {
  Message,
} from '../database/entities/message.entity';

@Injectable()
export class LlmService {

  constructor(
    private readonly ollamaProvider: OllamaProvider,
  ) {}

  async generateFromMessages(
    messages: ChatMessage[],
  ): Promise<string> {

    return this.ollamaProvider.chat(messages);
  }

  async generateStreamFromMessages(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
  ): Promise<void> {

    await this.ollamaProvider.chatStream(
      messages,
      onChunk,
    );
  }

  async generateText(
    history: Message[],
  ): Promise<string> {

    const messages: ChatMessage[] =
      history.map((message) => ({
        role: message.role,
        content: message.content,
      }));

    return this.ollamaProvider.chat(
      messages,
    );
  }

  async generateStream(
    history: Message[],
    onChunk: (chunk: string) => void,
  ): Promise<void> {

    const messages: ChatMessage[] =
      history.map((message) => ({
        role: message.role,
        content: message.content,
      }));

    await this.ollamaProvider.chatStream(
      messages,
      onChunk,
    );
  }
}