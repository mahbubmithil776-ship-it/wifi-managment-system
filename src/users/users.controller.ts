import {Controller, Get, Post, Body, Param, Patch, Delete,ParseIntPipe,UseGuards, Request, UseInterceptors, UploadedFile, Res} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SslCommerzService } from './sslcommerz.service';
 
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService, 
    private readonly sslService: SslCommerzService
  ) {}
 
  //login
  @Post('login')
  async login(@Body() loginData: any) {
    return await this.usersService.login(loginData);
  }
 
  // (Registration)
  @Post()
  async create(@Body() userData: any) {
    return await this.usersService.create(userData);
  }

  // ৩. Public Complaint — ✅ static route, 
  @Post('complaints/public')
  async createPublicComplaint(@Body() complaintData: any) {
    return await this.usersService.createPublicComplaint(complaintData);
  }
 
  //  (Admin)
  @Get('complaints/all')
  async getComplaints() {
    return await this.usersService.getAllComplaints();
  }

  // (ADMIN ONLY)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }
 
  // profile
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(Number(req.user.userId));
    return { user };
  }
 
  // ৭. Admin Dashboard
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin/dashboard')
  async getDashboardStats() {
    return await this.usersService.getAdminStats();
  }

  // payment
  @Post('pay/:billingId')
  async initPayment(@Param('billingId', ParseIntPipe) billingId: number) {
    const billing: any = await this.usersService.getBillingById(billingId);

    const paymentInfo = {
      billingId: billingId,
      amount: billing.amount,
      userName: billing.user?.name || 'Customer',
      email: billing.user?.email || 'customer@mail.com',
      phone: billing.user?.phone || '01700000000',
    };

    const result = await this.sslService.initPayment(paymentInfo);
    return { url: result.GatewayPageURL };
  }

  // payment success
  @Post('payment/success')
  async paymentSuccess(@Body() data: any, @Res() res: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const isValid = await this.sslService.verifyPayment(data.val_id);
      if (!isValid) {
        return res.redirect(`${frontendUrl}/payment-failed`);
      }

      const billingId = parseInt(data.tran_id?.split('_')[1]);
      if (billingId) {
        await this.usersService.updateBillingStatus(billingId, 'Paid');
      }

      return res.redirect(`${frontendUrl}/payment-success?tran_id=${data.tran_id}`);
    } catch (err) {
      return res.redirect(`${frontendUrl}/payment-failed`);
    }
  }

  // payment fail
  @Post('payment/fail')
  async paymentFail(@Res() res: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment-failed`);
  }

  // payment cancel
  @Post('payment/cancel')
  async paymentCancel(@Res() res: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment-failed`);
  }
 
  // billing status update (Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('billings/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body('status') status: string
  ) {
    return await this.usersService.updateBillingStatus(id, status);
  }

  // ১৩. Manual Payment Verify
  @Post('billings/:id/manual-pay')
  async manualPay(
    @Param('id', ParseIntPipe) id: number,
    @Body('transactionId') transactionId: string
  ) {
    return await this.usersService.submitPayment(id, transactionId, 'Manual');
  }
 
  //complaint status update (Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('complaints/:id/status')
  async updateComplaintStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body('status') status: string
  ) {
    return await this.usersService.updateComplaintStatus(id, status);
  }
 
  //user password reset
 @UseGuards(AuthGuard('jwt'))
@Patch('reset-password')
async reset(
  @Request() req,
  @Body('currentPassword') currentPassword: string,
  @Body('newPassword') newPassword: string
) {
  return await this.usersService.resetPassword(
    Number(req.user.userId),
    currentPassword,
    newPassword
  );
}
 
  //profile picture upload
  @Post('upload-profile-pic/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profile_pics',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadFile(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: any) {
    return this.usersService.updateProfilePic(id, file.path);
  }
 
  // user billing
  @Post(':id/billings')
  async createBill(@Param('id', ParseIntPipe) id: number, @Body() billingData: any) {
    return await this.usersService.createBilling(id, billingData);
  }
 
  // user billing history
  @Get(':id/billings')
  async getBills(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserBillings(id);
  }
 
  //complaint registration
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/complaints')
  async createComplaint(@Param('id', ParseIntPipe) id: number, @Body() complaintData: any) {
    return await this.usersService.createComplaint(id, complaintData);
  }
 
  // user complaints
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/complaints')
  async getUserComplaints(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserComplaints(id);
  }

  // ২১. User Suspend/Activate
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ) {
    return await this.usersService.updateUserStatus(id, status);
  }

  // ২২. User Detail (Admin)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }
  // User Delete (Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Delete(':id')
async deleteUser(@Param('id', ParseIntPipe) id: number) {
  return await this.usersService.deleteUser(id);
}

// User Update (Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Patch(':id')
async updateUser(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateData: any
) {
  return await this.usersService.updateUser(id, updateData);
}



@UseGuards(AuthGuard('jwt'))
@Patch('change-password')
async changePassword(
  @Request() req,
  @Body() body: { currentPassword: string; newPassword: string }
) {
  return this.usersService.changePassword(
    Number(req.user.userId),
    body.currentPassword,
    body.newPassword
  );
}


}