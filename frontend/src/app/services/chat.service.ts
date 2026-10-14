import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/chat-message.model';

export interface StreamEvent {
  type:
  | 'token'
  | 'conversation'
  | 'done'
  | 'error';

  content?: string;

  message?: string;

  conversationId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private readonly apiUrl = 'http://localhost:3000';

  private controller: AbortController | null = null;

  async streamMessage(
    message: string,
    conversationId: number | null,
    onToken: (content: string) => void,
    onConversation: (conversationId: number) => void,
    onThinking?: (thinking: boolean) => void,
  ): Promise<void> {

    this.controller = new AbortController();

    try {

      const response = await fetch(
        `${this.apiUrl}/chat/stream`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },

          body: JSON.stringify({
            message,
            conversationId,
          }),

          signal: this.controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Erro HTTP ${response.status}`,
        );
      }

      if (!response.body) {
        throw new Error(
          'O servidor não retornou um stream.',
        );
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder('utf-8');

      let buffer = '';

      onThinking?.(true);

      try {

        while (true) {

          const { value, done } =
            await reader.read();

          if (done) {
            break;
          }

          const chunk =
            decoder.decode(value, {
              stream: true,
            });

          console.log(
            'CHUNK RECEBIDO:',
            chunk,
          );

          buffer += chunk;

          const events =
            buffer.split(/\r?\n\r?\n/);

          buffer =
            events.pop() ?? '';

          for (const event of events) {

            console.log(
              'EVENTO SSE:',
              event,
            );

            const lines =
              event.split(/\r?\n/);

            for (const line of lines) {

              if (!line.startsWith('data:')) {
                continue;
              }

              const json =
                line
                  .replace(/^data:\s*/, '')
                  .trim();

              if (!json) {
                continue;
              }

              let data: StreamEvent;

              try {

                data =
                  JSON.parse(json) as StreamEvent;

              } catch (error) {

                console.error(
                  'Erro ao interpretar SSE:',
                  json,
                  error,
                );

                continue;
              }

              console.log(
                'DADO SSE:',
                data,
              );

              if (data.type === 'conversation') {
                if (data.conversationId !== undefined) {
                  onConversation(data.conversationId);
                }
              }

              if (data.type === 'token') {

                onThinking?.(false);

                onToken(
                  data.content ?? '',
                );
              }

              if (data.type === 'error') {

                onThinking?.(false);

                throw new Error(
                  data.message ??
                  'Erro durante o processamento.',
                );
              }

              if (data.type === 'done') {

                onThinking?.(false);

                return;
              }
            }
          }

        }

      } finally {

        reader.releaseLock();
      }

    } catch (error) {

      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {

        console.log(
          'Geração interrompida pelo usuário.',
        );

        return;
      }

      throw error;

    } finally {

      onThinking?.(false);

      this.controller = null;
    }
  }

  stop(): void {

    if (this.controller) {

      this.controller.abort();

      this.controller = null;
    }
  }
}

