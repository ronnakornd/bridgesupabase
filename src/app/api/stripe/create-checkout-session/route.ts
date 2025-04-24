import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/libs/supabase/server";
import { fetchProfile } from "@/app/api/user/fetchprofile";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  try {
    const { courseId, userId, successUrl, cancelUrl, email } = await req.json();

    const userProfile = await fetchProfile();
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
    const supabase = await createClient();
    let stripeCustomerId = userProfile.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email,
        name: `${userProfile.first_name} ${userProfile.last_name}`,
      });
      stripeCustomerId = customer.id;

      // Store stripeCustomerId in your database (e.g., in the 'users' table)

      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", userId);

      if (updateError) {
        console.error(
          "Error updating user with stripeCustomerId:",
          updateError
        );
        return NextResponse.json(
          { error: "Failed to save customer ID" },
          { status: 500 }
        );
      }
    }

    // Get course from database
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    let session = null;
    if (course.stripe_product_id && course.stripe_price_id) {
      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card", "promptpay"],
        line_items: [
          {
            price: course.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          courseId,
          userId,
          courseTitle: course.title,
          stripeProductId: course.stripe_product_id,
          priceId: course.stripe_price_id,
        },
        invoice_creation: {
          enabled: true,
          auto_advance: true,
        },
      });
    }
    if (session) {
      return NextResponse.json({ sessionId: session.id }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
