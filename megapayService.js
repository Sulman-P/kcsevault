// services/megapayService.js
const axios = require('axios');

const MEGAPAY_CONFIG = {
  apiKey: process.env.MEGAPAY_API_KEY,
  apiSecret: process.env.MEGAPAY_API_SECRET,
  paybill: process.env.MEGAPAY_PAYBILL,
  baseUrl: process.env.MEGAPAY_BASE_URL || 'https://api.megapay.co.ke/api/v1',
  callbackUrl: process.env.MEGAPAY_CALLBACK_URL || 'https://kenyavault.com/api/payment/callback'
};

class MegapayService {
  constructor() {
    this.client = axios.create({
      baseURL: MEGAPAY_CONFIG.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': MEGAPAY_CONFIG.apiKey,
        'X-API-Secret': MEGAPAY_CONFIG.apiSecret
      }
    });
  }

  /**
   * Initiate STK Push Payment
   */
  async initiatePayment(phoneNumber, amount, reference, description) {
    try {
      // Format phone number to 2547XXXXXXXX
      const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');
      
      const payload = {
        phoneNumber: formattedPhone,
        amount: amount,
        accountReference: reference || `KV-${Date.now()}`,
        transactionDesc: description || 'KenyaVault Resource Payment',
        paybill: MEGAPAY_CONFIG.paybill,
        callbackUrl: MEGAPAY_CONFIG.callbackUrl
      };

      console.log('📤 Sending STK Push request to Megapay:', payload);

      const response = await this.client.post('/stk/push', payload);
      
      console.log('✅ Megapay response:', response.data);
      
      return {
        success: true,
        checkoutId: response.data.checkoutId || response.data.transactionId,
        message: response.data.message || 'Payment initiated successfully'
      };

    } catch (error) {
      console.error('❌ Megapay error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initiation failed'
      };
    }
  }

  /**
   * Query STK Push Status
   */
  async queryPaymentStatus(checkoutId) {
    try {
      const response = await this.client.get(`/stk/status/${checkoutId}`);
      
      return {
        success: true,
        status: response.data.status,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Status query error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Status query failed'
      };
    }
  }
}

module.exports = new MegapayService();
