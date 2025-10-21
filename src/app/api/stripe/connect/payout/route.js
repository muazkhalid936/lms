import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';
import Earnings from '@/lib/models/Earnings';
import { verifyToken } from '@/lib/utils/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { amount } = body; // amount in cents (optional)

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let user;
    try {
      const payload = await verifyToken(token);
      user = await User.findById(payload.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      if (user.userType !== 'Instructor') {
        return NextResponse.json(
          { success: false, message: 'Only instructors can request payouts' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!user.stripeAccountId || !user.payoutsEnabled) {
      return NextResponse.json(
        { success: false, message: 'Stripe account not ready for payouts' },
        { status: 400 }
      );
    }

    // Determine available pending earnings in our system
    const pendingAgg = await Earnings.aggregate([
      { $match: { instructor: user._id, payoutStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$instructorEarnings' } } },
    ]);
    const pendingAvailableCents = Math.round(((pendingAgg[0]?.total || 0) * 100));

    // Use provided amount (cents) or default to full available
    let payoutAmount = amount && Number.isFinite(amount) ? Math.floor(amount) : pendingAvailableCents;

    if (!payoutAmount || payoutAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'No earnings available for payout' },
        { status: 400 }
      );
    }

    if (payoutAmount > pendingAvailableCents) {
      return NextResponse.json(
        { success: false, message: 'Requested amount exceeds available balance' },
        { status: 400 }
      );
    }

    // Create a payout from the connected account's balance to their bank
    // Note: This requires the connected account to have sufficient balance and payouts_enabled
    const payout = await stripe.payouts.create(
      {
        amount: payoutAmount,
        currency: 'usd',
        description: `Instructor payout for ${user.userName}`,
      },
      {
        stripeAccount: user.stripeAccountId,
      }
    );

    // Mark earnings as processed (up to the payout amount)
    // Fetch pending earnings sorted by oldest first and mark until the amount is covered
    const pendingEarnings = await Earnings.find({ instructor: user._id, payoutStatus: 'pending' }).sort({ createdAt: 1 });
    let remaining = payoutAmount / 100; // convert to dollars to compare with instructorEarnings
    const toUpdateIds = [];
    for (const e of pendingEarnings) {
      if (remaining <= 0) break;
      toUpdateIds.push(e._id);
      remaining -= e.instructorEarnings;
    }

    if (toUpdateIds.length > 0) {
      await Earnings.updateMany(
        { _id: { $in: toUpdateIds } },
        { $set: { payoutStatus: 'processed', payoutDate: new Date(), payoutTransactionId: payout.id } }
      );
    }

    return NextResponse.json(
      { success: true, payoutId: payout.id, amount: payoutAmount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payout error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process payout', error: error.message },
      { status: 500 }
    );
  }
}