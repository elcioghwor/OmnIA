import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Conversation } from './conversation.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: ['user', 'assistant'],
  })
  role!: 'user' | 'assistant';

  @Column({
    type: 'longtext',
  })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(
    () => Conversation,
    (conversation) => conversation.messages,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'conversation_id',
  })
  conversation!: Conversation;

  @Column({
    name: 'conversation_id',
  })
  conversationId!: number;
}