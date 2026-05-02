import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Package } from '../../packages/entities/package.entity';
import { Billing } from './billing.entity';
import { Complaint } from './complaint.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; 

  @Column()
  phone!: string;

  @Column({ unique: true, nullable: true })
mikrotikUsername!: string;

  @Column({ default: 'user' }) // 'admin' or 'user'
  role?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ nullable: true })
profilePic!: string; 

  @ManyToOne(() => Package, (pkg) => pkg.users)
  package!: Package;

  @OneToMany(() => Billing, (billing) => billing.user)
  billings!: Billing[];

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints!: Complaint[];
}