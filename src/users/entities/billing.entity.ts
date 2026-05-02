import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
 
@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn()
  id!: number;
 
  @Column()
  month!: string; 
 
  @Column('decimal')
  amount!: number;
 
  @Column({ default: 'Unpaid' })
  status!: string; // 'Unpaid' | 'Pending Verification' | 'Paid'
 
  @Column({ nullable: true })
  transactionId!: string;
 
  @Column({ nullable: true })
  paymentMethod!: string; // 'bKash', 'Nagad', 'Rocket', 'SSLCommerz'
 
  @Column({ type: 'timestamp', nullable: true })
  paymentDate!: Date; 

  @Column({ type: 'timestamp', nullable: true })
  dueDate!: Date;
 
  @CreateDateColumn()
  createdAt!: Date;
 
  @ManyToOne(() => User, (user) => user.billings)
  user!: User;
}