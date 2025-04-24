import { Purchase } from "@/types/purchase";
import { createClient } from "@/libs/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";

/**
 * Fetches purchase history for the current user
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @returns A promise that resolves to an object containing purchases and pagination info
 */
export async function fetchPurchases(
  page: number = 1,
  limit: number = 5
): Promise<{
  purchases: Purchase[];
  pagination: { currentPage: number; totalPages: number; totalItems: number };
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated for fetching purchases");
    return {
      purchases: [],
      pagination: { currentPage: page, totalPages: 0, totalItems: 0 },
    };
  }

  try {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1; // Supabase range is inclusive

    // Fetch paginated purchases
    // NOTE: Selecting related course title requires a join or view.
    // For simplicity here, we assume `course_title_snapshot` exists or fetch only purchase data.
    // Adjust .select('*') if needed, e.g., .select('*, courses(title)') if relationship is set up.
    const {
      data: purchasesData,
      error: purchasesError,
    }: PostgrestResponse<Purchase> = await supabase
      .from("purchases")
      .select("*") // Adjust selection as needed
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(startIndex, endIndex);

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError);
      throw purchasesError;
    }

    // Fetch the total count of purchases for the user
    const { count, error: countError } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error fetching purchase count:", countError);
      throw countError;
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      purchases: purchasesData || [],
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    };
  } catch (error) {
    console.error("Error in fetchPurchases function:", error);
    return {
      purchases: [],
      pagination: { currentPage: page, totalPages: 0, totalItems: 0 },
    };
  }
}

/**
 * Gets the Stripe invoice download URL for a specific payment ID.
 * IMPORTANT: This requires a backend implementation (e.g., Supabase Edge Function or API Route)
 * that securely interacts with the Stripe API using your secret key.
 * This client-side function acts as a placeholder to call that backend endpoint.
 *
 * @param paymentId The Stripe PaymentIntent ID or Charge ID associated with the purchase.
 * @returns A promise that resolves to the invoice URL string, or null if not found/error.
 */
export async function getStripeInvoiceUrl(
  purchaseId: string
): Promise<string | null> {
  try {
    //  Replace with your actual backend endpoint call
    const response = await fetch("/api/stripe/get-invoice-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch invoice URL: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.invoiceUrl;
  } catch (error) {
    console.error("Error getting Stripe invoice URL:", error);
    return null;
  }
}
