import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SslCommerzService {
  private store_id = 'sanaf69f5fc51c6f7d';
  private store_passwd = 'sanaf69f5fc51c6f7d@ssl';
  private is_live = false;

  async initPayment(paymentData: any) {
    const formData = new URLSearchParams();
    formData.append('store_id', this.store_id);
    formData.append('store_passwd', this.store_passwd);
    formData.append('total_amount', paymentData.amount.toString());
    formData.append('currency', 'BDT');

    formData.append('tran_id', `BILL_${paymentData.billingId}_${Date.now()}`);

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    formData.append('success_url', `${baseUrl}/users/payment/success`);
    formData.append('fail_url', `${baseUrl}/users/payment/fail`);
    formData.append('cancel_url', `${baseUrl}/users/payment/cancel`);

    formData.append('cus_name', paymentData.userName);
    formData.append('cus_email', paymentData.email);
    formData.append('cus_phone', paymentData.phone);
    formData.append('shipping_method', 'NO');
    formData.append('product_name', 'Internet Bill');
    formData.append('product_category', 'ISP');
    formData.append('product_profile', 'general');

    const url = this.is_live
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const response = await axios.post(url, formData);
    return response.data;
  }

  async verifyPayment(val_id: string): Promise<boolean> {
    const verifyUrl = this.is_live
      ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

    const res = await axios.get(verifyUrl, {
      params: {
        val_id,
        store_id: this.store_id,
        store_passwd: this.store_passwd,
        v: 1,
        format: 'json',
      },
    });

    return res.data?.status === 'VALID' || res.data?.status === 'VALIDATED';
  }
}