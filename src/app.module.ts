import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/entities/user.entity';
import { Package } from './packages/entities/package.entity';
import { UsersModule } from './users/users.module';
import { PackagesModule } from './packages/packages.module';
import { Billing } from './users/entities/billing.entity';
import { Complaint } from './users/entities/complaint.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'mithil123',
      database: process.env.DB_DATABASE || 'wifi_bd',
      entities: [User, Package, Billing, Complaint],
      synchronize: true,
      ssl: process.env.DB_HOST !== 'localhost' 
        ? { rejectUnauthorized: false } 
        : false,
    }),
    UsersModule,
    PackagesModule,
    AuthModule,
  ],
})
export class AppModule {}