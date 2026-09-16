const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get current subscription & quota status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-reset monthly counter if 30+ days have passed
    const now = new Date();
    const lastReset = user.lastScanResetDate ? new Date(user.lastScanResetDate) : new Date(0);
    const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

    if (daysSinceReset >= 30) {
      user.monthlyScanCount = 0;
      user.lastScanResetDate = now;
      await user.save();
    }

    const isPro = user.subscriptionTier === 'pro' || user.subscriptionTier === 'fpo';
    const quotaLimit = isPro ? 'unlimited' : 5;
    const remainingScans = isPro ? 'unlimited' : Math.max(0, 5 - (user.monthlyScanCount || 0));

    res.json({
      tier: user.subscriptionTier || 'free',
      isPro,
      monthlyScanCount: user.monthlyScanCount || 0,
      quotaLimit,
      remainingScans,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      lastScanResetDate: user.lastScanResetDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving subscription status', error: error.message });
  }
});

// Create a Demo / Sandbox Checkout Order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    // planId: 'pro' | 'fpo'
    // billingCycle: 'monthly' | 'yearly'

    let amount = 49;
    if (planId === 'pro') {
      amount = billingCycle === 'yearly' ? 399 : 49;
    } else if (planId === 'fpo') {
      amount = billingCycle === 'yearly' ? 19999 : 1999;
    }

    const orderId = `order_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    res.json({
      orderId,
      amount,
      currency: 'INR',
      planId,
      billingCycle: billingCycle || 'monthly',
      notes: {
        description: `AgriPulse ${planId === 'fpo' ? 'FPO Enterprise' : 'Kisan Pro'} Plan (${billingCycle || 'monthly'})`,
        environment: 'demo_sandbox'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating checkout order', error: error.message });
  }
});

// Verify & Activate Subscription (Demo Payment Completion)
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethod, transactionId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const durationDays = billingCycle === 'yearly' ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    user.subscriptionTier = planId === 'fpo' ? 'fpo' : 'pro';
    user.subscriptionExpiresAt = expiresAt;
    user.monthlyScanCount = 0; // Reset scans upon upgrading
    user.lastScanResetDate = new Date();

    await user.save();

    res.json({
      success: true,
      message: `Successfully upgraded to AgriPulse ${user.subscriptionTier.toUpperCase()}!`,
      paymentDetails: {
        transactionId: transactionId || `TXN_AP_${Date.now()}`,
        paymentMethod: paymentMethod || 'UPI (Google Pay)',
        paidAt: new Date().toISOString(),
        status: 'PAID'
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        monthlyScanCount: user.monthlyScanCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Presentation Demo Helper: Toggle or Reset Quota
router.post('/reset-demo', protect, async (req, res) => {
  try {
    const { setTier, resetScans, setScans } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (setTier) user.subscriptionTier = setTier;
    if (resetScans) user.monthlyScanCount = 0;
    if (typeof setScans === 'number') user.monthlyScanCount = setScans;

    await user.save();

    res.json({
      success: true,
      message: 'Demo state updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        monthlyScanCount: user.monthlyScanCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting demo state', error: error.message });
  }
});

module.exports = router;
