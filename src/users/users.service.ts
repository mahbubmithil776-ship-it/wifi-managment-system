import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { Package } from '../packages/entities/package.entity';
import { Billing } from './entities/billing.entity';
import { Complaint } from './entities/complaint.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MikrotikService } from './mikrotik.service';
 
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    private jwtService: JwtService,
    private mikrotikService: MikrotikService,
  ) {}
 
  // user registration
  async create(userData: any) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);
 
    let pkg: Package | null = null;
    if (userData.packageId) {
      pkg = await this.packageRepository.findOneBy({ id: userData.packageId });
    }
 
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'user',
      ...(pkg && { package: pkg }),
    });
 
    const savedUser: User = (await this.userRepository.save(user)) as unknown as User;
 
    if (pkg) {
      const now = new Date();
      const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 7);
 
      const billing = new Billing();
      billing.month = currentMonth;
      billing.amount = pkg.price;
      billing.status = 'Unpaid';
      billing.dueDate = dueDate;
      billing.user = savedUser;
 
      await this.billingRepository.save(billing);
    }
 
    return savedUser;
  }
 
  async login(loginData: any) {
    const { email, password } = loginData;
    const user = await this.userRepository.findOneBy({ email });
 
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
 
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      message: 'Login Successful',
    };
  }
 
  async findAll() {
    return await this.userRepository.find({ relations: ['package'] });
  }
 
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
      relations: ['package'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
 
  async createBilling(userId: number, billingData: any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('ইউজার পাওয়া যায়নি');
 
    const billing = new Billing();
    billing.month = billingData.month;
    billing.amount = billingData.amount;
    billing.status = billingData.status || 'Unpaid';
    billing.dueDate = billingData.dueDate;
    billing.user = user;
 
    return await this.billingRepository.save(billing);
  }
 
  async getUserBillings(userId: number) {
    return await this.billingRepository.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });
  }
 
  async updateBillingStatus(billingId: number, status: string) {
    const billing = await this.billingRepository.findOne({
      where: { id: billingId },
      relations: ['user'],
    });
    if (!billing) throw new NotFoundException('Billing record not found');
 
    if (status === 'Paid') {
      await this.mikrotikService.enableUser(billing.user.mikrotikUsername);
      billing.paymentDate = new Date();
    } else if (status === 'Unpaid') {
      await this.mikrotikService.disableUser(billing.user.mikrotikUsername);
    }
 
    billing.status = status;
    return await this.billingRepository.save(billing);
  }
 
  async createComplaint(userId: number, complaintData: any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
 
    const ticketId = 'SNF-' + Date.now().toString().slice(-6);
 
    const complaint = this.complaintRepository.create({
      name: complaintData.name || null,
      phone: complaintData.phone || null,
      area: complaintData.area || null,
      contactPref: complaintData.contactPref || 'phone',
      subject: complaintData.type || complaintData.subject || null,
      type: complaintData.type || null,
      description: complaintData.description,
      priority: complaintData.priority || 'normal',
      ticketId: ticketId,
      status: 'Pending',
      user: user,
    });
 
    return await this.complaintRepository.save(complaint);
  }
 
  async getAllComplaints() {
    return await this.complaintRepository.find({ relations: ['user'] });
  }

  async getUserComplaints(userId: number) {
    return await this.complaintRepository.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });
  }

  async updateComplaintStatus(complaintId: number, status: string) {
    const complaint = await this.complaintRepository.findOneBy({ id: complaintId });
    if (!complaint) throw new NotFoundException('Complaint not found');
    complaint.status = status;
    return await this.complaintRepository.save(complaint);
  }

  async getAdminStats() {
    const totalUsers = await this.userRepository.count();
    const pendingComplaints = await this.complaintRepository.count({
      where: { status: 'Pending' },
    });
    const billings = await this.billingRepository.find({ where: { status: 'Paid' } });
    const totalEarnings = billings.reduce((sum, b) => sum + Number(b.amount), 0);
 
    return {
      totalUsers,
      pendingComplaints,
      totalEarnings: `${totalEarnings} BDT`,
      systemStatus: 'Online',
    };
  }
 
  async updateProfilePic(userId: number, filePath: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    user.profilePic = filePath;
    return await this.userRepository.save(user);
  }
 
  async resetPassword(userId: number, newPassword: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);
    return { message: 'Password reset successful' };
  }
 
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyBilling() {
    const users = await this.userRepository.find({
      where: { status: UserStatus.ACTIVE },
      relations: ['package'],
    });
 
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 7);
 
    for (const user of users) {
      if (!user.package) continue;
 
      // ✅ Same month এ duplicate bill যেন না হয়
      const existing = await this.billingRepository.findOne({
        where: { user: { id: user.id }, month: currentMonth },
      });
      if (existing) continue;
 
      const billing = new Billing();
      billing.month = currentMonth;
      billing.amount = user.package.price;
      billing.status = 'Unpaid';
      billing.dueDate = dueDate;
      billing.user = user;
 
      await this.billingRepository.save(billing);
    }
 
    console.log(`✅ Monthly bills generated for ${users.length} users.`);
  }
 
  async submitPayment(billingId: number, trxId: string, method: string) {
    const billing = await this.billingRepository.findOneBy({ id: billingId });
    if (!billing) throw new NotFoundException('Billing not found');
    billing.transactionId = trxId;
    billing.paymentMethod = method;
    billing.status = 'Pending Verification';
    return await this.billingRepository.save(billing);
  }
 
  async getBillingById(billingId: number) {
    const billing = await this.billingRepository.findOne({
      where: { id: billingId },
      relations: ['user'],
    });
    if (!billing) throw new NotFoundException('Billing not found');
    return billing;
  }
 
  async updateUserStatus(userId: number, status: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    user.status = status as UserStatus;
    return await this.userRepository.save(user);
  }
 
  async createPublicComplaint(complaintData: any) {
    const ticketId = 'SNF-' + Date.now().toString().slice(-6);
 
    const complaint = this.complaintRepository.create({
      ticketId: ticketId,
      name: complaintData.name || null,
      phone: complaintData.phone || null,
      area: complaintData.area || null,
      contactPref: complaintData.contactPref || 'phone',
      subject: complaintData.type || complaintData.subject || 'General',
      type: complaintData.type || null,
      description: complaintData.description,
      priority: complaintData.priority || 'normal',
      status: 'Pending',
    });
 
    const saved = await this.complaintRepository.save(complaint);
    return {
      success: true,
      ticketId: saved.ticketId,
      id: saved.id,
      createdAt: saved.createdAt,
    };
  }
 
  async deleteUser(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
 
  async updateUser(userId: number, updateData: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['package'],
    });
    if (!user) throw new NotFoundException('User not found');
 
    if (updateData.packageId) {
      const pkg = await this.packageRepository.findOneBy({ id: updateData.packageId });
      if (pkg) user.package = pkg;
    }
 
    Object.assign(user, {
      fullName: updateData.fullName || user.fullName,
      email: updateData.email || user.email,
      phone: updateData.phone || user.phone,
      mikrotikUsername: updateData.mikrotikUsername || user.mikrotikUsername,
    });
 
    return await this.userRepository.save(user);
  }
}