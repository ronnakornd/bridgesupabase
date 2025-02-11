"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/libs/supabase/client";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.data.user?.id)
        .single();
      if (data) {
        setUser(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setProfileImage(data.profile_image);
        setProfileImagePreview(data.profile_image);
        setEmail(user.data.user?.email || "");
        setIsLoaded(true);
        setPurchaseHistory(data.purchase_history || []);
      }
      if (error) {
        console.log("Error fetching user profile:", error);
        handleLogout();
        return;
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = supabase.auth.getUser();
    if (!user) return;
    let profileImageURL = profileImage;
    if (profileImageFile) {
      const fileExtension = profileImageFile.name.split(".").pop();
      const generateRandomFilename = (extension: string) => {
        const randomString = Math.random().toString(36).substring(2, 15);
        return `${randomString}.${extension}`;
      };
      const randomFilename = generateRandomFilename(fileExtension || "");
      const { error: storageError } = await supabase.storage
        .from("profile-images")
        .upload(
          `public/${(await user).data.user?.id}/${randomFilename}`,
          profileImageFile
        );
      if (storageError) {
        console.error("Error uploading profile image:", storageError);
        return;
      }
      const { data: publicUrlData } = await supabase.storage
        .from("profile-images")
        .getPublicUrl(
          `public/${(await user).data.user?.id}/${randomFilename}`
        );
      profileImageURL = publicUrlData?.publicUrl;
    }

    const { error } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        profile_image: profileImageURL,
      })
      .eq("id", (await user).data.user?.id)
      .single();
    if (error) {
      console.error("Error updating user profile:", error);
      return;
    }
    setSuccessMessage("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="px-20 py-40 min-h-screen">
      {!isLoaded && (
        <div className="toast bg-error bottom-5 right-5">
          User not found. Please login again.
        </div>
      )}
      {isLoaded && user && (
        <>
          {successMessage && (
            <div className="toast toast-success">{successMessage}</div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-3xl font-opunbold">Profile</h1>
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-outline btn-xs"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-neutral btn-xs"
              >
                Edit Profile
              </button>
            )}
          </div>
          {user && isEditing && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
              <div>
                <label className="block mb-2">Profile Image</label>

                <img
                  src={profileImagePreview??""}
                  alt="Profile Preview"
                  className="w-60 h-60 object-cover rounded-full border bg-slate-200 mb-5"
                />
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfileImageFile(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setProfileImagePreview(null);
                    }
                  }}
                  className="file-input file-input-bordered w-full"
                />
              </div>
              <div>
                <label className="block mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <p>{email}</p>
              </div>
              <button type="submit" className="btn btn-neutral">
                Update Profile
              </button>
            </form>
          )}
          {user && !isEditing && (
            <div className="mb-8">
              <div className="flex gap-2 items-center mb-4">
                {profileImage ? (
                  <img
                    src={profileImage ?? ""}
                    alt="Profile"
                    className="w-60 h-60 bg-slate-200 rounded-full"
                  />
                ) : (
                  <p>No profile image available.</p>
                )}
              </div>
              <div className="flex gap-2">
                <span className="font-opunbold text-xl">First Name: </span>
                <p className="text-lg">{firstName}</p>
              </div>
              <div className="flex gap-2">
                <span className="font-opunbold text-xl">Last Name: </span>
                <p className="text-lg">{lastName}</p>
              </div>
              <div className="flex gap-2">
                <span className="font-opunbold text-xl">Email: </span>
                <p className="text-lg">{email}</p>
              </div>
            </div>
          )}
          <div className="mb-8">
            <h2 className="text-2xl font-opunbold mb-4">Purchase History</h2>
            {/* Render purchase history here */}
            {purchaseHistory.length > 0 ? (
              <ul>
                {purchaseHistory.map((purchase, index) => (
                  <li key={index}>{purchase}</li>
                ))}
              </ul>
            ) : (
              <p>No purchase history available.</p>
            )}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-opunbold mb-4">Payment Method</h2>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Add payment method"
            />
            <button className="btn btn-neutral mt-4">
              Save Payment Method
            </button>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Profile;
