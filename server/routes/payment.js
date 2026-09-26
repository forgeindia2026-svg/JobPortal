const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder', // User needs to set this in .env
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder' // User needs to set this in .env
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

module.exports = router;
