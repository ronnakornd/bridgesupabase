'use client';

import { User } from "@/types/user";
import { Purchase } from "@/types/purchase";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import LogoutButton from "./LogoutButton";
import { MailIcon, PencilIcon, RefreshCw } from "lucide-react";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { fetchPurchases } from "@/api/purchase";
import Pagination from "@/components/Pagination";
import InvoiceButton from "@/components/InvoiceButton";
interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email
  });
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(true);
  const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1);
  const [purchaseTotalPages, setPurchaseTotalPages] = useState(1);
  const purchaseItemsPerPage = 5;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const supabase = createClient();
    const { error } = await supabase.from('users').update({
      first_name: formData.first_name,
      last_name: formData.last_name,
    }).eq('id', user.id).select();
    if (error) {
      console.error('Error updating profile:', error);
    } else {
      router.refresh();
    }
  };

  const loadPurchases = useCallback(async () => {
    setIsPurchaseLoading(true);
    try {
      const { purchases: data, pagination } = await fetchPurchases(
        purchaseCurrentPage,
        purchaseItemsPerPage
      );
      setPurchases(data);
      setPurchaseTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
      setPurchases([]);
      setPurchaseTotalPages(1);
    } finally {
      setIsPurchaseLoading(false);
    }
  }, [purchaseCurrentPage, purchaseItemsPerPage]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleDownloadInvoice = async (purchaseId: string) => {
    try {
      const response = await fetch('/api/stripe/get-invoice-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch invoice URL (${response.status})`);
      }

      const data = await response.json();
      const url = data.invoiceUrl;

      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Could not retrieve invoice URL. It might not be available yet or an error occurred.');
      }
    } catch (error) {
      console.error("Error fetching invoice URL:", error);
      alert(`Error: ${(error as Error).message || 'Could not retrieve invoice URL. Please try again later.'}`);
    }
  };

  return (
    <div className="py-40 px-4 sm:px-10 md:px-20 lg:px-40 bg-base-200 min-h-screen w-full">
      <h1 className="text-center text-4xl font-opunsemibold capitalize mb-8">Profile</h1>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
        <div className="card bg-base-100 shadow-xl w-full lg:w-1/3 flex-shrink-0 self-start">
          <div className="card-body items-center text-center">
            <div className="avatar mb-4">
                <div className={`w-24 rounded-full px-6 py-8 ring ring-primary ring-offset-base-100 ring-offset-2 ${!user.profile_image ? 'bg-blue-500 flex items-center justify-center' : ''}`}>
                    {user.profile_image ? (
                    <Image
                        src={user.profile_image}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                    />
                    ) : (
                    <span className="text-3xl  text-white font-opunsemibold">
                        {getInitials(user.first_name, user.last_name)}
                    </span>
                    )}
                </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-opunsemibold text-gray-700 text-left">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input input-bordered w-full capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-opunsemibold text-gray-700 text-left">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input input-bordered w-full capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 text-left">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input input-bordered w-full bg-gray-100"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full space-y-3">
                <div className="flex justify-center items-center gap-2 pl-3">
                  <h2 className="card-title text-xl  font-opunsemibold capitalize">{user.first_name} {user.last_name}</h2>
                  <button onClick={() => setIsEditing(true)} className="btn btn-ghost btn-sm btn-circle">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <MailIcon className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="badge badge-primary badge-outline capitalize p-3">
                  {user.role}
                </div>
                <div className="card-actions justify-center mt-6">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl w-full lg:w-2/3">
          <div className="card-body">
            <h2 className="card-title text-2xl font-opunsemibold mb-4">Purchase History</h2>

            {isPurchaseLoading && (
              <div className="text-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                <p className="mt-2">Loading purchase history...</p>
              </div>
            )}

            {!isPurchaseLoading && purchases.length === 0 && (
              <p className="text-center text-gray-500 py-10">You haven&apos;t made any purchases yet.</p>
            )}

            {!isPurchaseLoading && purchases.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover">
                        <td>{new Date(purchase.created_at).toLocaleDateString()}</td>
                        <td>{purchase.course_title_snapshot || `Course ID: ${purchase.course_id.substring(0, 8)}...`}</td>
                        <td>{purchase.price}</td>
                        <td>
                          <span className={`badge ${purchase.payment_status === 'succeeded' ? 'badge-success' : 'badge-warning'}`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                        <td>
                          {purchase.payment_status === 'paid' && purchase.payment_id && (
                            <InvoiceButton purchaseId={purchase.id} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isPurchaseLoading && purchaseTotalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={purchaseCurrentPage}
                  totalPages={purchaseTotalPages}
                  setCurrentPage={setPurchaseCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 