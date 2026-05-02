// src/users/entities/complaint.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  ticketId!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  area!: string;

  @Column({ nullable: true })
  contactPref!: string;

  @Column({ nullable: true })
  subject!: string;

  @Column({ nullable: true })
  type!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ nullable: true, default: 'normal' })
  priority!: string;

  @Column({ default: 'Pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.complaints, { nullable: true, eager: false })
  user!: User;
}