import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OllamaProvider {
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.http = axios.create({
      baseURL: this.configService.get<string>('ollama.url'),
      timeout: 120000,
    });
  }


  async chat(messages: ChatMessage[]): Promise<string> {
    const model = this.configService.get<string>('ollama.model');

    console.log('Enviando para o Ollama...');

    const response = await this.http.post(
      '/api/chat',
      {
        model,
        stream: false,
        messages,
      },

      {
        timeout: 600000,
      },
    );



    console.log('===== RESPOSTA DO OLLAMA =====');
    console.dir(response.data, { depth: null });

    const data = response.data;

    console.dir(data, { depth: null });

    if (data.message?.content) {
      return data.message.content;
    }

    if (data.message?.thinking) {
      return `[Modelo não gerou resposta final]\n\nThinking:\n${data.message.thinking}`;
    }

    throw new Error('O Ollama retornou uma resposta inesperada.');
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const model = this.configService.get<string>('ollama.model');

    console.log(
      '===== ENVIANDO PARA O OLLAMA =====',
    );

    console.dir(
      {
        model,
        stream: true,
        messages,
      },
      {
        depth: null,
      },
    );

    const response = await this.http.post(
      '/api/chat',
      {
        model,
        stream: true,
        messages,
      },
      {
        responseType: 'stream',
        timeout: 600000,
      },
    );

    const stream = response.data as Readable;

    let buffer = '';

    for await (const chunk of stream) {
      buffer += chunk.toString();

      const lines = buffer.split('\n');

      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        try {
          const data = JSON.parse(line);

          console.log('===== CHUNK DO OLLAMA =====');
          console.dir(data, { depth: null });

          const thinking = data.message?.thinking;
          const content = data.message?.content;

          if (thinking) {
            console.log(
              '🧠 THINKING:',
              thinking,
            );
          }

          if (content) {
            console.log(
              '💬 CONTENT:',
              content,
            );

            onChunk(content);
          }

          if (data.done) {
            console.log(
              '===== OLLAMA FINALIZOU =====',
            );

            return;
          }

        } catch (error) {
          console.error(
            'Erro ao interpretar chunk do Ollama:',
            line,
            error,
          )
        }
      }
    }
  }
}