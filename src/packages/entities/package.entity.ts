import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id!: number; // '!' চিহ্নটি লাল দাগ দূর করবে

  @Column()
  name!: string;

  @Column()
  speed!: string;

  @Column('decimal')
  price!: number;

  @OneToMany(() => User, (user) => user.package)
  users!: User[];
}