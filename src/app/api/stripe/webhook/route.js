import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import Earnings from '@/lib/models/Earnings';
import User from '@/lib/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const sig = headersList.get('stripe-signature');

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment was successful!', session);
        
        // Extract course information from session metadata
        const { courseId, courseName, coursePrice } = session.metadata;
        
        console.log('Course enrollment details:', {
          courseId,
          courseName,
          coursePrice,
          customerEmail: session.customer_details?.email,
          paymentIntentId: session.payment_intent,
          amountPaid: session.amount_total / 100, // Convert from cents
        });
        
        // Process the payment and create earnings record
        try {
          await dbConnect();
          
          // Find the course
          const course = await Course.findById(courseId).populate('instructor', '_id');
          if (!course) {
            console.error('Course not found:', courseId);
            break;
          }
          
          // Find the user by email
          const user = await User.findOne({ email: session.customer_details?.email });
          if (!user) {
            console.error('User not found with email:', session.customer_details?.email);
            break;
          }
          
          // Find the enrollment (it should already exist from the success page)
          const enrollment = await Enrollment.findOne({
            student: user._id,
            course: courseId,
            status: { $in: ['active', 'completed'] }
          });
          
          if (!enrollment) {
            console.error('Enrollment not found for user:', user._id, 'course:', courseId);
            break;
          }
          
          // Check if earnings record already exists to avoid duplicates
          const existingEarnings = await Earnings.findOne({ enrollment: enrollment._id });
          if (existingEarnings) {
            console.log('Earnings record already exists for enrollment:', enrollment._id);
            break;
          }
          
          // Create earnings record
          const coursePrice = parseFloat(session.metadata.coursePrice);
          const platformFeePercentage = 0.2; // 10% platform fee
          const platformFee = coursePrice * platformFeePercentage;
          const instructorEarnings = coursePrice - platformFee;
          
          const earningsData = {
            instructor: course.instructor._id,
            student: user._id,
            course: courseId,
            enrollment: enrollment._id,
            amount: coursePrice,
            currency: 'USD',
            paymentMethod: 'stripe',
            transactionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            status: 'completed',
            platformFee: platformFee,
            instructorEarnings: instructorEarnings,
            payoutStatus: 'pending',
            notes: `Stripe payment for course: ${courseName}`
          };
          
          const earnings = new Earnings(earningsData);
          await earnings.save();
          
          console.log(`Created earnings record via webhook for instructor ${course.instructor._id} - Amount: $${instructorEarnings}`);
          
          // Update enrollment with payment details if not already set
          if (!enrollment.paymentDetails || !enrollment.paymentDetails.transactionId) {
            enrollment.paymentDetails = {
              transactionId: session.id,
              amount: coursePrice,
              paymentMethod: 'stripe',
              paymentStatus: 'completed',
              paidAt: new Date()
            };
            await enrollment.save();
          }
          
        } catch (error) {
          console.error('Error processing webhook payment:', error);
        }
        
        break;
        
      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        console.log('Checkout session expired:', expiredSession.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}