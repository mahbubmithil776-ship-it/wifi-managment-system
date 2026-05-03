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
      host: 'aws-1-ap-northeast-1.pooler.supabase.com',
      port: 5432,
      username: 'postgres.asdvyoquvlrgpbgcsbbz',
      password: '74Mithil@#51',
      database: 'postgres',
      entities: [User, Package, Billing, Complaint],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    UsersModule,
    PackagesModule,
    AuthModule,
  ],
})
export class AppModule {}
