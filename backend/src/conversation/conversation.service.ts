import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';

@Injectable()
export class ConversationService {

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(title: string): Promise<Conversation> {
    const conversation =
      this.conversationRepository.create({
        title,
      });

    return this.conversationRepository.save(
      conversation,
    );
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversationRepository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findById(
    id: number,
  ): Promise<Conversation> {
    const conversation =
      await this.conversationRepository.findOne({
        where: {
          id,
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        'Conversa não encontrada.',
      );
    }

    return conversation;
  }

  async getMessages(
    conversationId: number,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        conversationId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async addMessage(
    conversationId: number,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<Message> {
    await this.findById(conversationId);

    const message =
      this.messageRepository.create({
        conversationId,
        role,
        content,
      });

    return this.messageRepository.save(message);
  }
}