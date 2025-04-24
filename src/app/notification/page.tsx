"use client";
import React, { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/Pagination";
import { BellRing, Check } from "lucide-react"; // Using BellRing for notifications
import { Notification } from "@/types/notification";
import { fetchNotifications, markNotificationAsRead } from "@/api/notification";
// Mock notification type

// Mock data generation function


function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5; // Number of items per page, should match API if possible

  // Fetch notifications from API
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { notifications: data, pagination } = await fetchNotifications(
        currentPage,
        itemsPerPage
      );
      setNotifications(data);
      console.log(data);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.totalItems);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]); // Clear notifications on error
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Function to mark a notification as read
  const handleMarkAsRead = async (id: string) => {
    // Optimistically update UI first for better UX
    const originalNotifications = [...notifications];
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );

    try {
      const { success, error } = await markNotificationAsRead(id);
      if (!success) {
        console.error("Failed to mark notification as read:", error);
        // Revert UI changes if API call fails
        setNotifications(originalNotifications);
        // Optionally show an error message to the user
      }
      // No need to call loadNotifications() again unless you want to re-verify from server
    } catch (error) {
      console.error("Error calling markNotificationAsRead:", error);
      // Revert UI changes on unexpected error
      setNotifications(originalNotifications);
    }
  };

  return (
    <div className="py-40 px-40 bg-base-200 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-opunbold mb-3">Notifications</h1>
          <p>Here you can view your recent notifications ({totalItems} total).</p>
        </div>
        {/* Optional: Add button like "Mark all as read" */}
      </div>

      {/* Removed search and filters for simplicity, can be added back if needed */}

      {isLoading && !notifications.length && (
        <div className="text-center mt-10">Loading notifications...</div>
      )}

      {!isLoading && notifications.length === 0 && (
        <p className="text-center mt-10">No notifications found.</p>
      )}

      {notifications.length > 0 && (
        <>
          <ul className="flex flex-col gap-4">
            {notifications.map((notification) => (
              <li
                className={`p-6 ${
                  notification.is_read ? "bg-base-100 opacity-70" : "bg-white font-opunsemibold" // Dim read notifications slightly
                } rounded-md flex justify-between items-center border-l-4 ${
                  notification.is_read ? "border-transparent" : "border-primary"
                } transition-opacity duration-300 ease-in-out`}
                key={notification.id}
              >
                <div className="flex items-center gap-4">
                   <BellRing size={24} className={`${notification.is_read ? 'text-gray-400' : 'text-primary'}`} />
                   <div>
                    <p className={`text-opun ${notification.is_read ? 'font-opunregular' : 'font-opunsemibold'} text-lg mb-1`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                       {new Date(notification.timestamp).toLocaleString()}
                    </p>
                   </div>
                </div>
                <div className="flex gap-2">
                  {!notification.is_read && (
                    <button
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check size={18} /> Mark Read
                    </button>
                  )}
                   {/* Optional: Add delete or archive buttons */}
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NotificationPage;
