"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from "@/components/landing/Navbar";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import EnrollmentService from '@/lib/services/enrollmentService';
import toast from 'react-hot-toast';
import { getJSONCookie, removeCookie } from '@/utils/cookies';

const SuccessPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [enrollmentStatus, setEnrollmentStatus] = useState('processing'); // processing, success, error
  const [course, setCourse] = useState(null);
  
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');

  useEffect(() => {
    if (sessionId && courseId) {
      handleEnrollment();
    } else {
      setEnrollmentStatus('error');
    }
  }, [sessionId, courseId]);

  const handleEnrollment = async () => {
    try {
      // Get course from cookie if available
      const checkoutCourse = getJSONCookie('checkoutCourse');
      if (checkoutCourse) {
        setCourse(checkoutCourse);
      }

      // Prepare payment details for Stripe payments
      const paymentDetails = sessionId ? {
        transactionId: sessionId,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
        stripeSessionId: sessionId
      } : null;

      // Enroll user in the course with payment details
      const result = await EnrollmentService.enrollInCourse(courseId, paymentDetails);
      
      if (result.success) {
        setEnrollmentStatus('success');
        // Clear the checkout course from cookie
        removeCookie('checkoutCourse');
        toast.success('Successfully enrolled in the course! 🎉');
      } else {
        setEnrollmentStatus('error');
        toast.error(result.message || 'Failed to complete enrollment');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setEnrollmentStatus('error');
      toast.error('An error occurred while completing your enrollment');
    }
  };

  if (enrollmentStatus === 'processing') {
    return (
      <div>
        <Navbar />
        <Header title="Processing Payment" />
        <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-16">
          <div className="text-center">
            <FaSpinner className="animate-spin w-16 h-16 text-[#392C7D] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Processing Your Payment</h1>
            <p className="text-gray-600 mb-8">
              Please wait while we confirm your payment and enroll you in the course...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (enrollmentStatus === 'error') {
    return (
      <div>
        <Navbar />
        <Header title="Payment Error" />
        <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-600">Payment Error</h1>
            <p className="text-gray-600 mb-8">
              There was an issue processing your payment or enrollment. 
              Please contact support if this issue persists.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/courses')}
                className="bg-[#392C7D] text-white px-6 py-3 rounded-full hover:bg-[#2d1f5f] transition-colors"
              >
                Browse Courses
              </button>
              <button
                onClick={() => router.push('/contact-us')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Header title="Payment Successful" />
      <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-16">
        <div className="text-center">
          <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Congratulations! You have successfully enrolled in the course.
          </p>

          {course && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md mx-auto mb-8">
              <h3 className="text-xl font-semibold mb-4">Course Enrolled</h3>
              <div className="flex items-center gap-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail.url}
                    alt={course.name}
                    className="w-40 h-40 object-cover rounded"
                  />
                )}
                <div className="text-left">
                  <h4 className="font-medium">{course.name}</h4>
                  <p className="text-sm text-gray-600">
                    Paid: ${course.price}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-gray-600">
              You can now access your course content from your dashboard.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/dashboard/student')}
                className="bg-[#392C7D] text-white px-6 py-3 rounded-full hover:bg-[#2d1f5f] transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="border border-[#392C7D] text-[#392C7D] px-6 py-3 rounded-full hover:bg-[#392C7D] hover:text-white transition-colors"
              >
                View Course
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const LoadingFallback = () => (
  <div>
    <Navbar />
    <Header title="Loading" />
    <main className="max-w-[1440px] sm:px-10 mx-auto px-4 py-16">
      <div className="text-center">
        <FaSpinner className="animate-spin w-16 h-16 text-[#392C7D] mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-gray-600 mb-8">
          Please wait while we load your page...
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

const SuccessPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;