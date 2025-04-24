import { NextApiResponse } from "next";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

interface VerifyPaymentRequest {
  sessionId: string;
}

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const request: VerifyPaymentRequest = await req.json();
    console.log(request);
    const sessionId = request.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session, expand payment_intent and charges
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent", "payment_intent.charges"],
    });

    // Check if payment is successful
    if (session.payment_status === "paid") {
      // Get user ID and course ID from session metadata
      const userId = session.metadata?.userId;
      const courseId = session.metadata?.courseId;
      const invoiceId = session.invoice;

      if (userId && courseId) {
        // Initialize Supabase client
        const supabase = await createClient();

        // Fetch Course Title
        let courseTitleSnapshot: string | null = null;
        try {
          const { data: courseData, error: courseFetchError } = await supabase
            .from("courses")
            .select("title")
            .eq("id", courseId)
            .single();

          if (courseFetchError) {
            console.error(
              `Error fetching course title for course ${courseId}:`,
              courseFetchError
            );
            // Proceed without title snapshot, or handle error more strictly if title is required
          } else if (courseData) {
            courseTitleSnapshot = courseData.title;
          }
        } catch (fetchErr) {
          console.error(
            `Unexpected error fetching course title for course ${courseId}:`,
            fetchErr
          );
        }

        // Check if purchase record already exists
        const { data: existingPurchase, error: checkError } = await supabase
          .from("purchases")
          .select("id") // Only need to select id to check existence
          .eq("payment_id", session.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking for existing purchase:", checkError);
          return NextResponse.json(
            { error: "Failed to verify purchase history" },
            { status: 500 }
          );
        }

        // If purchase already exists, return it without creating a duplicate
        if (existingPurchase) {
          console.log("Purchase record already exists, skipping insertion");

          return NextResponse.json(
            {
              verified: true,
              session: {
                id: session.id,
                customerId: session.customer,
                paymentStatus: session.payment_status,
                amountTotal: session.amount_total,
                metadata: session.metadata,
              },
              purchase: existingPurchase,
            },
            { status: 200 }
          );
        }

        // Add purchase record to database, including course_title_snapshot
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchases")
          .insert({
            user_id: userId,
            course_id: courseId,
            price: session.amount_total ? session.amount_total / 100 : 0,
            payment_id: session.id,
            payment_status: session.payment_status,
            invoice_id: invoiceId,
            course_title_snapshot: courseTitleSnapshot,
            created_at: new Date().toISOString(),
          })
          .select() // Select all columns
          .single();

        if (purchaseError) {
          console.error("Error adding purchase record:", purchaseError);
          return NextResponse.json(
            { error: "Payment verified but failed to record purchase" },
            { status: 500 }
          );
        }

        // Add student to course
        // Get current student list for course
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("student_id")
          .eq("id", courseId)
          .single();

        if (courseError) {
          console.error("Error fetching course:", courseError);
          return NextResponse.json(
            { error: "Failed to fetch course data" },
            { status: 500 }
          );
        }

        // Add student to course's student list if not already present
        const currentStudents = courseData.student_id || [];
        if (!currentStudents.includes(userId)) {
          const updatedStudents = [...currentStudents, userId];

          const { error: updateError } = await supabase
            .from("courses")
            .update({ student_id: updatedStudents })
            .eq("id", courseId);

          if (updateError) {
            console.error("Error updating course:", updateError);
            return NextResponse.json(
              { error: "Failed to add student to course" },
              { status: 500 }
            );
          }
        }

        const addStudentStatus = courseError ? "failed" : "success";

        const addStudentText = courseError
          ? (courseError as Error).message
          : "Student added successfully";

        if (addStudentStatus == "failed") {
          console.error("Error adding student to course:", addStudentText);
          return NextResponse.json(
            { error: "Payment verified but failed to add student to course" },
            { status: 500 }
          );
        }
        // Remove course from user's cart
        const { error: cartError } = await supabase
          .from("carts")
          .delete()
          .match({ user_id: userId, course_id: courseId });

        if (cartError) {
          console.error("Error removing item from cart:", cartError);
          // Don't return error since this is not critical
        }

        console.log(
          "Student added, purchase recorded with Invoice ID:",
          invoiceId
        );

        // Return successful verification with purchase details
        return NextResponse.json(
          {
            verified: true,
            session: {
              id: session.id,
              customerId: session.customer,
              paymentStatus: session.payment_status,
              amountTotal: session.amount_total,
              metadata: session.metadata,
            },
            purchase: purchaseData,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Missing user or course information in session metadata" },
          { status: 400 }
        );
      }
    } else {
      // Payment not completed
      return NextResponse.json(
        {
          verified: false,
          paymentStatus: session.payment_status,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
