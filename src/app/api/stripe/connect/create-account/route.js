import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    await dbConnect();

    // Verify token and get user
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
          { success: false, message: 'Only instructors can create connected accounts' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // If already has an account, return it
    if (user.stripeAccountId) {
      return NextResponse.json({ success: true, stripeAccountId: user.stripeAccountId }, { status: 200 });
    }

    // Create Express connected account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    user.stripeAccountId = account.id;
    user.payoutsEnabled = !!account.payouts_enabled;
    user.chargesEnabled = !!account.charges_enabled;
    user.stripeDetailsSubmitted = !!account.details_submitted;
    user.stripeOnboardingComplete = !!(account.details_submitted && account.payouts_enabled);
    await user.save();

    return NextResponse.json({ success: true, stripeAccountId: account.id }, { status: 200 });
  } catch (error) {
    console.error('Create connected account error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create connected account', error: error.message },
      { status: 500 }
    );
  }
}