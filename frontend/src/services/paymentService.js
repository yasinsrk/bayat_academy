// src/services/paymentService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

class PaymentService {
  // ===== شروع پرداخت =====
  static async initiatePayment(packageIds, amount, userInfo) {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.post(
        `${API_URL}/payments/initiate/`,
        {
          package_ids: packageIds,
          amount: amount,
          user_info: userInfo,
          callback_url: `${window.location.origin}/payment/verify`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error.response?.data || { error: 'خطا در شروع پرداخت' };
    }
  }

  // ===== تایید پرداخت =====
  static async verifyPayment(authority, status) {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.post(
        `${API_URL}/payments/verify/`,
        {
          authority: authority,
          status: status
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error.response?.data || { error: 'خطا در تایید پرداخت' };
    }
  }
}

export default PaymentService;