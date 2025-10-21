import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const { courseId, courseName, coursePrice, discountPrice, isFreeCourse } =
      await request.json();

    // Debug log to see what data we're receiving
    console.log("Received data:", {
      courseId,
      courseName,
      coursePrice,
      discountPrice,
      isFreeCourse,
    });

    // Don't create session for free courses
    if (isFreeCourse) {
      return NextResponse.json(
        { error: "Free courses do not require payment" },
        { status: 400 }
      );
    }

    const price = discountPrice || coursePrice;

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: "Invalid course price" },
        { status: 400 }
      );
    }

    // Ensure we have a course name
    if (!courseName || courseName.trim() === "") {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }

    // Get the base URL for success and cancel URLs
    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL;

    console.log("Using base URL:", baseUrl); // Debug log

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: courseName.trim(),
              description: `Enrollment for ${courseName.trim()}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
      cancel_url: `${baseUrl}/courses/${courseId}`,
      metadata: {
        courseId: courseId,
        courseName: courseName.trim(),
        coursePrice: price.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    return NextResponse.json(
      { error: "Error creating payment session" },
      { status: 500 }
    );
  }
}
