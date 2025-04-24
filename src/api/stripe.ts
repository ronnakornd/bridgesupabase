import { Course } from "@/types/course";
import { updateCourse } from "@/api/courses";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Create a product in Stripe
export const createProduct = async (course: Course) => {
  try {
    const response = await axios.post('/api/stripe/create-product', {
      name: course.title,
      description: course.description,
      price: course.price,
      images: [course.cover],
      metadata: {
        courseId: course.id
      }
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    if (response.data.productId && response.data.priceId) {
      await updateCourse(course.id, {
        stripe_product_id: response.data.productId,
        stripe_price_id: response.data.priceId,
      });
    }
    return { data: response.data, error: null };
  } catch (error) {
    console.error("Error creating product:", error);
    return { data: null, error };
  }
};

// Get checkout session for a product
export const getCheckoutSession = async (courseId: string, userId: string, email: string) => {
  try {
    const response = await axios.post('/api/stripe/create-checkout-session', {
      courseId,
      userId,
      email,
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/cart`
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return { data: response.data, error: null };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { data: null, error };
  }
};


// Redirect to checkout
export const redirectToCheckout = async (courseId: string, userId: string, email: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to initialize");
    
      const { data, error } = await getCheckoutSession(courseId, userId, email);
    if (error || !data) throw error || new Error("Failed to create checkout session");
    
    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (result.error) throw result.error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    return { success: false, error };
  }
};

// Verify payment status
export const verifyPayment = async (sessionId: string) => {
  try {
    const response = await axios.post(`/api/stripe/verify-payment`,{sessionId});
    return { data: response.data, error: null };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { data: null, error };
  }
};

// Get checkout session for a product using Stripe Product ID



// Define props interface for CheckoutButton
