import { Module } from '@nestjs/common';

import { LlmService } from './llm.service';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  providers: [
    LlmService,
    OllamaProvider,
  ],
  exports: [
    LlmService,
  ],
})
export class LlmModule {}