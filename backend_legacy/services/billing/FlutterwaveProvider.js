const PaymentProviderInterface = require('./PaymentProviderInterface');

class FlutterwaveProvider extends PaymentProviderInterface {
  async initializePayment(amount, email, reference, metadata) {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: reference,
        amount,
        currency: 'NGN',
        redirect_url: process.env.PAYMENT_REDIRECT_URL || 'http://localhost:4545/admin',
        customer: { email, name: metadata.tenantName || 'Customer' },
        customizations: {
          title: `${metadata.planName || 'Plan'} Subscription`,
          description: 'Payment for Radio/TV Station SaaS Plan'
        }
      })
    });
    const data = await response.json();
    if (data.status !== 'success') throw new Error(data.message);
    return data.data.link;
  }

  async verifyPayment(reference) {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_txref?tx_ref=${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    });
    const data = await response.json();
    if (data.status !== 'success') return false;
    return data.data.status === 'successful';
  }
}

module.exports = new FlutterwaveProvider();
