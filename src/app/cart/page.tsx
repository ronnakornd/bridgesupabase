"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/UserContext";
import { Course } from "@/types/course";
import { getCart, removeFromCart } from "@/api/cart";
import { redirectToCheckout } from "@/api/stripe";
import { Barcode, Trash } from "lucide-react"
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { user, reloadUser } = useUser();
  const [cartItems, setCartItems] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;
      try {
        const response = await getCart(user.id);
        if (response.data) {
          setCartItems(response.data);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const handleRemoveFromCart = async (courseId: string) => {
    try {
      if (!user) return;
      await removeFromCart(courseId, user.id);
      setCartItems(cartItems.filter((item) => item.id !== courseId));
      await reloadUser();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">
          Please login to view your cart
        </h1>
        <Link href="/login" className="text-blue-500 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-20 py-40 min-h-screen">
      <h1 className="text-3xl font-opunbold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded-lg shadow-sm"
            >
              <div className="relative w-32 h-24">
                <Image
                  src={item.cover || "/default-course-image.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">${item.price}</p>
              </div>

              <button
                onClick={() => redirectToCheckout(item.id ,user.id, user.email)}
                className="btn btn-primary"
              >
                <Barcode className="w-4 h-4 mr-2" />
                Checkout
              </button>

              <button
                onClick={() => handleRemoveFromCart(item.id)}
                className="btn btn-error"
              >
                <Trash className="w-4 h-4 mr-2" />
                Remove
              </button>
            </div>
          ))}

          <div className="mt-8 flex justify-end items-center">
            <div className="text-xl font-bold">
              Total: $
              {cartItems
                .reduce((sum, item) => sum + (item.price || 0), 0)
                .toFixed(2)}
            </div>
          
          </div>
        </div>
      )}
    </div>
  );
}
