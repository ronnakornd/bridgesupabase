"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Bell, CircleUserRound } from "lucide-react";
import { useUser } from "@/components/UserContext";
import { fetchUnreadNotificationCount } from "@/api/notification";

const Navbar: React.FC = () => {
  const { user, cart } = useUser();
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  useEffect(() => {
    if (cart) {
      setCartCount(cart.length);
    }
  }, [cart]);

  useEffect(() => {
    if (user) {
      const fetchCount = async () => {
        const count = await fetchUnreadNotificationCount();
        setUnreadNotifications(count);
      };
      fetchCount();
    } else {
      setUnreadNotifications(0);
    }
  }, [user]);

  return (
    <nav className="navbar absolute font-opunsemibold p-10">
      <div className="navbar-start"></div>
      <div className="navbar-center hidden lg:flex"></div>
      <div className="navbar-end">
        <ul className="menu menu-horizontal p-0 text-2xl items-center">
          <li>
            <Link href="/">Home</Link>
          </li>
          {user && (
            <>
          <li>
            <Link href="/teach">My Courses</Link>
          </li>
          <li>
            <Link href="/cart">
              <div className="indicator">
                {cartCount > 0 && (
                  <span className="indicator-item badge badge-secondary">
                    {cartCount}
                  </span>
                )}
                <ShoppingCart className="w-6 h-6" fill="currentColor" />
              </div>
            </Link>
          </li>
          <li>
            <Link href="/notification">
              <div className="indicator">
                {unreadNotifications > 0 && (
                  <span className="indicator-item badge badge-primary">
                    {unreadNotifications}
                  </span>
                )}
                <Bell className="w-6 h-6" fill="currentColor" />
              </div>
            </Link>
          </li>
          </>
          )}
          <li>
            {user ? (
              <Link href="/profile" className="flex items-center">
                {user.profile_image ? (
                  <Image
                    src={user.profile_image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-opunsemibold">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login">
                <CircleUserRound className="w-8 h-8" />
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
