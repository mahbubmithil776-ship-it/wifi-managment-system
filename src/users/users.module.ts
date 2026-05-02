import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SslCommerzService } from './sslcommerz.service';
import { MikrotikService } from './mikrotik.service';
import { User } from './entities/user.entity';
import { Billing } from './entities/billing.entity';
import { Complaint } from './entities/complaint.entity';
import { Package } from '../packages/entities/package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Billing, Complaint, Package]),
    JwtModule.register({
      secret: 'SECRET_KEY_123',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, SslCommerzService, MikrotikService],
  exports: [UsersService],
})
export class UsersModule {}