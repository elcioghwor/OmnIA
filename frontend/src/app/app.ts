import {
  ChangeDetectorRef,
  Component,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ChatMessage,
} from './models/chat-message.model';

import {
  ChatService,
} from './services/chat.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {

  messages: ChatMessage[] = [];

  input = '';

  loading = false;

  thinking = false;

  conversationId: number | null = null;

  constructor(
    private readonly chatService: ChatService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async sendMessage(): Promise<void> {

    const message = this.input.trim();

    if (!message || this.loading) {
      return;
    }

    this.input = '';

    this.messages.push({
      role: 'user',
      content: message,
    });

    const assistantIndex =
      this.messages.length;

    this.messages.push({
      role: 'assistant',
      content: '',
    });

    this.loading = true;
    this.thinking = true;

    this.cdr.detectChanges();

    try {

      await this.chatService.streamMessage(
        message,
        this.conversationId,

        (content) => {
          this.messages[assistantIndex].content += content;
          this.cdr.detectChanges();
        },

        (conversationId) => {
          this.conversationId = conversationId;
          this.cdr.detectChanges();

          console.log(
            'Conversation ID:',
            conversationId,
          );
        },

        (thinking) => {
          this.thinking = thinking;
          this.cdr.detectChanges();
        },
      );

    } catch (error) {

      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {

        console.log(
          'Geração interrompida pelo usuário.',
        );

      } else {

        console.error(
          'Erro ao enviar mensagem:',
          error,
        );

        this.messages[assistantIndex].content =
          'Erro ao obter resposta do servidor.';

        this.cdr.detectChanges();
      }

    } finally {

      this.loading = false;
      this.thinking = false;

      this.cdr.detectChanges();
    }
  }

  stopGeneration(): void {

    this.chatService.stop();

    this.loading = false;
    this.thinking = false;

    this.cdr.detectChanges();
  }

  onEnter(
    event: KeyboardEvent,
  ): void {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      void this.sendMessage();
    }
  }
}