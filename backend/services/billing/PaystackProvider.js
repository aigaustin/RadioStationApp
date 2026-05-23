const PaymentProviderInterface = require('./PaymentProviderInterface');

class PaystackProvider extends PaymentProviderInterface {
  async initializePayment(amount, email, reference, metadata) {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // kobo
        reference
      })
    });
    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data.authorization_url;
  }

  async verifyPayment(reference) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });
    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data.status === 'success';
  }
}

module.exports = new PaystackProvider();
