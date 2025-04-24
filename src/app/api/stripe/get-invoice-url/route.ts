import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server"; // Use server client

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia", // Use your desired API version
});

interface GetInvoiceUrlRequest {
  purchaseId: string; // The ID from your purchases table
}

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const supabase = await createClient();

    // Check user authentication (important for security)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { purchaseId }: GetInvoiceUrlRequest = await req.json();

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      );
    }

    // Fetch the purchase record to get the invoice_id, ensuring the user owns it
    const { data: purchase, error: fetchError } = await supabase
      .from("purchases")
      .select("invoice_id, user_id")
      .eq("id", purchaseId)
      .single();

    if (fetchError) {
        console.error("Error fetching purchase record:", fetchError);
        return NextResponse.json({ error: "Could not find purchase record" }, { status: 404 });
    }

    // Verify the logged-in user owns this purchase record
    if (purchase.user_id !== user.id) {
        console.warn(`User ${user.id} attempted to access invoice for purchase ${purchaseId} owned by ${purchase.user_id}`);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoiceId = purchase.invoice_id;

    if (!invoiceId) {
      console.log(`No Stripe Invoice ID found for purchase ${purchaseId}`);
      return NextResponse.json(
        { error: "Invoice not available for this purchase" },
        { status: 404 }
      );
    }

    // Retrieve the invoice details from Stripe to get the hosted URL
    try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        const invoiceUrl = invoice.hosted_invoice_url;

        if (!invoiceUrl) {
            console.error(`Could not retrieve hosted_invoice_url for invoice ${invoiceId}`);
            return NextResponse.json({ error: "Could not retrieve invoice URL from Stripe" }, { status: 500 });
        }

        return NextResponse.json({ invoiceUrl }, { status: 200 });

    } catch (stripeError) {
         console.error(`Stripe API error retrieving invoice ${invoiceId}:`, stripeError);
         // Handle specific Stripe errors if needed (e.g., invoice not found)
         if ((stripeError as Stripe.StripeRawError).code === 'resource_missing') {
             return NextResponse.json({ error: "Invoice not found in Stripe" }, { status: 404 });
         }
         return NextResponse.json({ error: "Failed to retrieve invoice from Stripe" }, { status: 500 });
    }

  } catch (error) {
    console.error("Unexpected error in get-invoice-url route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 