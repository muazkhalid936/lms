import React, { useState } from 'react';
import EnrollmentService from '@/lib/services/enrollmentService';
import useAuthStore from '@/store/authStore';
import { FaSpinner, FaGraduationCap, FaDollarSign } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import getStripe from '@/lib/stripe';
import { setJSONCookie } from '@/utils/cookies';

const EnrollButton = ({ course, onEnrollmentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const router = useRouter();

  const handleFreeEnrollment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const toastId = toast.loading('Enrolling in course...');
      const result = await EnrollmentService.enrollInCourse(course._id);
      
      if (result.success) {
        toast.success('Successfully enrolled in the course! 🎉', { id: toastId });
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess(result.data);
        }
      } else {
        console.error('Enrollment failed:', result.message);
        toast.error(result.message || 'Failed to enroll in course', { id: toastId });
        setError(result.message);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('An unexpected error occurred during enrollment');
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaidEnrollment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const toastId = toast.loading('Redirecting to payment...');
      
      // Save course to cookie for checkout page (expires in 1 hour)
      setJSONCookie('checkoutCourse', {
        id: course._id,
        name: course.courseTitle || course.title || course.courseName,
        price: course.discountPrice || course.coursePrice,
        originalPrice: course.coursePrice,
        thumbnail: course.thumbnail || course.courseThumbnail,
        instructor: course.instructor,
        isFreeCourse: course.isFreeCourse
      }, 1/24); // 1 hour expiration

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course._id,
          courseName: course.courseTitle || course.title || course.courseName,
          coursePrice: course.coursePrice,
          discountPrice: course.discountPrice,
          isFreeCourse: course.isFreeCourse
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        toast.error(`HTTP ${response.status}: ${errorText}`, { id: toastId });
        setError(`HTTP ${response.status}: ${errorText}`);
        return;
      }

      const responseData = await response.json();
      console.log('API response data:', responseData);

      const { sessionId, error: stripeError } = responseData;

      if (stripeError) {
        console.error('Stripe error from API:', stripeError);
        toast.error(stripeError, { id: toastId });
        setError(stripeError);
        return;
      }

      if (!sessionId) {
        console.error('No sessionId in response:', responseData);
        toast.error('No session ID received from payment service', { id: toastId });
        setError('No session ID received');
        return;
      }

      console.log('Redirecting to Stripe with sessionId:', sessionId);

      // Redirect to Stripe Checkout using redirectToCheckout
      try {
        const stripe = await getStripe();
        
        if (!stripe) {
          console.error('Failed to load Stripe');
          toast.error('Failed to load payment service', { id: toastId });
          setError('Failed to load payment service');
          return;
        }

        console.log('Stripe loaded successfully, redirecting...');
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
          console.error('Stripe redirect error:', error);
          toast.error(error.message, { id: toastId });
          setError(error.message);
        } else {
          // If redirect is successful, dismiss the loading toast
          toast.dismiss(toastId);
        }
      } catch (stripeLoadError) {
        console.error('Error loading Stripe:', stripeLoadError);
        toast.error('Failed to initialize payment service', { id: toastId });
        setError('Failed to initialize payment service');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An unexpected error occurred during payment setup');
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      setError('Please login to enroll in this course');
      return;
    }

    if (user.userType !== 'Student') {
      setError('Only students can enroll in courses');
      return;
    }

    // Check if course is free or paid
    if (course.isFreeCourse || course.coursePrice === 0) {
      await handleFreeEnrollment();
    } else {
      await handlePaidEnrollment();
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <FaSpinner className="animate-spin w-4 h-4" />
          <span>
            {course.isFreeCourse || course.coursePrice === 0 
              ? 'Enrolling...' 
              : 'Processing...'
            }
          </span>
        </>
      );
    }
    
    if (course.isFreeCourse || course.coursePrice === 0) {
      return (
        <>
          <FaGraduationCap className="w-4 h-4" />
          <span>Enroll for Free</span>
        </>
      );
    }
    
    const price = course.discountPrice || course.coursePrice || 0;
    return (
      <>
        <FaDollarSign className="w-4 h-4" />
        <span>Enroll for ${price}</span>
      </>
    );
  };

  return (
    <div className="enrollment-section">
      <button
        onClick={handleEnrollment}
        disabled={isLoading}
        className={`
          px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 w-full flex items-center justify-center gap-2
          ${
            course.isFreeCourse || course.coursePrice === 0
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-[#392C7D] hover:bg-[#2d1f5f]'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        `}
      >
        {getButtonContent()}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default EnrollButton;