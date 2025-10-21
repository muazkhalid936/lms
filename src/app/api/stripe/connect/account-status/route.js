import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/utils/dbConnect';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/utils/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function GET(request) {
  try {
    await dbConnect();

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
          { success: false, message: 'Only instructors can check account status' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!user.stripeAccountId) {
      return NextResponse.json(
        { success: false, message: 'No Stripe account. Create one first.' },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    user.payoutsEnabled = !!account.payouts_enabled;
    user.chargesEnabled = !!account.charges_enabled;
    user.stripeDetailsSubmitted = !!account.details_submitted;
    user.stripeOnboardingComplete = !!(account.details_submitted && account.payouts_enabled);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        account: {
          id: account.id,
          payoutsEnabled: account.payouts_enabled,
          chargesEnabled: account.charges_enabled,
          detailsSubmitted: account.details_submitted,
        },
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Account status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve account status', error: error.message },
      { status: 500 }
    );
  }
}