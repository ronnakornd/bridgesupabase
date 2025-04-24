import { NextApiResponse } from "next";
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

interface Product {
  name: string;
  description: string;
  price: number;
  images: string[];
  metadata: Record<string, string>;
}

export async function POST(req: Request, res: NextApiResponse)  {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const product: Product = await req.json();
    console.log(product);

    // Create product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      images: product.images,
      metadata: product.metadata,
    });

    // Create price for the product
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(product.price * 100), // Convert to cents
      currency: "thb",
    });
    return NextResponse.json(
      {
        productId: stripeProduct.id,
        priceId: stripePrice.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
  }
