import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log('Loading Stripe with key:', publishableKey ? `${publishableKey.substring(0, 12)}...` : 'KEY_NOT_FOUND');
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment variables');
      return null;
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;