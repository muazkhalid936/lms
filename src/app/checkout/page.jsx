"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Image from "next/image";
import getStripe from "@/lib/stripe";
import toast from "react-hot-toast";
import { getJSONCookie } from "@/utils/cookies";

const page = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Get course from cookie
    const checkoutCourse = getJSONCookie('checkoutCourse');
    if (checkoutCourse) {
      setCourse(checkoutCourse);
    } else {
      // Redirect to courses if no course in cookie
      router.push('/courses');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handlePayment = async () => {
    if (!course) return;

    setPaymentLoading(true);
    const toastId = toast.loading('Redirecting to payment...');

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          courseName: course.name,
          coursePrice: course.originalPrice,
          discountPrice: course.price,
          isFreeCourse: course.isFreeCourse
        }),
      });

      const { sessionId, error: stripeError } = await response.json();

      if (stripeError) {
        toast.error(stripeError, { id: toastId });
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        toast.error(error.message, { id: toastId });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An unexpected error occurred during payment setup', { id: toastId });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <Header title="Checkout" />
        <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#392C7D]"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Navbar />
        <Header title="Checkout" />
        <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">No Course Selected</h2>
            <p className="text-gray-600 mb-4">Please select a course to checkout.</p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-[#392C7D] text-white px-6 py-2 rounded-full hover:bg-[#2d1f5f]"
            >
              Browse Courses
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tax = Math.round(course.price * 0.12 * 100) / 100; // 12% tax
  const total = Math.round((course.price + tax) * 100) / 100;

  return (
    <div>
      <Navbar />
      <Header title="Checkout" />

      <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-4">Course Information</h3>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.name}
                      width={80}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{course.name}</h4>
                  {course.instructor && (
                    <p className="text-gray-600 text-sm">
                      by {course.instructor.name || course.instructor.firstName + ' ' + course.instructor.lastName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {course.price !== course.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                    <span className="text-lg font-semibold text-[#03C95A]">
                      ${course.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">Secure Payment</h4>
                    <p className="text-blue-700 text-sm">
                      Your payment will be processed securely through Stripe. 
                      After successful payment, you'll have immediate access to the course.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <p className="text-gray-600 mb-4">
                Click "Complete Payment" to continue with Stripe Checkout for secure payment processing.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Image src="/cart.png" alt="Secure" width={24} height={24} />
                <span className="text-sm text-gray-600">Powered by Stripe - Industry leading security</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className={`
                  w-full bg-[#392C7D] text-white py-3 px-6 rounded-full font-semibold
                  transition-all duration-300 flex items-center justify-center gap-2
                  ${paymentLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#2d1f5f] hover:shadow-lg'
                  }
                `}
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Complete Payment (${total})
                  </>
                )}
              </button>
            </div>
          </div>

          <aside>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="text-lg font-semibold mb-4">Order Summary</h4>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.name}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm line-clamp-2">{course.name}</div>
                    <div className="text-sm text-[#392C7D] font-semibold">${course.price}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Subtotal</div>
                  <div>${course.price}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <div>Tax (12%)</div>
                  <div>${tax}</div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-2 border-t">
                  <div className="font-bold">Total</div>
                  <div className="text-2xl font-bold text-[#392C7D]">${total}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">What's included:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Lifetime access to course content</li>
                  <li>• Download resources and materials</li>
                  <li>• Certificate of completion</li>
                  <li>• Access on mobile and desktop</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default page;
