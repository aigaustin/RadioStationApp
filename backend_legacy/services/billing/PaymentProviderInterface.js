class PaymentProviderInterface {
  async initializePayment(amount, email, reference, metadata) {
    throw new Error('Not implemented');
  }

  async verifyPayment(reference) {
    throw new Error('Not implemented');
  }
}

module.exports = PaymentProviderInterface;
